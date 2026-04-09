import { NextResponse } from "next/server";
import { requireCurrentUser } from "@/lib/auth";
import { createFeedback } from "@/lib/db";
import { reportRequestEvent } from "@/lib/monitoring";
import {
  getClientErrorMessage,
  getErrorStatus,
  logServerError,
  readEnum,
  readJsonObject,
  readString,
  validateAuthenticatedMutation,
} from "@/lib/security";

const FEEDBACK_TYPES = ["Bug", "FeatureRequest", "GeneralFeedback"] as const;

export async function POST(request: Request) {
  try {
    validateAuthenticatedMutation(request, {
      rateLimitKey: "feedback:create",
      limit: 8,
      windowMs: 1000 * 60 * 10,
    });

    const user = await requireCurrentUser();
    const body = await readJsonObject(request);

    const feedback = await createFeedback(user.id, {
      type: readEnum(body, "type", FEEDBACK_TYPES, { required: true }),
      message: readString(body, "message", { required: true, minLength: 3, maxLength: 4000 }),
      page: readString(body, "page", { required: true, maxLength: 240 }),
    });

    return NextResponse.json({ feedback });
  } catch (error) {
    const status = getErrorStatus(error);
    if (status >= 500) {
      logServerError("feedback.create", error);
      await reportRequestEvent(request, {
        level: "error",
        source: "feedback",
        eventType: "create_failed",
        message: "Feedback submission failed.",
        error,
      });
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to submit feedback.") },
      { status },
    );
  }
}
