import { NextResponse } from "next/server";
import { logUsageEvent } from "@/lib/admin";
import { createSession, verifyPassword } from "@/lib/auth";
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
    enforceRateLimit(request, "auth:login", { limit: 8, windowMs: 1000 * 60 * 10 });

    const body = await readJsonObject(request);
    const email = readString(body, "email", {
      required: true,
      maxLength: 320,
    }).toLowerCase();
    const password = readString(body, "password", {
      required: true,
      trim: false,
      maxLength: 256,
    });

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      await reportRequestEvent(request, {
        level: "warn",
        source: "auth",
        eventType: "login_failed",
        message: "Credential login failed.",
        metadata: { reason: "invalid_credentials" },
      });
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (user.accountDisabledAt) {
      await reportRequestEvent(request, {
        level: "warn",
        source: "auth",
        eventType: "login_blocked",
        message: "Login blocked for disabled account.",
        userId: user.id,
        metadata: { reason: "account_disabled" },
      });
      return NextResponse.json({ error: "This account has been disabled." }, { status: 403 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
      },
    });

    await createSession(user.id);
    await logUsageEvent({
      userId: user.id,
      eventType: "auth.login",
      route: "/login",
      metadata: { source: "credentials" },
    });
    await reportRequestEvent(request, {
      level: "info",
      source: "auth",
      eventType: "login_succeeded",
      message: "Credential login succeeded.",
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
      logServerError("auth.login", error);
      await reportRequestEvent(request, {
        level: "error",
        source: "auth",
        eventType: "login_error",
        message: "Login request failed unexpectedly.",
        error,
      });
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to log in.") },
      { status },
    );
  }
}
