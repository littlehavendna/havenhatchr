import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createBird, getBirdsData } from "@/lib/db";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getBirdsData(userId);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const bird = await createBird(userId, {
    name: body.name,
    bandNumber: body.bandNumber,
    sex: body.sex,
    breed: body.breed,
    variety: body.variety,
    color: body.color,
    flockId: body.flockId,
    status: body.status,
    notes: body.notes || "",
  });

  return NextResponse.json({ bird });
}
