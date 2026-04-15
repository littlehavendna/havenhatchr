import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
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
import { updateIncubator } from "@/lib/db";

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
    const params = await context.params;

    const incubator = await updateIncubator(userId, params.id, {
      name: readString(body, "name", { required: true, maxLength: 120 }),
      brand: readString(body, "brand", { maxLength: 120 }),
      model: readString(body, "model", { maxLength: 120 }),
      notes: readString(body, "notes", { maxLength: 2000 }),
      active: readBoolean(body, "active", true),
    });

    return NextResponse.json({ incubator });
  } catch (error) {
    const status = getErrorStatus(error);
    if (status >= 500) {
      logServerError("incubation.update-incubator", error);
      await reportRequestEvent(request, {
        level: "error",
        source: "incubation",
        eventType: "update_incubator_failed",
        message: "Incubator update failed.",
        error,
      });
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to update incubator.") },
      { status },
    );
  }
}
