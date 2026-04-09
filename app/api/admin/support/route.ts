import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { getSupportData, loadDemoDataForUser } from "@/lib/admin";

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser();
    const search = request.nextUrl.searchParams.get("search") ?? "";
    const data = await getSupportData(search);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    const adminUser = await requireAdminUser();
    const body = (await request.json()) as { action?: string; userId?: string };

    if (body.action !== "loadDemoData" || !body.userId) {
      return NextResponse.json({ error: "Invalid support action." }, { status: 400 });
    }

    await loadDemoDataForUser(adminUser.id, body.userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Support action failed." },
      { status: 400 },
    );
  }
}
