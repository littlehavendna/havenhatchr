import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createTrait, getTraitsData } from "@/lib/db";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const traits = await getTraitsData(userId);
  return NextResponse.json({ traits });
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const trait = await createTrait(userId, {
    name: body.name,
    category: body.category,
    description: body.description,
  });

  return NextResponse.json({
    trait: {
      id: trait.id,
      name: trait.name,
      category: trait.category,
      description: trait.description,
    },
  });
}
