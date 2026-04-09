import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createHatchGroup, getHatchGroupsData } from "@/lib/db";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getHatchGroupsData(userId);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const hatchGroup = await createHatchGroup(userId, {
    name: body.name,
    pairingId: body.pairingId,
    setDate: body.setDate,
    hatchDate: body.hatchDate,
    eggsSet: body.eggsSet ?? 0,
    eggsHatched: body.eggsHatched ?? 0,
    producedTraitsSummary: body.producedTraitsSummary || "",
    notes: body.notes || "",
  });

  return NextResponse.json({ hatchGroup });
}
