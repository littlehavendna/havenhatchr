import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createBirdNote, getBirdProfileData, updateBirdGenetics } from "@/lib/db";
import { readJsonObject, readString, readStringArray, validateAuthenticatedMutation } from "@/lib/security";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const data = await getBirdProfileData(userId, id);

  if (!data) {
    return NextResponse.json({ error: "Bird not found." }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request, context: RouteContext) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  validateAuthenticatedMutation(request);
  const { id } = await context.params;
  const body = await readJsonObject(request);
  const content = readString(body, "content", { required: true, maxLength: 2000 });

  const note = await createBirdNote(userId, id, content);

  return NextResponse.json({
    note: {
      id: note.id,
      entityType: note.entityType,
      entityId: note.entityId,
      content: note.content,
      createdAt: note.createdAt.toISOString(),
    },
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  validateAuthenticatedMutation(request);
  const { id } = await context.params;
  const body = await readJsonObject(request);

  await updateBirdGenetics(userId, id, {
    visualTraits: readStringArray(body, "visualTraits", { maxItems: 80, maxItemLength: 80 }),
    carriedTraits: readStringArray(body, "carriedTraits", { maxItems: 80, maxItemLength: 80 }),
    projectTags: readStringArray(body, "projectTags", { maxItems: 80, maxItemLength: 80 }),
    genotypeNotes: readString(body, "genotypeNotes", { maxLength: 3000 }),
    traitIds: readStringArray(body, "traitIds", { maxItems: 120, maxItemLength: 80 }),
  });

  return NextResponse.json({ ok: true });
}
