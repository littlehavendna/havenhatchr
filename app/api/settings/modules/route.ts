import { NextResponse } from "next/server";
import { getCurrentUser, requireCurrentUser } from "@/lib/auth";
import { normalizeModuleVisibility, optionalModuleKeys } from "@/lib/module-visibility";
import { prisma } from "@/lib/prisma";
import { reportRequestEvent } from "@/lib/monitoring";
import {
  getClientErrorMessage,
  getErrorStatus,
  logServerError,
  readBoolean,
  readJsonObject,
  validateAuthenticatedMutation,
} from "@/lib/security";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    moduleVisibility: normalizeModuleVisibility(user.moduleVisibility),
  });
}

export async function PUT(request: Request) {
  try {
    const user = await requireCurrentUser();

    validateAuthenticatedMutation(request);
    const body = await readJsonObject(request);

    const moduleVisibility = optionalModuleKeys.reduce<Record<string, boolean>>((current, key) => {
      current[key] = readBoolean(body, key, true);
      return current;
    }, {});

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { moduleVisibility },
      select: { moduleVisibility: true },
    });

    return NextResponse.json({
      moduleVisibility: normalizeModuleVisibility(updatedUser.moduleVisibility),
    });
  } catch (error) {
    const status = getErrorStatus(error);
    if (status >= 500) {
      logServerError("settings.modules.update", error);
      await reportRequestEvent(request, {
        level: "error",
        source: "settings-modules",
        eventType: "update_failed",
        message: "Module visibility update failed.",
        error,
      });
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to update feature visibility.") },
      { status },
    );
  }
}
