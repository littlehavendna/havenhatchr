import { NextResponse } from "next/server";
import { logAiUsage, logUsageEvent } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { getAiToolsData } from "@/lib/db";
import { reportOperationalEvent } from "@/lib/monitoring";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!user.isBetaUser && !user.aiAccessEnabled) {
    return NextResponse.json({ error: "AI access is disabled for this account." }, { status: 403 });
  }

  const data = await getAiToolsData(user.id);
  await logUsageEvent({
    userId: user.id,
    eventType: "ai.workspace_view",
    route: "/ai",
    metadata: { isBetaUser: user.isBetaUser },
  });
  await logUsageEvent({
    userId: user.id,
    eventType: "beta.opened_ai_tools",
    route: "/ai",
    metadata: { isBetaUser: user.isBetaUser },
  });
  await logAiUsage({
    userId: user.id,
    tool: "ai_workspace",
    action: "load_context",
    inputSummary: "Loaded AI workspace context",
    outputSummary: "Returned birds, chicks, customers, and pairing data",
  });
  await reportOperationalEvent({
    level: "info",
    source: "ai",
    eventType: "workspace_opened",
    message: "AI tools workspace opened.",
    userId: user.id,
    route: "/ai",
    persist: false,
  });
  return NextResponse.json(data);
}
