import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createReservation, getReservationsData } from "@/lib/db";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getReservationsData(userId);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const reservation = await createReservation(userId, {
    customerId: body.customerId,
    requestedSex: body.requestedSex || "",
    requestedBreed: body.requestedBreed,
    requestedVariety: body.requestedVariety || "",
    requestedColor: body.requestedColor || "",
    quantity: body.quantity,
    status: body.status,
    notes: body.notes || "",
  });

  return NextResponse.json({ reservation });
}
