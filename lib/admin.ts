import "server-only";

import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import {
  birds as demoBirds,
  chicks as demoChicks,
  customers as demoCustomers,
  flocks as demoFlocks,
  hatchGroups as demoHatchGroups,
  notes as demoNotes,
  orders as demoOrders,
  pairings as demoPairings,
  photos as demoPhotos,
  reservations as demoReservations,
  traits as demoTraits,
} from "@/lib/mock-data";
import { reportOperationalEvent } from "@/lib/monitoring";
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
  await reportOperationalEvent({
    level: "info",
    source: "audit",
    eventType: input.action,
    message: input.summary,
    userId: input.actorUserId ?? input.subjectUserId ?? null,
    metadata: {
      entityType: input.entityType,
      entityId: input.entityId ?? null,
    },
    persist: false,
  });

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
  await reportOperationalEvent({
    level: "info",
    source: "usage",
    eventType: input.eventType,
    message: input.eventType,
    route: input.route ?? "",
    userId: input.userId ?? null,
    metadata: input.metadata,
    persist: false,
  });

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
  await reportOperationalEvent({
    level: "info",
    source: "ai",
    eventType: input.tool,
    message: `${input.tool}:${input.action}`,
    userId: input.userId ?? null,
    metadata: {
      action: input.action,
      inputSummary: input.inputSummary ?? "",
      outputSummary: input.outputSummary ?? "",
    },
    persist: false,
  });

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

