import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getChickProfileData, updateChick } from "@/lib/db";
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

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const data = await getChickProfileData(userId, id);

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    validateAuthenticatedMutation(request);
    const body = await readJsonObject(request);
    const { id } = await context.params;

    const chick = await updateChick(userId, id, {
      bandNumber: readString(body, "bandNumber", { required: true, maxLength: 80 }),
      hatchDate: readIsoDateString(body, "hatchDate", { required: true }),
      flockId: readString(body, "flockId", { required: true, maxLength: 40 }),
      hatchGroupId: readString(body, "hatchGroupId", { maxLength: 40 }) || undefined,
      status: readEnum(body, "status", ["Available", "Reserved", "Sold", "Holdback", "Deceased"] as const, {
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

    return NextResponse.json({ chick });
  } catch (error) {
    const status = getErrorStatus(error);
    if (status >= 500) {
      logServerError("chicks.update", error);
    }
    return NextResponse.json({ error: getClientErrorMessage(error, "Unable to update chick.") }, { status });
  }
}
