import { NextResponse } from "next/server";
import { logUsageEvent } from "@/lib/admin";
import { requireCurrentUser } from "@/lib/auth";
import { reportRequestEvent } from "@/lib/monitoring";
import { prisma } from "@/lib/prisma";
import {
  getClientErrorMessage,
  getErrorStatus,
  logServerError,
  readEnum,
  readJsonObject,
  validateAuthenticatedMutation,
} from "@/lib/security";

export async function POST(request: Request) {
  try {
    validateAuthenticatedMutation(request, {
      rateLimitKey: "onboarding",
      limit: 20,
      windowMs: 1000 * 60 * 10,
    });

    const user = await requireCurrentUser();
    const body = await readJsonObject(request);
    const action = readEnum(body, "action", ["complete", "skip", "restart"] as const, {
      required: true,
    });

    if (action === "complete") {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          hasCompletedTutorial: true,
          hasSkippedTutorial: false,
          tutorialCompletedAt: new Date(),
        },
      });
      await logUsageEvent({
        userId: user.id,
        eventType: "beta.completed_tutorial",
        route: "/api/onboarding",
      });
    }

    if (action === "skip") {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          hasSkippedTutorial: true,
        },
      });
      await logUsageEvent({
        userId: user.id,
        eventType: "beta.skipped_tutorial",
        route: "/api/onboarding",
      });
    }

    if (action === "restart") {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          hasCompletedTutorial: false,
          hasSkippedTutorial: false,
          tutorialCompletedAt: null,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = getErrorStatus(error);

    if (status >= 500) {
      logServerError("onboarding", error);
      await reportRequestEvent(request, {
        level: "error",
        source: "onboarding",
        eventType: "tutorial_update_failed",
        message: "Tutorial state update failed.",
        userId: undefined,
        error,
      });
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to update onboarding.") },
      { status },
    );
  }
}
