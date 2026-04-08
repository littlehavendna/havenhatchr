import { NextResponse } from "next/server";
import { createHatchGroup, getHatchGroupsData } from "@/lib/db";

export async function GET() {
  const data = await getHatchGroupsData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();

  const hatchGroup = await createHatchGroup({
    name: body.name,
    pairingId: body.pairingId,
    setDate: body.setDate,
    hatchDate: body.hatchDate,
    eggsSet: body.eggsSet ?? 0,
    eggsHatched: body.eggsHatched ?? 0,
    producedTraitsSummary: body.producedTraitsSummary || "Traits still being evaluated.",
    notes: body.notes || "-",
  });

  return NextResponse.json({ hatchGroup });
}
