import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createHatchGroup, getHatchGroupsData } from "@/lib/db";
import { reportRequestEvent } from "@/lib/monitoring";
import {
  getClientErrorMessage,
  getErrorStatus,
  logServerError,
  readIsoDateString,
  readJsonObject,
  readNumber,
  readString,
  validateAuthenticatedMutation,
} from "@/lib/security";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getHatchGroupsData(userId);
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

    const hatchGroup = await createHatchGroup(userId, {
      name: readString(body, "name", { required: true, maxLength: 120 }),
      pairingId: readString(body, "pairingId", { required: true, maxLength: 40 }),
      setDate: readIsoDateString(body, "setDate", { required: true }),
      hatchDate: readIsoDateString(body, "hatchDate", { required: true }),
      eggsSet: readNumber(body, "eggsSet", { min: 0, max: 10000, defaultValue: 0 }),
      eggsHatched: readNumber(body, "eggsHatched", { min: 0, max: 10000, defaultValue: 0 }),
      producedTraitsSummary: readString(body, "producedTraitsSummary", { maxLength: 500 }),
      notes: readString(body, "notes", { maxLength: 2000 }),
    });

    return NextResponse.json({ hatchGroup });
  } catch (error) {
    const status = getErrorStatus(error);
    if (status >= 500) {
      logServerError("hatch-groups.create", error);
      await reportRequestEvent(request, {
        level: "error",
        source: "hatch-groups",
        eventType: "create_failed",
        message: "Hatch group creation failed.",
        error,
      });
    }
    return NextResponse.json({ error: getClientErrorMessage(error, "Unable to create hatch group.") }, { status });
  }
}
