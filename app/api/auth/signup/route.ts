import { NextResponse } from "next/server";
import { logUsageEvent } from "@/lib/admin";
import { authUserSelect, createSession, hashPassword } from "@/lib/auth";
import { reportRequestEvent } from "@/lib/monitoring";
import { prisma } from "@/lib/prisma";
import {
  enforceRateLimit,
  getClientErrorMessage,
  getErrorStatus,
  logServerError,
  readJsonObject,
  readString,
  validateAuthenticatedMutation,
} from "@/lib/security";

export async function POST(request: Request) {
  try {
    validateAuthenticatedMutation(request);
    enforceRateLimit(request, "auth:signup", { limit: 5, windowMs: 1000 * 60 * 15 });

    const body = await readJsonObject(request);
    const name = readString(body, "name", {
      required: true,
      minLength: 2,
      maxLength: 120,
    });
    const email = readString(body, "email", {
      required: true,
      maxLength: 320,
    }).toLowerCase();
    const password = readString(body, "password", {
      required: true,
      trim: false,
      minLength: 8,
      maxLength: 256,
    });

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      await reportRequestEvent(request, {
        level: "warn",
        source: "auth",
        eventType: "signup_failed",
        message: "Signup blocked because email already exists.",
        metadata: { reason: "email_exists" },
      });
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
        plan: "starter",
      },
      select: authUserSelect,
    });

    await createSession(user.id);
    await logUsageEvent({
      userId: user.id,
      eventType: "auth.signup",
      route: "/signup",
      metadata: { source: "credentials" },
    });
    await logUsageEvent({
      userId: user.id,
      eventType: "beta.completed_signup",
      route: "/signup",
      metadata: { source: "credentials" },
    });
    await reportRequestEvent(request, {
      level: "info",
      source: "auth",
      eventType: "signup_completed",
      message: "New account created successfully.",
      userId: user.id,
      metadata: { plan: user.plan },
      persist: false,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        isBetaUser: user.isBetaUser,
      },
    });
  } catch (error) {
    const status = getErrorStatus(error);

    if (status >= 500) {
      logServerError("auth.signup", error);
      await reportRequestEvent(request, {
        level: "error",
        source: "auth",
        eventType: "signup_error",
        message: "Signup request failed unexpectedly.",
        error,
      });
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to create your account.") },
      { status },
    );
  }
}
