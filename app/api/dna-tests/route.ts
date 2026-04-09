import { NextResponse } from "next/server";
import { logUsageEvent } from "@/lib/admin";
import { getCurrentUserId } from "@/lib/auth";
import { createDnaTestRequest } from "@/lib/db";
import { reportRequestEvent } from "@/lib/monitoring";
import {
  getClientErrorMessage,
  getErrorStatus,
  logServerError,
  readJsonObject,
  readString,
  validateAuthenticatedMutation,
} from "@/lib/security";

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    validateAuthenticatedMutation(request);
    const body = await readJsonObject(request);
    const requestRecord = await createDnaTestRequest(userId, {
      chickId: readString(body, "chickId", { required: true, maxLength: 40 }),
      testType: readString(body, "testType", { required: true, maxLength: 80 }),
    });

    await logUsageEvent({
      userId,
      eventType: "dna.request_created",
      route: "/api/dna-tests",
      metadata: { testType: requestRecord.testType, chickId: requestRecord.chickId },
    });
    await reportRequestEvent(request, {
      level: "info",
      source: "dna",
      eventType: "request_created",
      message: "DNA test request created.",
      userId,
      metadata: { testType: requestRecord.testType, chickId: requestRecord.chickId },
      persist: false,
    });

    return NextResponse.json({ dnaTestRequest: requestRecord });
  } catch (error) {
    const status = getErrorStatus(error);

    if (status >= 500) {
      logServerError("dna-tests.create", error);
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to request DNA test.") },
      { status },
    );
  }
}
