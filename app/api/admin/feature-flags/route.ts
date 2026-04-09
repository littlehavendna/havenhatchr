import { NextResponse } from "next/server";
import { createFeatureFlag, getFeatureFlagsData } from "@/lib/admin";
import { requireAdminUser } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdminUser();
    const featureFlags = await getFeatureFlagsData();
    return NextResponse.json({ featureFlags });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser();
    const body = await request.json();
    const featureFlag = await createFeatureFlag(admin.id, body);
    return NextResponse.json({ featureFlag });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Forbidden" },
      { status: 403 },
    );
  }
}
