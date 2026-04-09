import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createBirdNote, getBirdProfileData } from "@/lib/db";

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

  const { id } = await context.params;
  const body = (await request.json()) as { content?: string };
  const content = body.content?.trim();

  if (!content) {
    return NextResponse.json({ error: "Note content is required." }, { status: 400 });
  }

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
