import { NextResponse } from "next/server";
import { trackFirstRunMilestone } from "@/lib/admin";
import { getCurrentUserId } from "@/lib/auth";
import { createBird, getBirdsData } from "@/lib/db";
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

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getBirdsData(userId);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    validateAuthenticatedMutation(request);
    const body = await readJsonObject(request);

    const bird = await createBird(userId, {
      name: readString(body, "name", { required: true, maxLength: 120 }),
      bandNumber: readString(body, "bandNumber", { required: true, maxLength: 80 }),
      sex: readEnum(body, "sex", ["Male", "Female", "Unknown"] as const, { required: true }),
      breed: readString(body, "breed", { maxLength: 120 }),
      variety: readString(body, "variety", { maxLength: 120 }),
      color: readString(body, "color", { maxLength: 120 }),
      flockId: readString(body, "flockId", { required: true, maxLength: 40 }),
      status: readEnum(body, "status", ["Active", "Holdback", "Retired", "Sold"] as const, {
        required: true,
      }),
      notes: readString(body, "notes", { maxLength: 2000 }),
    });

    await trackFirstRunMilestone(userId, "first_bird_created");

    return NextResponse.json({ bird });
  } catch (error) {
    const status = getErrorStatus(error);
    if (status >= 500) {
      logServerError("birds.create", error);
      await reportRequestEvent(request, {
        level: "error",
        source: "birds",
        eventType: "create_failed",
        message: "Bird creation failed.",
        error,
      });
    }
    return NextResponse.json({ error: getClientErrorMessage(error, "Unable to create bird.") }, { status });
  }
}
