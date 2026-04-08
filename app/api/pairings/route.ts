import { NextResponse } from "next/server";
import { createPairing, getPairingsData } from "@/lib/db";

export async function GET() {
  const data = await getPairingsData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();

  const pairing = await createPairing({
    name: body.name,
    sireId: body.sireId,
    damId: body.damId,
    goals: body.goals || "-",
    targetTraits: body.targetTraits || [],
    avoidTraits: body.avoidTraits || [],
    projectGoal: body.projectGoal || "-",
    notes: body.notes || "-",
    active: body.active ?? true,
  });

  return NextResponse.json({ pairing });
}
