import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { updateFeatureFlag } from "@/lib/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdminUser();
    const body = await request.json();
    const { id } = await params;
    const featureFlag = await updateFeatureFlag(admin.id, id, body);
    return NextResponse.json({ featureFlag });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Forbidden" },
      { status: 403 },
    );
  }
}
