import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createChickDeathRecord } from "@/lib/db";
import { reportRequestEvent } from "@/lib/monitoring";
import {
  getClientErrorMessage,
  getErrorStatus,
  logServerError,
  readEnum,
  readIsoDateString,
  readJsonObject,
  readString,
  validateAuthenticatedMutation,
} from "@/lib/security";

const deathReasons = [
  "FailureToThrive",
  "ShippedWeak",
  "SplayLeg",
  "Injury",
  "Predator",
  "UnabsorbedYolk",
  "AssistedHatchComplications",
  "Unknown",
  "Other",
] as const;

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    validateAuthenticatedMutation(request);
    const body = await readJsonObject(request);

    const deathRecord = await createChickDeathRecord(userId, {
      chickId: readString(body, "chickId", { required: true, maxLength: 40 }),
      deathDate: readIsoDateString(body, "deathDate", { required: true }),
      deathReason: readEnum(body, "deathReason", deathReasons, { required: true }),
      notes: readString(body, "notes", { maxLength: 2000 }),
    });

    return NextResponse.json({ deathRecord });
  } catch (error) {
    const status = getErrorStatus(error);
    if (status >= 500) {
      logServerError("chicks.create-death-record", error);
      await reportRequestEvent(request, {
        level: "error",
        source: "chicks",
        eventType: "create_death_record_failed",
        message: "Chick death logging failed.",
        error,
      });
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to log chick death.") },
      { status },
    );
  }
}
