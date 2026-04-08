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

async function main() {
  await prisma.photo.deleteMany();
  await prisma.note.deleteMany();
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
      createdAt: new Date(currentUser.createdAt),
    },
  });

  await prisma.customer.createMany({
    data: customers.map((customer) => ({
      ...customer,
      createdAt: new Date(customer.createdAt),
    })),
  });

  await prisma.flock.createMany({
    data: flocks.map((flock) => ({
      ...flock,
      createdAt: new Date(flock.createdAt),
    })),
  });

  await prisma.trait.createMany({
    data: traits,
  });

  for (const bird of birds) {
    await prisma.bird.create({
      data: {
        ...bird,
        createdAt: new Date(bird.createdAt),
      },
    });
  }

  for (const pairing of pairings) {
    await prisma.pairing.create({
      data: {
        ...pairing,
        createdAt: new Date(pairing.createdAt),
      },
    });
  }

  for (const hatchGroup of hatchGroups) {
    await prisma.hatchGroup.create({
      data: {
        ...hatchGroup,
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
        hatchDate: new Date(`${chick.hatchDate}T00:00:00`),
        createdAt: new Date(chick.createdAt),
      },
    });
  }

  for (const reservation of reservations) {
    await prisma.reservation.create({
      data: {
        ...reservation,
        createdAt: new Date(reservation.createdAt),
      },
    });
  }

  for (const order of orders) {
    await prisma.order.create({
      data: {
        ...order,
        pickupDate: new Date(`${order.pickupDate}T00:00:00`),
        createdAt: new Date(order.createdAt),
      },
    });
  }

  await prisma.note.createMany({
    data: notes.map((note) => ({
      ...note,
      createdAt: new Date(note.createdAt),
    })),
  });

  await prisma.photo.createMany({
    data: photos.map((photo) => ({
      ...photo,
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
      where: { id: bird.id },
      data: {
        traits: {
          connect: relatedTraitNames.map((name) => ({ name })),
        },
      },
    });
  }
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
