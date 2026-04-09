import { NextResponse } from "next/server";
import { getSystemSettingsData, upsertSystemSetting } from "@/lib/admin";
import { requireAdminUser } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdminUser();
    const settings = await getSystemSettingsData();
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser();
    const body = await request.json();
    const setting = await upsertSystemSetting(admin.id, body);
    return NextResponse.json({ setting });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Forbidden" },
      { status: 403 },
    );
  }
}
