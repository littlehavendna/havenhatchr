import { NextResponse } from "next/server";
import { createReservation, getReservationsData } from "@/lib/db";

export async function GET() {
  const data = await getReservationsData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();

  const reservation = await createReservation({
    customerId: body.customerId,
    requestedSex: body.requestedSex || "No Preference",
    requestedBreed: body.requestedBreed,
    requestedVariety: body.requestedVariety || "Any Variety",
    requestedColor: body.requestedColor || "Any Color",
    quantity: body.quantity,
    status: body.status,
    notes: body.notes || "-",
  });

  return NextResponse.json({ reservation });
}
