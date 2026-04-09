import { NextResponse } from "next/server";
import { trackFirstRunMilestone } from "@/lib/admin";
import { getCurrentUserId } from "@/lib/auth";
import { createFlock, getFlocksData } from "@/lib/db";
import { reportRequestEvent } from "@/lib/monitoring";
import {
  getClientErrorMessage,
  getErrorStatus,
  logServerError,
  readBoolean,
  readJsonObject,
  readString,
  validateAuthenticatedMutation,
} from "@/lib/security";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const flocks = await getFlocksData(userId);
  return NextResponse.json({ flocks });
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    validateAuthenticatedMutation(request);
    const body = await readJsonObject(request);

    const flock = await createFlock(userId, {
      name: readString(body, "name", { required: true, maxLength: 120 }),
      breed: readString(body, "breed", { maxLength: 120 }),
      variety: readString(body, "variety", { maxLength: 120 }),
      notes: readString(body, "notes", { maxLength: 2000 }),
      active: readBoolean(body, "active", true),
    });

    await trackFirstRunMilestone(userId, "first_flock_created");

    return NextResponse.json({ flock });
  } catch (error) {
    const status = getErrorStatus(error);
    if (status >= 500) {
      logServerError("flocks.create", error);
      await reportRequestEvent(request, {
        level: "error",
        source: "flocks",
        eventType: "create_failed",
        message: "Flock creation failed.",
        error,
      });
    }
    return NextResponse.json({ error: getClientErrorMessage(error, "Unable to create flock.") }, { status });
  }
}
