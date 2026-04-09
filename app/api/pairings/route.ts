import { NextResponse } from "next/server";
import { trackFirstRunMilestone } from "@/lib/admin";
import { getCurrentUserId } from "@/lib/auth";
import { createPairing, getPairingsData } from "@/lib/db";
import { reportRequestEvent } from "@/lib/monitoring";
import {
  getClientErrorMessage,
  getErrorStatus,
  logServerError,
  readBoolean,
  readJsonObject,
  readString,
  readStringArray,
  validateAuthenticatedMutation,
} from "@/lib/security";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getPairingsData(userId);
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

    const pairing = await createPairing(userId, {
      name: readString(body, "name", { required: true, maxLength: 120 }),
      sireId: readString(body, "sireId", { required: true, maxLength: 40 }),
      damId: readString(body, "damId", { required: true, maxLength: 40 }),
      goals: readString(body, "goals", { maxLength: 500 }),
      targetTraits: readStringArray(body, "targetTraits", { maxItems: 12, maxItemLength: 80 }),
      avoidTraits: readStringArray(body, "avoidTraits", { maxItems: 12, maxItemLength: 80 }),
      projectGoal: readString(body, "projectGoal", { maxLength: 500 }),
      notes: readString(body, "notes", { maxLength: 2000 }),
      active: readBoolean(body, "active", true),
    });

    await trackFirstRunMilestone(userId, "first_pairing_created");

    return NextResponse.json({ pairing });
  } catch (error) {
    const status = getErrorStatus(error);
    if (status >= 500) {
      logServerError("pairings.create", error);
      await reportRequestEvent(request, {
        level: "error",
        source: "pairings",
        eventType: "create_failed",
        message: "Pairing creation failed.",
        error,
      });
    }
    return NextResponse.json({ error: getClientErrorMessage(error, "Unable to create pairing.") }, { status });
  }
}
