import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { updateEggSaleLocation } from "@/lib/db";
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

    const location = await updateEggSaleLocation(userId, id, {
      name: readString(body, "name", { required: true, maxLength: 80 }),
      description: readString(body, "description", { maxLength: 300 }),
      isActive: readBoolean(body, "isActive", true),
    });

    return NextResponse.json({ location });
  } catch (error) {
    const status = getErrorStatus(error);
    if (status >= 500) {
      logServerError("egg-sales.locations.update", error);
      await reportRequestEvent(request, {
        level: "error",
        source: "egg-sales-locations",
        eventType: "update_failed",
        message: "Egg sale location update failed.",
        error,
      });
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to update egg sale location.") },
      { status },
    );
  }
}