export async function trackFirstRunMilestone(
  userId: string,
  milestone:
    | "first_flock_created"
    | "first_bird_created"
    | "first_chick_created"
    | "first_pairing_created"
    | "first_reservation_created",
) {
  const counts = {
    first_flock_created: () => prisma.flock.count({ where: { userId } }),
    first_bird_created: () => prisma.bird.count({ where: { userId } }),
    first_chick_created: () => prisma.chick.count({ where: { userId } }),
    first_pairing_created: () => prisma.pairing.count({ where: { userId } }),
    first_reservation_created: () => prisma.reservation.count({ where: { userId } }),
  };

  const count = await counts[milestone]();

  if (count === 1) {
    await logUsageEvent({
      userId,
      eventType: `beta.${milestone}`,
      metadata: { milestone },
    });
  }
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

  if (actorUserId === userId && (data.isAdmin === false || data.disableAccount === true)) {
    throw new Error("You cannot remove your own admin access or disable your own account.");
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
  const [users, auditLogs, usageEvents, operationalEvents] = await Promise.all([
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
    prisma.operationalEvent.findMany({
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
    recentOperationalEvents: operationalEvents.map((entry) => ({
      id: entry.id,
      level: entry.level,
      source: entry.source,
      eventType: entry.eventType,
      message: entry.message,
      route: entry.route,
      requestId: entry.requestId,
      createdAt: formatDateTime(entry.createdAt),
    })),
    placeholderImpersonation:
      "Future only: secure support impersonation should require a one-time approval flow and explicit audit logging.",
  };
}

function makeDemoId(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

export async function loadDemoDataForUser(actorUserId: string, userId: string) {
  const existingCounts = await prisma.user.findUnique({
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
    },
  });

  if (!existingCounts) {
    throw new Error("User not found.");
  }

  const hasExistingData = Object.values(existingCounts._count).some((count) => count > 0);
  if (hasExistingData) {
    throw new Error("Demo data can only be loaded into an empty account.");
  }

  const customerIdMap = new Map(demoCustomers.map((record) => [record.id, makeDemoId("customer")]));
  const flockIdMap = new Map(demoFlocks.map((record) => [record.id, makeDemoId("flock")]));
  const traitIdMap = new Map(demoTraits.map((record) => [record.id, makeDemoId("trait")]));
  const birdIdMap = new Map(demoBirds.map((record) => [record.id, makeDemoId("bird")]));
  const pairingIdMap = new Map(demoPairings.map((record) => [record.id, makeDemoId("pairing")]));
  const hatchGroupIdMap = new Map(
    demoHatchGroups.map((record) => [record.id, makeDemoId("hatchGroup")]),
  );
  const chickIdMap = new Map(demoChicks.map((record) => [record.id, makeDemoId("chick")]));
  const reservationIdMap = new Map(
    demoReservations.map((record) => [record.id, makeDemoId("reservation")]),
  );
  const orderIdMap = new Map(demoOrders.map((record) => [record.id, makeDemoId("order")]));

  await prisma.$transaction(async (tx) => {
    await tx.customer.createMany({
      data: demoCustomers.map((customer) => ({
        ...customer,
        id: customerIdMap.get(customer.id)!,
        userId,
        createdAt: new Date(customer.createdAt),
      })),
    });

    await tx.flock.createMany({
      data: demoFlocks.map((flock) => ({
        ...flock,
        id: flockIdMap.get(flock.id)!,
        userId,
        createdAt: new Date(flock.createdAt),
      })),
    });

    await tx.trait.createMany({
      data: demoTraits.map((trait) => ({
        ...trait,
        id: traitIdMap.get(trait.id)!,
        userId,
      })),
    });

    for (const bird of demoBirds) {
      await tx.bird.create({
        data: {
          ...bird,
          id: birdIdMap.get(bird.id)!,
          flockId: flockIdMap.get(bird.flockId)!,
          userId,
          createdAt: new Date(bird.createdAt),
          bandNumber: `${bird.bandNumber}-${randomUUID().slice(0, 4)}`,
        },
      });
    }

    for (const pairing of demoPairings) {
      await tx.pairing.create({
        data: {
          ...pairing,
          id: pairingIdMap.get(pairing.id)!,
          sireId: birdIdMap.get(pairing.sireId)!,
          damId: birdIdMap.get(pairing.damId)!,
          userId,
          createdAt: new Date(pairing.createdAt),
        },
      });
    }

    for (const hatchGroup of demoHatchGroups) {
      await tx.hatchGroup.create({
        data: {
          ...hatchGroup,
          id: hatchGroupIdMap.get(hatchGroup.id)!,
          pairingId: pairingIdMap.get(hatchGroup.pairingId)!,
          userId,
          setDate: new Date(`${hatchGroup.setDate}T00:00:00`),
          hatchDate: new Date(`${hatchGroup.hatchDate}T00:00:00`),
          createdAt: new Date(hatchGroup.createdAt),
        },
      });
    }

    for (const chick of demoChicks) {
      await tx.chick.create({
        data: {
          ...chick,
          id: chickIdMap.get(chick.id)!,
          flockId: flockIdMap.get(chick.flockId)!,
          hatchGroupId: chick.hatchGroupId ? hatchGroupIdMap.get(chick.hatchGroupId)! : null,
          userId,
          hatchDate: new Date(`${chick.hatchDate}T00:00:00`),
          createdAt: new Date(chick.createdAt),
          bandNumber: `${chick.bandNumber}-${randomUUID().slice(0, 4)}`,
        },
      });
    }

    for (const reservation of demoReservations) {
      await tx.reservation.create({
        data: {
          ...reservation,
          id: reservationIdMap.get(reservation.id)!,
          customerId: customerIdMap.get(reservation.customerId)!,
          userId,
          createdAt: new Date(reservation.createdAt),
        },
      });
    }

    for (const order of demoOrders) {
      const normalizedStatus =
        order.status === "Ready" ? "Completed" : order.status === "Waitlist" ? "Pending" : order.status;

      await tx.order.create({
        data: {
          id: orderIdMap.get(order.id)!,
          customerId: customerIdMap.get(order.customerId)!,
          userId,
          total: order.total,
          status: normalizedStatus,
          pickupDate: new Date(`${order.pickupDate}T00:00:00`),
          notes: order.notes,
          createdAt: new Date(order.createdAt),
          orderChicks: {
            create: order.chickIds
              .filter((chickId) => chickIdMap.has(chickId))
              .map((chickId) => ({
                chickId: chickIdMap.get(chickId)!,
              })),
          },
        },
      });
    }

    await tx.note.createMany({
      data: demoNotes.map((note) => {
        const mappedEntityId =
          note.entityType === "bird"
            ? birdIdMap.get(note.entityId)!
            : note.entityType === "chick"
              ? chickIdMap.get(note.entityId)!
              : note.entityType === "pairing"
                ? pairingIdMap.get(note.entityId)!
                : note.entityType === "hatchGroup"
                  ? hatchGroupIdMap.get(note.entityId)!
                  : note.entityType === "flock"
                    ? flockIdMap.get(note.entityId)!
                    : note.entityType === "customer"
                      ? customerIdMap.get(note.entityId)!
                      : note.entityType === "order"
                        ? orderIdMap.get(note.entityId)!
                        : note.entityType === "reservation"
                          ? reservationIdMap.get(note.entityId)!
                          : note.entityId;

        return {
          ...note,
          id: makeDemoId("note"),
          entityId: mappedEntityId,
          userId,
          birdId: note.entityType === "bird" ? mappedEntityId : null,
          chickId: note.entityType === "chick" ? mappedEntityId : null,
          pairingId: note.entityType === "pairing" ? mappedEntityId : null,
          hatchGroupId: note.entityType === "hatchGroup" ? mappedEntityId : null,
          flockId: note.entityType === "flock" ? mappedEntityId : null,
          customerId: note.entityType === "customer" ? mappedEntityId : null,
          orderId: note.entityType === "order" ? mappedEntityId : null,
          reservationId: note.entityType === "reservation" ? mappedEntityId : null,
          createdAt: new Date(note.createdAt),
        };
      }),
    });

    await tx.photo.createMany({
      data: demoPhotos.map((photo) => {
        const mappedEntityId =
          photo.entityType === "bird"
            ? birdIdMap.get(photo.entityId)!
            : photo.entityType === "chick"
              ? chickIdMap.get(photo.entityId)!
              : photo.entityType === "hatchGroup"
                ? hatchGroupIdMap.get(photo.entityId)!
                : flockIdMap.get(photo.entityId)!;

        return {
          ...photo,
          id: makeDemoId("photo"),
          entityId: mappedEntityId,
          userId,
          birdId: photo.entityType === "bird" ? mappedEntityId : null,
          chickId: photo.entityType === "chick" ? mappedEntityId : null,
          pairingId: null,
          hatchGroupId: photo.entityType === "hatchGroup" ? mappedEntityId : null,
          flockId: photo.entityType === "flock" ? mappedEntityId : null,
          createdAt: new Date(photo.createdAt),
        };
      }),
    });

    for (const bird of demoBirds) {
      const relatedTraitNames = Array.from(
        new Set([...bird.visualTraits, ...bird.carriedTraits]),
      ).filter((name) => demoTraits.some((trait) => trait.name === name));

      if (relatedTraitNames.length === 0) {
        continue;
      }

      await tx.bird.update({
        where: { id: birdIdMap.get(bird.id)! },
        data: {
          traits: {
            connect: relatedTraitNames.map((name) => ({
              userId_name: {
                userId,
                name,
              },
            })),
          },
        },
      });
    }
  });

  await logAuditAction({
    actorUserId,
    subjectUserId: userId,
    action: "admin.demo_data_loaded",
    entityType: "user",
    entityId: userId,
    summary: `Loaded demo breeder data into user ${existingCounts.email}.`,
  });
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
