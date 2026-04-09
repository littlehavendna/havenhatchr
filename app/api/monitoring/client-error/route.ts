import { NextResponse } from "next/server";
import { reportRequestEvent } from "@/lib/monitoring";
import {
  getClientErrorMessage,
  getErrorStatus,
  readJsonObject,
  readString,
  validateAuthenticatedMutation,
} from "@/lib/security";

export async function POST(request: Request) {
  try {
    validateAuthenticatedMutation(request, {
      rateLimitKey: "monitoring:client-error",
      limit: 20,
      windowMs: 1000 * 60 * 10,
    });

    const body = await readJsonObject(request);
    const message = readString(body, "message", { required: true, maxLength: 500 });
    const digest = readString(body, "digest", { maxLength: 200 });
    const pathname = readString(body, "pathname", { maxLength: 200 });
    const component = readString(body, "component", { maxLength: 120 });

    await reportRequestEvent(request, {
      level: "error",
      source: "client",
      eventType: "ui_runtime_error",
      message,
      metadata: {
        digest,
        pathname,
        component,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to record client error.") },
      { status: getErrorStatus(error) },
    );
  }
}

