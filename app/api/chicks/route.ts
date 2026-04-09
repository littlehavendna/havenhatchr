import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createChick, getChicksData } from "@/lib/db";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getChicksData(userId);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const chick = await createChick(userId, {
    bandNumber: body.bandNumber,
    hatchDate: body.hatchDate,
    flockId: body.flockId,
    hatchGroupId: body.hatchGroupId,
    status: body.status,
    sex: body.sex,
    color: body.color || "",
    observedTraits: body.observedTraits || [],
    notes: body.notes || "",
  });

  return NextResponse.json({ chick });
}
