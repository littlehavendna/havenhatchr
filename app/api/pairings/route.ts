import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createPairing, getPairingsData } from "@/lib/db";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getPairingsData(userId);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const pairing = await createPairing(userId, {
    name: body.name,
    sireId: body.sireId,
    damId: body.damId,
    goals: body.goals || "",
    targetTraits: body.targetTraits || [],
    avoidTraits: body.avoidTraits || [],
    projectGoal: body.projectGoal || "",
    notes: body.notes || "",
    active: body.active ?? true,
  });

  return NextResponse.json({ pairing });
}
