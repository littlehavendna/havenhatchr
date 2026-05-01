import { NextResponse } from "next/server";
import { createSession, hashPassword } from "@/lib/auth";
import { consumePasswordResetToken } from "@/lib/password-reset";
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
    enforceRateLimit(request, "auth:password-reset-confirm", {
      limit: 8,
      windowMs: 1000 * 60 * 15,
    });

    const body = await readJsonObject(request);
    const token = readString(body, "token", {
      required: true,
      maxLength: 128,
    });
    const password = readString(body, "password", {
      required: true,
      trim: false,
      minLength: 8,
      maxLength: 256,
    });

    const reset = await consumePasswordResetToken(token);

    if (!reset) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired." },
        { status: 400 },
      );
    }

    const user = await prisma.user.update({
      where: { id: reset.userId },
      data: {
        passwordHash: await hashPassword(password),
        sessions: {
          deleteMany: {},
        },
      },
      select: { id: true, email: true },
    });

    await createSession(user.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = getErrorStatus(error);

    if (status >= 500) {
      logServerError("auth.password-reset.confirm", error);
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to reset password.") },
      { status },
    );
  }
}
