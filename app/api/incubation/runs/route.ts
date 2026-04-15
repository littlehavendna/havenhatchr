import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createIncubatorRun, updateIncubatorRun } from "@/lib/db";
import { reportRequestEvent } from "@/lib/monitoring";
import {
  getClientErrorMessage,
  getErrorStatus,
  logServerError,
  readIsoDateString,
  readJsonObject,
  readString,
  validateAuthenticatedMutation,
} from "@/lib/security";

function readRunPayload(body: Record<string, unknown>) {
  return {
    incubatorId: readString(body, "incubatorId", { required: true, maxLength: 40 }),
    hatchGroupId: readString(body, "hatchGroupId", { required: true, maxLength: 40 }),
    startDate: readIsoDateString(body, "startDate", { required: true }),
    lockdownDate: readIsoDateString(body, "lockdownDate", { required: true }),
    expectedHatchDate: readIsoDateString(body, "expectedHatchDate", { required: true }),
    temperatureNotes: readString(body, "temperatureNotes", { maxLength: 2000 }),
    humidityNotes: readString(body, "humidityNotes", { maxLength: 2000 }),
    turningNotes: readString(body, "turningNotes", { maxLength: 2000 }),
    lockdownHumidityNotes: readString(body, "lockdownHumidityNotes", { maxLength: 2000 }),
    specialAdjustments: readString(body, "specialAdjustments", { maxLength: 2000 }),
    generalNotes: readString(body, "generalNotes", { maxLength: 2000 }),
  };
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    validateAuthenticatedMutation(request);
    const body = await readJsonObject(request);
    const run = await createIncubatorRun(userId, readRunPayload(body));
    return NextResponse.json({ run });
  } catch (error) {
    const status = getErrorStatus(error);
    if (status >= 500) {
      logServerError("incubation.create-run", error);
      await reportRequestEvent(request, {
        level: "error",
        source: "incubation",
        eventType: "create_run_failed",
        message: "Incubator run creation failed.",
        error,
      });
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to create incubator run.") },
      { status },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    validateAuthenticatedMutation(request);
    const body = await readJsonObject(request);
    const run = await updateIncubatorRun(
      userId,
      readString(body, "id", { required: true, maxLength: 40 }),
      readRunPayload(body),
    );

    return NextResponse.json({ run });
  } catch (error) {
    const status = getErrorStatus(error);
    if (status >= 500) {
      logServerError("incubation.update-run", error);
      await reportRequestEvent(request, {
        level: "error",
        source: "incubation",
        eventType: "update_run_failed",
        message: "Incubator run update failed.",
        error,
      });
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to update incubator run.") },
      { status },
    );
  }
}
