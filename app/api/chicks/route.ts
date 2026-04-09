import { NextResponse } from "next/server";
import { trackFirstRunMilestone } from "@/lib/admin";
import { getCurrentUserId } from "@/lib/auth";
import { createChick, getChicksData } from "@/lib/db";
import { reportRequestEvent } from "@/lib/monitoring";
import {
  getClientErrorMessage,
  getErrorStatus,
  logServerError,
  readEnum,
  readIsoDateString,
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

  const data = await getChicksData(userId);
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

    const chick = await createChick(userId, {
      bandNumber: readString(body, "bandNumber", { required: true, maxLength: 80 }),
      hatchDate: readIsoDateString(body, "hatchDate", { required: true }),
      flockId: readString(body, "flockId", { required: true, maxLength: 40 }),
      hatchGroupId: readString(body, "hatchGroupId", { maxLength: 40 }) || undefined,
      status: readEnum(body, "status", ["Available", "Reserved", "Sold", "Holdback"] as const, {
        required: true,
      }),
      sex: readEnum(body, "sex", ["Male", "Female", "Unknown"] as const, { required: true }),
      color: readString(body, "color", { maxLength: 120 }),
      observedTraits: readStringArray(body, "observedTraits", {
        maxItems: 12,
        maxItemLength: 80,
      }),
      notes: readString(body, "notes", { maxLength: 2000 }),
    });

    await trackFirstRunMilestone(userId, "first_chick_created");

    return NextResponse.json({ chick });
  } catch (error) {
    const status = getErrorStatus(error);
    if (status >= 500) {
      logServerError("chicks.create", error);
      await reportRequestEvent(request, {
        level: "error",
        source: "chicks",
        eventType: "create_failed",
        message: "Chick creation failed.",
        error,
      });
    }
    return NextResponse.json({ error: getClientErrorMessage(error, "Unable to create chick.") }, { status });
  }
}
