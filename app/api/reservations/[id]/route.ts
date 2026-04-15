import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { deleteReservation, updateReservation } from "@/lib/db";
import { reportRequestEvent } from "@/lib/monitoring";
import {
  getClientErrorMessage,
  getErrorStatus,
  logServerError,
  readEnum,
  readJsonObject,
  readNumber,
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
    const params = await context.params;

    const reservation = await updateReservation(userId, params.id, {
      requestedSex: readString(body, "requestedSex", { maxLength: 80 }),
      requestedBreed: readString(body, "requestedBreed", { required: true, maxLength: 120 }),
      requestedVariety: readString(body, "requestedVariety", { maxLength: 120 }),
      requestedColor: readString(body, "requestedColor", { maxLength: 120 }),
      quantity: readNumber(body, "quantity", { required: true, min: 1, max: 1000 }),
      status: readEnum(body, "status", ["Waiting", "Matched", "Completed", "Cancelled"] as const, {
        required: true,
      }),
      notes: readString(body, "notes", { maxLength: 2000 }),
    });

    return NextResponse.json({ reservation });
  } catch (error) {
    const status = getErrorStatus(error);
    if (status >= 500) {
      logServerError("reservations.update", error);
      await reportRequestEvent(request, {
        level: "error",
        source: "reservations",
        eventType: "update_failed",
        message: "Reservation update failed.",
        error,
      });
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to update reservation.") },
      { status },
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    validateAuthenticatedMutation(request);
    const params = await context.params;

    await deleteReservation(userId, params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    const status = getErrorStatus(error);
    if (status >= 500) {
      logServerError("reservations.delete", error);
      await reportRequestEvent(request, {
        level: "error",
        source: "reservations",
        eventType: "delete_failed",
        message: "Reservation delete failed.",
        error,
      });
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to remove reservation.") },
      { status },
    );
  }
}
