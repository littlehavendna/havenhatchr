import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getAiToolsData } from "@/lib/db";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getAiToolsData(userId);
  return NextResponse.json(data);
}
