import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { getFeedbackData, updateFeedbackStatus } from "@/lib/admin";
import {
  getClientErrorMessage,
  getErrorStatus,
  logServerError,
  readEnum,
  readJsonObject,
  readString,
  validateAuthenticatedMutation,
} from "@/lib/security";

const MUTATION_STATUSES = ["Open", "InProgress", "Resolved"] as const;
type FeedbackFilterType = "Bug" | "FeatureRequest" | "GeneralFeedback" | "All";
type FeedbackFilterStatus = "Open" | "InProgress" | "Resolved" | "All";

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser();
    const type = (request.nextUrl.searchParams.get("type") ?? "All") as FeedbackFilterType;
    const status = (request.nextUrl.searchParams.get("status") ?? "All") as FeedbackFilterStatus;
    const data = await getFeedbackData({ type, status });
    return NextResponse.json({ feedback: data });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

export async function PUT(request: Request) {
  try {
    validateAuthenticatedMutation(request, {
      rateLimitKey: "admin:feedback:update",
      limit: 20,
      windowMs: 1000 * 60 * 10,
    });

    const adminUser = await requireAdminUser();
    const body = await readJsonObject(request);

    const feedback = await updateFeedbackStatus(
      adminUser.id,
      readString(body, "id", { required: true, maxLength: 40 }),
      readEnum(body, "status", MUTATION_STATUSES, { required: true }),
    );

    return NextResponse.json({ feedback });
  } catch (error) {
    const status = getErrorStatus(error);

    if (status >= 500) {
      logServerError("admin.feedback.update", error);
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to update feedback.") },
      { status },
    );
  }
}
