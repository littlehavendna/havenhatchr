import { NextResponse } from "next/server";
import { createBird, getBirdsData } from "@/lib/db";

export async function GET() {
  const data = await getBirdsData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();

  const bird = await createBird({
    name: body.name,
    bandNumber: body.bandNumber,
    sex: body.sex,
    breed: body.breed,
    variety: body.variety,
    color: body.color,
    flockId: body.flockId,
    status: body.status,
    notes: body.notes || "-",
  });

  return NextResponse.json({ bird });
}
