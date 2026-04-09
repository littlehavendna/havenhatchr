import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function formatDateTime(value: Date | null) {
  return value ? value.toISOString() : null;
}

function formatJsonValue(value: Prisma.JsonValue) {
  return value;
}

export async function logAuditAction(input: {
  actorUserId?: string | null;
  subjectUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId ?? null,
      subjectUserId: input.subjectUserId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      summary: input.summary,
      metadata: input.metadata,
    },
  });
}

export async function logUsageEvent(input: {
  userId?: string | null;
  eventType: string;
  route?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await prisma.usageEvent.create({
    data: {
      userId: input.userId ?? null,
      eventType: input.eventType,
      route: input.route ?? "",
      metadata: input.metadata,
    },
  });
}

export async function logAiUsage(input: {
  userId?: string | null;
  tool: string;
  action: string;
  inputSummary?: string;
  outputSummary?: string;
}) {
  await prisma.aiUsageLog.create({
    data: {
      userId: input.userId ?? null,
      tool: input.tool,
      action: input.action,
      inputSummary: input.inputSummary ?? "",
      outputSummary: input.outputSummary ?? "",
    },
  });
}

function serializeUser(
  user: {
    id: string;
    name: string;
    email: string;
    plan: string;
    subscriptionStatus: string;
    isBetaUser: boolean;
    isFounder: boolean;
    aiAccessEnabled: boolean;
    isAdmin: boolean;
    createdAt: Date;
    lastLoginAt: Date | null;
    accountDisabledAt: Date | null;
    trialEnd: Date | null;
    currentPeriodEnd: Date | null;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
  },
) {
  return {
    ...user,
    createdAt: formatDateTime(user.createdAt),
    lastLoginAt: formatDateTime(user.lastLoginAt),
    accountDisabledAt: formatDateTime(user.accountDisabledAt),
    trialEnd: formatDateTime(user.trialEnd),
    currentPeriodEnd: formatDateTime(user.currentPeriodEnd),
  };
}

export async function getAdminDashboardData() {
  const [users, recentSignups, aiUsageRecent] = await Promise.all([
    prisma.user.findMany({
      include: {
        _count: {
          select: {
            customers: true,
            flocks: true,
            birds: true,
            pairings: true,
            hatchGroups: true,
            chicks: true,
            reservations: true,
            orders: true,
          },
        },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.aiUsageLog.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const activeBreeders = users.filter((user) =>
    Object.values(user._count).some((count) => count > 0),
  ).length;
  const aiToolCounts = new Map<string, number>();
  aiUsageRecent.forEach((entry) => {
    aiToolCounts.set(entry.tool, (aiToolCounts.get(entry.tool) ?? 0) + 1);
  });

  return {
    totals: {
      totalUsers: users.length,
      activeSubscribers: users.filter((user) => user.subscriptionStatus === "active").length,
      trialUsers: users.filter((user) => user.subscriptionStatus === "trialing").length,
      betaUsers: users.filter((user) => user.isBetaUser).length,
      founderUsers: users.filter((user) => user.isFounder).length,
      activeBreeders,
      aiUsageCount: aiUsageRecent.length,
    },
    recentSignups: recentSignups.map((user) => serializeUser(user)),
    aiUsageSnapshot: Array.from(aiToolCounts.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, 4)
      .map(([tool, count]) => ({ tool, count })),
    alerts: [
      ...users
        .filter((user) => ["past_due", "unpaid"].includes(user.subscriptionStatus))
        .map((user) => `${user.name} has a ${user.subscriptionStatus.replace("_", " ")} billing state.`),
      ...users
        .filter(
          (user) =>
            user.subscriptionStatus === "trialing" &&
            user.trialEnd &&
            user.trialEnd.getTime() < Date.now() + 1000 * 60 * 60 * 24 * 3,
        )
        .map((user) => `${user.name}'s trial ends within 3 days.`),
      ...users
        .filter((user) => user.accountDisabledAt)
        .map((user) => `${user.name} has a disabled account.`),
    ].slice(0, 8),
  };
}

export async function getAdminUsersData(search = "") {
  const query = search.trim();
  const users = await prisma.user.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { plan: { contains: query, mode: "insensitive" } },
            { subscriptionStatus: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  return users.map((user) => serializeUser(user));
}

export async function updateAdminUserAccess(
  actorUserId: string,
  userId: string,
  data: {
    isBetaUser?: boolean;
    isFounder?: boolean;
    aiAccessEnabled?: boolean;
    isAdmin?: boolean;
    disableAccount?: boolean;
  },
) {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new Error("User not found.");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      isBetaUser: data.isBetaUser,
      isFounder: data.isFounder,
      aiAccessEnabled: data.aiAccessEnabled,
      isAdmin: data.isAdmin,
      accountDisabledAt:
        data.disableAccount === undefined
          ? undefined
          : data.disableAccount
            ? new Date()
            : null,
    },
  });

  const changedKeys = Object.entries(data)
    .filter(([, value]) => value !== undefined)
    .map(([key]) => key);

  await logAuditAction({
    actorUserId,
    subjectUserId: userId,
    action: "admin.user_access_updated",
    entityType: "user",
    entityId: userId,
    summary: `Updated ${existingUser.email}: ${changedKeys.join(", ") || "no fields changed"}.`,
    metadata: data,
  });

  return serializeUser(updatedUser);
}

export async function getAdminUserDetail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          customers: true,
          flocks: true,
          birds: true,
          pairings: true,
          hatchGroups: true,
          chicks: true,
          reservations: true,
          orders: true,
        },
      },
      auditLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      subjectAuditLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      usageEvents: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      aiUsageLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!user) {
    return null;
  }

  const auditHistory = [...user.auditLogs, ...user.subjectAuditLogs]
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
    .slice(0, 20);

  const aiToolCounts = new Map<string, number>();
  user.aiUsageLogs.forEach((log) => {
    aiToolCounts.set(log.tool, (aiToolCounts.get(log.tool) ?? 0) + 1);
  });

  return {
    user: serializeUser(user),
    recordCounts: user._count,
    recentActivity: user.usageEvents.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      route: event.route,
      metadata: event.metadata,
      createdAt: formatDateTime(event.createdAt),
    })),
    aiUsageSummary: {
      totalEvents: user.aiUsageLogs.length,
      byTool: Array.from(aiToolCounts.entries()).map(([tool, count]) => ({ tool, count })),
      recentLogs: user.aiUsageLogs.map((log) => ({
        id: log.id,
        tool: log.tool,
        action: log.action,
        inputSummary: log.inputSummary,
        outputSummary: log.outputSummary,
        createdAt: formatDateTime(log.createdAt),
      })),
    },
    auditHistory: auditHistory.map((entry) => ({
      id: entry.id,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      summary: entry.summary,
      metadata: entry.metadata,
      createdAt: formatDateTime(entry.createdAt),
    })),
  };
}

