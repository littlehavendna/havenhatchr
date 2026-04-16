import { NextResponse } from "next/server";
import { getCurrentUser, requireCurrentUser } from "@/lib/auth";
import {
  defaultModuleVisibility,
  getModuleVisibilitySettingKey,
  normalizeModuleVisibility,
  optionalModuleKeys,
} from "@/lib/module-visibility";
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

  try {
    const settings = await prisma.systemSetting.findUnique({
      where: { key: getModuleVisibilitySettingKey(user.id) },
      select: { value: true },
    });

    return NextResponse.json({
      moduleVisibility: normalizeModuleVisibility(settings?.value),
    });
  } catch {
    return NextResponse.json({
      moduleVisibility: defaultModuleVisibility,
    });
  }
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

    const updatedSetting = await prisma.systemSetting.upsert({
      where: { key: getModuleVisibilitySettingKey(user.id) },
      update: {
        label: "User Module Visibility",
        description: "Per-account workspace module visibility preferences.",
        value: moduleVisibility,
        updatedById: user.id,
      },
      create: {
        key: getModuleVisibilitySettingKey(user.id),
        label: "User Module Visibility",
        description: "Per-account workspace module visibility preferences.",
        value: moduleVisibility,
        updatedById: user.id,
      },
    });

    return NextResponse.json({
      moduleVisibility: normalizeModuleVisibility(updatedSetting.value),
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
