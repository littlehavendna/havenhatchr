import { NextResponse } from "next/server";
import { createFlock, getFlocksData } from "@/lib/db";

export async function GET() {
  const flocks = await getFlocksData();
  return NextResponse.json({ flocks });
}

export async function POST(request: Request) {
  const body = await request.json();

  const flock = await createFlock({
    name: body.name,
    breed: body.breed,
    variety: body.variety,
    notes: body.notes || "-",
    active: body.active ?? true,
  });

  return NextResponse.json({ flock });
}