export async function getAdminBillingData() {
  const users = await prisma.user.findMany({
    orderBy: [{ subscriptionStatus: "asc" }, { createdAt: "desc" }],
  });

  return {
    activeSubscriptions: users.filter((user) => user.subscriptionStatus === "active").map(serializeUser),
    trialUsers: users.filter((user) => user.subscriptionStatus === "trialing").map(serializeUser),
    pastDueUsers: users.filter((user) => ["past_due", "unpaid"].includes(user.subscriptionStatus)).map(serializeUser),
    canceledSubscriptions: users.filter((user) => user.subscriptionStatus === "canceled").map(serializeUser),
    renewalTimeline: users
      .filter((user) => user.currentPeriodEnd)
      .map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        subscriptionStatus: user.subscriptionStatus,
        currentPeriodEnd: formatDateTime(user.currentPeriodEnd),
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
      }))
      .sort((left, right) => (left.currentPeriodEnd || "").localeCompare(right.currentPeriodEnd || "")),
  };
}

export async function getAdminAnalyticsData() {
  const [users, usageEvents, aiUsageLogs, featureFlags] = await Promise.all([
    prisma.user.findMany(),
    prisma.usageEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.aiUsageLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.featureFlag.findMany({
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const eventTypeCounts = new Map<string, number>();
  usageEvents.forEach((event) => {
    eventTypeCounts.set(event.eventType, (eventTypeCounts.get(event.eventType) ?? 0) + 1);
  });

  const aiToolCounts = new Map<string, number>();
  aiUsageLogs.forEach((log) => {
    aiToolCounts.set(log.tool, (aiToolCounts.get(log.tool) ?? 0) + 1);
  });

  return {
    totals: {
      users: users.length,
      activeSubscribers: users.filter((user) => user.subscriptionStatus === "active").length,
      trialUsers: users.filter((user) => user.subscriptionStatus === "trialing").length,
      disabledAccounts: users.filter((user) => user.accountDisabledAt).length,
      enabledFeatureFlags: featureFlags.filter((flag) => flag.enabled).length,
      usageEvents: usageEvents.length,
      aiUsageEvents: aiUsageLogs.length,
    },
    productUsage: Array.from(eventTypeCounts.entries()).map(([eventType, count]) => ({
      eventType,
      count,
    })),
    aiUsage: Array.from(aiToolCounts.entries()).map(([tool, count]) => ({
      tool,
      count,
    })),
    recentUsage: usageEvents.slice(0, 12).map((event) => ({
      id: event.id,
      userId: event.userId,
      eventType: event.eventType,
      route: event.route,
      createdAt: formatDateTime(event.createdAt),
    })),
  };
}

export async function getFeatureFlagsData() {
  const flags = await prisma.featureFlag.findMany({
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
  });

  return flags.map((flag) => ({
    id: flag.id,
    name: flag.name,
    key: flag.key,
    description: flag.description,
    enabled: flag.enabled,
    rolloutPercent: flag.rolloutPercent,
    audience: flag.audience,
    createdById: flag.createdById,
    updatedById: flag.updatedById,
    createdAt: formatDateTime(flag.createdAt),
    updatedAt: formatDateTime(flag.updatedAt),
  }));
}

export async function createFeatureFlag(
  actorUserId: string,
  data: {
    name: string;
    key: string;
    description: string;
    enabled: boolean;
    rolloutPercent?: number | null;
    audience?: string;
  },
) {
  const flag = await prisma.featureFlag.create({
    data: {
      name: data.name,
      key: data.key,
      description: data.description,
      enabled: data.enabled,
      rolloutPercent: data.rolloutPercent ?? null,
      audience: data.audience || "all",
      createdById: actorUserId,
      updatedById: actorUserId,
    },
  });

  await logAuditAction({
    actorUserId,
    action: "admin.feature_flag_created",
    entityType: "feature_flag",
    entityId: flag.id,
    summary: `Created feature flag ${flag.key}.`,
    metadata: data,
  });

  return flag;
}

export async function updateFeatureFlag(
  actorUserId: string,
  flagId: string,
  data: {
    name?: string;
    description?: string;
    enabled?: boolean;
    rolloutPercent?: number | null;
    audience?: string;
  },
) {
  const flag = await prisma.featureFlag.update({
    where: { id: flagId },
    data: {
      ...data,
      updatedById: actorUserId,
    },
  });

  await logAuditAction({
    actorUserId,
    action: "admin.feature_flag_updated",
    entityType: "feature_flag",
    entityId: flag.id,
    summary: `Updated feature flag ${flag.key}.`,
    metadata: data,
  });

  return flag;
}

export async function getSupportData(search = "") {
  const query = search.trim();
  const [users, auditLogs, usageEvents] = await Promise.all([
    prisma.user.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
              { stripeCustomerId: { contains: query, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.usageEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return {
    users: users.map(serializeUser),
    recentAccountEvents: auditLogs.map((entry) => ({
      id: entry.id,
      action: entry.action,
      summary: entry.summary,
      entityType: entry.entityType,
      entityId: entry.entityId,
      createdAt: formatDateTime(entry.createdAt),
    })),
    recentUsage: usageEvents.map((entry) => ({
      id: entry.id,
      eventType: entry.eventType,
      route: entry.route,
      createdAt: formatDateTime(entry.createdAt),
    })),
    placeholderImpersonation:
      "Future only: secure support impersonation should require a one-time approval flow and explicit audit logging.",
  };
}

export async function getSystemSettingsData() {
  const settings = await prisma.systemSetting.findMany({
    orderBy: { key: "asc" },
  });

  return settings.map((setting) => ({
    id: setting.id,
    key: setting.key,
    label: setting.label,
    description: setting.description,
    value: formatJsonValue(setting.value),
    updatedById: setting.updatedById,
    createdAt: formatDateTime(setting.createdAt),
    updatedAt: formatDateTime(setting.updatedAt),
  }));
}

export async function upsertSystemSetting(
  actorUserId: string,
  data: {
    key: string;
    label: string;
    description: string;
    value: Prisma.InputJsonValue;
  },
) {
  const setting = await prisma.systemSetting.upsert({
    where: { key: data.key },
    update: {
      label: data.label,
      description: data.description,
      value: data.value,
      updatedById: actorUserId,
    },
    create: {
      key: data.key,
      label: data.label,
      description: data.description,
      value: data.value,
      updatedById: actorUserId,
    },
  });

  await logAuditAction({
    actorUserId,
    action: "admin.system_setting_upserted",
    entityType: "system_setting",
    entityId: setting.id,
    summary: `Upserted system setting ${setting.key}.`,
    metadata: data,
  });

  return setting;
}
