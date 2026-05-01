import { NextResponse } from "next/server";
import { createPasswordResetLink, sendPasswordResetEmail } from "@/lib/password-reset";
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
    enforceRateLimit(request, "auth:password-reset-request", {
      limit: 5,
      windowMs: 1000 * 60 * 15,
    });

    const body = await readJsonObject(request);
    const email = readString(body, "email", {
      required: true,
      maxLength: 320,
    }).toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, accountDisabledAt: true },
    });

    let resetUrl = "";
    let emailSent = false;

    if (user && !user.accountDisabledAt) {
      resetUrl = await createPasswordResetLink(request, user);
      const result = await sendPasswordResetEmail(user.email, resetUrl);
      emailSent = result.sent;
    }

    return NextResponse.json({
      ok: true,
      message: "If that email has an account, a password reset link will be sent.",
      emailSent,
      resetUrl: process.env.NODE_ENV === "development" ? resetUrl : undefined,
    });
  } catch (error) {
    const status = getErrorStatus(error);

    if (status >= 500) {
      logServerError("auth.password-reset.request", error);
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to request password reset.") },
      { status },
    );
  }
}
