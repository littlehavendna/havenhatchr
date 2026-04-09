import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createTrait, getTraitsData } from "@/lib/db";
import { readJsonObject, readString, validateAuthenticatedMutation } from "@/lib/security";

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

  validateAuthenticatedMutation(request);
  const body = await readJsonObject(request);

  const trait = await createTrait(userId, {
    name: readString(body, "name", { required: true, maxLength: 120 }),
    category: readString(body, "category", { maxLength: 120 }),
    description: readString(body, "description", { maxLength: 1000 }),
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
