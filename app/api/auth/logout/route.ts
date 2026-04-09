import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
import {
  getClientErrorMessage,
  getErrorStatus,
  logServerError,
  validateAuthenticatedMutation,
} from "@/lib/security";

export async function POST(request: Request) {
  try {
    validateAuthenticatedMutation(request);
    await destroySession();
    return NextResponse.json({ success: true });
  } catch (error) {
    const status = getErrorStatus(error);

    if (status >= 500) {
      logServerError("auth.logout", error);
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to log out.") },
      { status },
    );
  }
}
