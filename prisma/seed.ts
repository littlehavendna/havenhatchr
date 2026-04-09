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

  await prisma.session.deleteMany();
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

  await prisma.user.create({
    data: {
      ...currentUser,
      passwordHash: hashPassword(DEMO_PASSWORD),
      plan: "starter",
      subscriptionStatus: "beta",
      isBetaUser: true,
      createdAt: new Date(currentUser.createdAt),
    },
  });

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

  console.log(
    `Seeded demo user ${currentUser.email} with password ${DEMO_PASSWORD} and Founder Access enabled`,
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
