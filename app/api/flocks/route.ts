import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createFlock, getFlocksData } from "@/lib/db";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const flocks = await getFlocksData(userId);
  return NextResponse.json({ flocks });
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const flock = await createFlock(userId, {
    name: body.name,
    breed: body.breed,
    variety: body.variety,
    notes: body.notes || "",
    active: body.active ?? true,
  });

  return NextResponse.json({ flock });
}
