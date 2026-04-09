import { randomBytes, scryptSync } from "crypto";
import { PrismaClient } from "@prisma/client";
import {
  birds,
  chicks,
  currentUser,
  customers,
  flocks,
  hatchGroups,
  notes,
  orders,
  pairings,
  photos,
  reservations,
  traits,
} from "../lib/mock-data";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "demo12345";

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

async function main() {
  const userId = currentUser.id;
  const chickIds = new Set(chicks.map((chick) => chick.id));
  const now = new Date();
  const adminUsers = [
    {
      ...currentUser,
      passwordHash: hashPassword(DEMO_PASSWORD),
      plan: "starter",
      subscriptionStatus: "beta",
      isBetaUser: true,
      isFounder: true,
      isAdmin: true,
      aiAccessEnabled: true,
      lastLoginAt: new Date("2026-04-08T10:00:00.000Z"),
      createdAt: new Date(currentUser.createdAt),
    },
    {
      id: "user_trial",
      name: "Trial Breeder",
      email: "trial@havenhatchr.com",
      passwordHash: hashPassword(DEMO_PASSWORD),
      plan: "starter",
      subscriptionStatus: "trialing",
      trialEnd: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 10),
      currentPeriodEnd: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 10),
      isBetaUser: false,
      isFounder: false,
      isAdmin: false,
      aiAccessEnabled: true,
      lastLoginAt: new Date("2026-04-07T14:20:00.000Z"),
      createdAt: new Date("2026-04-02T12:00:00.000Z"),
    },
    {
      id: "user_paid",
      name: "Active Subscriber",
      email: "paid@havenhatchr.com",
      passwordHash: hashPassword(DEMO_PASSWORD),
      plan: "starter",
      subscriptionStatus: "active",
      trialEnd: new Date("2026-03-20T12:00:00.000Z"),
      currentPeriodEnd: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 24),
      stripeCustomerId: "cus_demo_paid",
      stripeSubscriptionId: "sub_demo_paid",
      isBetaUser: false,
      isFounder: false,
      isAdmin: false,
      aiAccessEnabled: true,
      lastLoginAt: new Date("2026-04-08T09:45:00.000Z"),
      createdAt: new Date("2026-03-10T12:00:00.000Z"),
    },
    {
      id: "user_support",
      name: "Past Due Breeder",
      email: "pastdue@havenhatchr.com",
      passwordHash: hashPassword(DEMO_PASSWORD),
      plan: "starter",
      subscriptionStatus: "past_due",
      stripeCustomerId: "cus_demo_pastdue",
      stripeSubscriptionId: "sub_demo_pastdue",
      isBetaUser: false,
      isFounder: false,
      isAdmin: false,
      aiAccessEnabled: false,
      lastLoginAt: new Date("2026-04-05T08:15:00.000Z"),
      accountDisabledAt: null,
      createdAt: new Date("2026-03-22T12:00:00.000Z"),
    },
  ];

  await prisma.session.deleteMany();
  await prisma.aiUsageLog.deleteMany();
  await prisma.usageEvent.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.featureFlag.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.note.deleteMany();
  await prisma.orderChick.deleteMany();
  await prisma.order.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.chick.deleteMany();
  await prisma.hatchGroup.deleteMany();
  await prisma.pairing.deleteMany();
  await prisma.bird.deleteMany();
  await prisma.trait.deleteMany();
  await prisma.flock.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  for (const user of adminUsers) {
    await prisma.user.create({ data: user });
  }

  await prisma.customer.createMany({
    data: customers.map((customer) => ({
      ...customer,
      userId,
      createdAt: new Date(customer.createdAt),
    })),
  });

  await prisma.flock.createMany({
    data: flocks.map((flock) => ({
      ...flock,
      userId,
      createdAt: new Date(flock.createdAt),
    })),
  });

  await prisma.trait.createMany({
    data: traits.map((trait) => ({
      ...trait,
      userId,
    })),
  });

  for (const bird of birds) {
    await prisma.bird.create({
      data: {
        ...bird,
        userId,
        createdAt: new Date(bird.createdAt),
      },
    });
  }

  for (const pairing of pairings) {
    await prisma.pairing.create({
      data: {
        ...pairing,
        userId,
        createdAt: new Date(pairing.createdAt),
      },
    });
  }

  for (const hatchGroup of hatchGroups) {
    await prisma.hatchGroup.create({
      data: {
        ...hatchGroup,
        userId,
        setDate: new Date(`${hatchGroup.setDate}T00:00:00`),
        hatchDate: new Date(`${hatchGroup.hatchDate}T00:00:00`),
        createdAt: new Date(hatchGroup.createdAt),
      },
    });
  }

  for (const chick of chicks) {
    await prisma.chick.create({
      data: {
        ...chick,
        userId,
        hatchDate: new Date(`${chick.hatchDate}T00:00:00`),
        createdAt: new Date(chick.createdAt),
      },
    });
  }

  for (const reservation of reservations) {
    await prisma.reservation.create({
      data: {
        ...reservation,
        userId,
        createdAt: new Date(reservation.createdAt),
      },
    });
  }

  for (const order of orders) {
    const normalizedStatus =
      order.status === "Ready"
        ? "Completed"
        : order.status === "Waitlist"
          ? "Pending"
          : order.status;

    await prisma.order.create({
      data: {
        id: order.id,
        userId,
        customerId: order.customerId,
        total: order.total,
        status: normalizedStatus,
        notes: order.notes,
        pickupDate: new Date(`${order.pickupDate}T00:00:00`),
        createdAt: new Date(order.createdAt),
        orderChicks: {
          create: order.chickIds.filter((chickId) => chickIds.has(chickId)).map((chickId) => ({
            chickId,
          })),
        },
      },
    });
  }

  await prisma.note.createMany({
    data: notes.map((note) => ({
      ...note,
      userId,
      birdId: note.entityType === "bird" ? note.entityId : null,
      chickId: note.entityType === "chick" ? note.entityId : null,
      pairingId: note.entityType === "pairing" ? note.entityId : null,
      hatchGroupId: note.entityType === "hatchGroup" ? note.entityId : null,
      flockId: note.entityType === "flock" ? note.entityId : null,
      customerId: note.entityType === "customer" ? note.entityId : null,
      orderId: note.entityType === "order" ? note.entityId : null,
      reservationId: note.entityType === "reservation" ? note.entityId : null,
      createdAt: new Date(note.createdAt),
    })),
  });

  await prisma.photo.createMany({
    data: photos.map((photo) => ({
      ...photo,
      userId,
      birdId: photo.entityType === "bird" ? photo.entityId : null,
      chickId: photo.entityType === "chick" ? photo.entityId : null,
      pairingId: null,
      hatchGroupId: photo.entityType === "hatchGroup" ? photo.entityId : null,
      flockId: photo.entityType === "flock" ? photo.entityId : null,
      createdAt: new Date(photo.createdAt),
    })),
  });

  for (const bird of birds) {
    const relatedTraitNames = Array.from(
      new Set([...bird.visualTraits, ...bird.carriedTraits]),
    ).filter((name) => traits.some((trait) => trait.name === name));

    if (relatedTraitNames.length === 0) {
      continue;
    }

    await prisma.bird.update({
      where: {
        id: bird.id,
      },
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

  await prisma.featureFlag.createMany({
    data: [
      {
        name: "Admin Console",
        key: "admin_console",
        description: "Controls access to the internal admin operations surfaces.",
        enabled: true,
        audience: "admin",
        rolloutPercent: 100,
        createdById: userId,
        updatedById: userId,
      },
      {
        name: "AI Tools",
        key: "ai_tools",
        description: "Global switch for breeder-facing AI tool placeholders.",
        enabled: true,
        audience: "all",
        rolloutPercent: 100,
        createdById: userId,
        updatedById: userId,
      },
      {
        name: "Founder Banner",
        key: "founder_badge",
        description: "Shows the founder or beta-access indicator in the app shell.",
        enabled: true,
        audience: "beta",
        rolloutPercent: 100,
        createdById: userId,
        updatedById: userId,
      },
    ],
  });

  await prisma.systemSetting.createMany({
    data: [
      {
        key: "maintenance_mode",
        label: "Maintenance Mode",
        description: "Temporarily blocks normal breeder access if enabled.",
        value: false,
        updatedById: userId,
      },
      {
        key: "invite_only_mode",
        label: "Invite Only Mode",
        description: "Restricts new account creation to invited users only.",
        value: false,
        updatedById: userId,
      },
      {
        key: "beta_banner_text",
        label: "Beta Banner Text",
        description: "Optional internal banner text shown to founder and beta accounts.",
        value: "Founder Access enabled",
        updatedById: userId,
      },
      {
        key: "ai_global_enabled",
        label: "AI Global Enable",
        description: "Global switch for placeholder AI surfaces.",
        value: true,
        updatedById: userId,
      },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      {
        actorUserId: userId,
        subjectUserId: userId,
        action: "seed.admin_bootstrap",
        entityType: "user",
        entityId: userId,
        summary: "Seeded founder admin account with beta access.",
      },
      {
        actorUserId: userId,
        subjectUserId: "user_trial",
        action: "seed.trial_user",
        entityType: "user",
        entityId: "user_trial",
        summary: "Seeded trial user for billing oversight validation.",
      },
      {
        actorUserId: userId,
        subjectUserId: "user_support",
        action: "seed.past_due_user",
        entityType: "user",
        entityId: "user_support",
        summary: "Seeded past due account for support diagnostics.",
      },
    ],
  });

  await prisma.usageEvent.createMany({
    data: [
      {
        userId,
        eventType: "dashboard.view",
        route: "/dashboard",
        metadata: { source: "seed" },
      },
      {
        userId: "user_paid",
        eventType: "orders.create",
        route: "/orders",
        metadata: { source: "seed" },
      },
      {
        userId: "user_trial",
        eventType: "birds.view",
        route: "/birds",
        metadata: { source: "seed" },
      },
    ],
  });

  await prisma.aiUsageLog.createMany({
    data: [
      {
        userId,
        tool: "listing_writer",
        action: "generate_listing",
        inputSummary: "Blue Copper Marans breeder listing prompt",
        outputSummary: "Generated breeder-ready listing paragraph",
      },
      {
        userId: "user_paid",
        tool: "pairing_suggestions",
        action: "suggest_pairing",
        inputSummary: "Lavender Ameraucana pairing review",
        outputSummary: "Returned strengths and concerns",
      },
    ],
  });

  console.log(
    `Seeded founder admin ${currentUser.email} with password ${DEMO_PASSWORD}, plus billing and support demo accounts`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
