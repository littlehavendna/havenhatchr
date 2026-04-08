import { NextResponse } from "next/server";
import { createChick, getChicksData } from "@/lib/db";

export async function GET() {
  const data = await getChicksData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();

  const chick = await createChick({
    bandNumber: body.bandNumber,
    hatchDate: body.hatchDate,
    flockId: body.flockId,
    hatchGroupId: body.hatchGroupId,
    status: body.status,
    sex: body.sex,
    color: body.color || "Unspecified",
    observedTraits: body.observedTraits || [],
    notes: body.notes || "-",
  });

  return NextResponse.json({ chick });
}
