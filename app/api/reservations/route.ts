import { NextResponse } from "next/server";
import { trackFirstRunMilestone } from "@/lib/admin";
import { getCurrentUserId } from "@/lib/auth";
import { createReservation, getReservationsData } from "@/lib/db";
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

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getReservationsData(userId);
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

    const reservation = await createReservation(userId, {
      customerId: readString(body, "customerId", { required: true, maxLength: 40 }),
      requestedSex: readString(body, "requestedSex", { maxLength: 80 }),
      requestedBreed: readString(body, "requestedBreed", { maxLength: 120 }),
      requestedVariety: readString(body, "requestedVariety", { maxLength: 120 }),
      requestedColor: readString(body, "requestedColor", { maxLength: 120 }),
      quantity: readNumber(body, "quantity", { required: true, min: 1, max: 1000 }),
      status: readEnum(body, "status", ["Waiting", "Matched", "Completed", "Cancelled"] as const, {
        required: true,
      }),
      notes: readString(body, "notes", { maxLength: 2000 }),
    });

    await trackFirstRunMilestone(userId, "first_reservation_created");

    return NextResponse.json({ reservation });
  } catch (error) {
    const status = getErrorStatus(error);
    if (status >= 500) {
      logServerError("reservations.create", error);
      await reportRequestEvent(request, {
        level: "error",
        source: "reservations",
        eventType: "create_failed",
        message: "Reservation creation failed.",
        error,
      });
    }
    return NextResponse.json({ error: getClientErrorMessage(error, "Unable to create reservation.") }, { status });
  }
}
