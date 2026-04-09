import { prisma } from "@/lib/prisma";

function formatDateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

function formatDateTime(value: Date) {
  return value.toISOString();
}

async function requireOwnedFlock(userId: string, flockId: string) {
  const flock = await prisma.flock.findFirst({
    where: { id: flockId, userId },
  });

  if (!flock) {
    throw new Error("Flock not found.");
  }

  return flock;
}

async function requireOwnedBirds(userId: string, birdIds: string[]) {
  const records = await prisma.bird.findMany({
    where: {
      id: { in: birdIds },
      userId,
    },
  });

  if (records.length !== birdIds.length) {
    throw new Error("Bird selection is invalid.");
  }

  return records;
}

async function requireOwnedPairing(userId: string, pairingId: string) {
  const pairing = await prisma.pairing.findFirst({
    where: { id: pairingId, userId },
  });

  if (!pairing) {
    throw new Error("Pairing not found.");
  }

  return pairing;
}

async function requireOwnedHatchGroup(userId: string, hatchGroupId: string) {
  const hatchGroup = await prisma.hatchGroup.findFirst({
    where: { id: hatchGroupId, userId },
  });

  if (!hatchGroup) {
    throw new Error("Hatch group not found.");
  }

  return hatchGroup;
}

async function requireOwnedCustomer(userId: string, customerId: string) {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, userId },
  });

  if (!customer) {
    throw new Error("Customer not found.");
  }

  return customer;
}

async function requireOwnedBird(userId: string, birdId: string) {
  const bird = await prisma.bird.findFirst({
    where: { id: birdId, userId },
  });

  if (!bird) {
    throw new Error("Bird not found.");
  }

  return bird;
}

function mapTrait(trait: { id: string; name: string; category: string; description: string }) {
  return {
    id: trait.id,
    name: trait.name,
    category: trait.category,
    description: trait.description,
  };
}

export async function getCustomersData(userId: string) {
  const customers = await prisma.customer.findMany({
    where: { userId },
    include: {
      reservations: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    location: customer.location,
    notes: customer.notes,
    status: customer.status,
    createdAt: formatDateTime(customer.createdAt),
    reservationCount: customer.reservations.length,
  }));
}

export async function createCustomer(
  userId: string,
  data: {
    name: string;
    email: string;
    phone: string;
    location: string;
    notes: string;
    status: string;
  },
) {
  return prisma.customer.create({
    data: {
      userId,
      ...data,
    },
  });
}

export async function getFlocksData(userId: string) {
  return prisma.flock.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createFlock(
  userId: string,
  data: {
    name: string;
    breed: string;
    variety: string;
    notes: string;
    active: boolean;
  },
) {
  return prisma.flock.create({
    data: {
      userId,
      ...data,
    },
  });
}

export async function getBirdsData(userId: string) {
  const [birds, flocks] = await Promise.all([
    prisma.bird.findMany({
      where: { userId },
      include: { flock: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.flock.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    birds: birds.map((bird) => ({
      id: bird.id,
      name: bird.name,
      bandNumber: bird.bandNumber,
      sex: bird.sex,
      breed: bird.breed,
      variety: bird.variety,
      color: bird.color,
      genetics: bird.genetics,
      flockId: bird.flockId,
      status: bird.status,
      notes: bird.notes,
      photoUrl: bird.photoUrl,
      visualTraits: bird.visualTraits,
      carriedTraits: bird.carriedTraits,
      genotypeNotes: bird.genotypeNotes,
      projectTags: bird.projectTags,
      createdAt: formatDateTime(bird.createdAt),
      flockName: bird.flock.name,
    })),
    flocks: flocks.map((flock) => ({
      id: flock.id,
      name: flock.name,
      breed: flock.breed,
      variety: flock.variety,
    })),
  };
}

export async function getTraitsData(userId: string) {
  const traits = await prisma.trait.findMany({
    where: { userId },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return traits.map(mapTrait);
}

export async function createTrait(
  userId: string,
  data: {
    name: string;
    category: string;
    description: string;
  },
) {
  return prisma.trait.create({
    data: {
      userId,
      ...data,
    },
  });
}

export async function createBird(
  userId: string,
  data: {
    name: string;
    bandNumber: string;
    sex: "Male" | "Female" | "Unknown";
    breed: string;
    variety: string;
    color: string;
    flockId: string;
    status: "Active" | "Holdback" | "Retired" | "Sold";
    notes: string;
  },
) {
  await requireOwnedFlock(userId, data.flockId);

  return prisma.bird.create({
    data: {
      userId,
      ...data,
      genetics: "",
      photoUrl: "",
      visualTraits: [],
      carriedTraits: [],
      genotypeNotes: "",
      projectTags: [],
    },
  });
}

export async function getGeneticsData(userId: string) {
  const [birds, pairings, traits] = await Promise.all([
    prisma.bird.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.pairing.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.trait.findMany({
      where: { userId },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
  ]);

  return {
    birds: birds.map((bird) => ({
      id: bird.id,
      name: bird.name,
      bandNumber: bird.bandNumber,
      sex: bird.sex,
      breed: bird.breed,
      variety: bird.variety,
      color: bird.color,
      genetics: bird.genetics,
      flockId: bird.flockId,
      status: bird.status,
      notes: bird.notes,
      photoUrl: bird.photoUrl,
      visualTraits: bird.visualTraits,
      carriedTraits: bird.carriedTraits,
      genotypeNotes: bird.genotypeNotes,
      projectTags: bird.projectTags,
      createdAt: formatDateTime(bird.createdAt),
    })),
    pairings: pairings.map((pairing) => ({
      id: pairing.id,
      name: pairing.name,
      sireId: pairing.sireId,
      damId: pairing.damId,
      goals: pairing.goals,
      targetTraits: pairing.targetTraits,
      avoidTraits: pairing.avoidTraits,
      projectGoal: pairing.projectGoal,
      notes: pairing.notes,
      active: pairing.active,
      createdAt: formatDateTime(pairing.createdAt),
    })),
    traits: traits.map(mapTrait),
  };
}

export async function getBirdProfileData(userId: string, birdId: string) {
  const bird = await prisma.bird.findFirst({
    where: { id: birdId, userId },
    include: {
      flock: true,
      traits: true,
      noteEntries: {
        where: { userId },
        orderBy: { createdAt: "desc" },
      },
      photoEntries: {
        where: { userId },
        orderBy: { createdAt: "desc" },
      },
      sirePairings: {
        where: { userId },
        include: {
          sire: true,
          dam: true,
          hatchGroups: {
            where: { userId },
            include: {
              chicks: {
                where: { userId },
              },
            },
            orderBy: { hatchDate: "desc" },
          },
        },
      },
      damPairings: {
        where: { userId },
        include: {
          sire: true,
          dam: true,
          hatchGroups: {
            where: { userId },
            include: {
              chicks: {
                where: { userId },
              },
            },
            orderBy: { hatchDate: "desc" },
          },
        },
      },
    },
  });

  if (!bird) {
    return null;
  }

  const relatedPairingsRaw = [...bird.sirePairings, ...bird.damPairings];
  const relatedPairings = Array.from(
    new Map(relatedPairingsRaw.map((pairing) => [pairing.id, pairing])).values(),
  );
  const relatedHatchGroups = Array.from(
    new Map(
      relatedPairings
        .flatMap((pairing) => pairing.hatchGroups)
        .map((group) => [group.id, group]),
    ).values(),
  ).sort((left, right) => right.hatchDate.getTime() - left.hatchDate.getTime());
  const offspring = relatedHatchGroups.flatMap((group) =>
    group.chicks.map((chick) => ({
      ...chick,
      hatchGroupName: group.name,
    })),
  );
  const totalEggsSet = relatedHatchGroups.reduce((sum, group) => sum + group.eggsSet, 0);
  const totalEggsHatched = relatedHatchGroups.reduce(
    (sum, group) => sum + group.eggsHatched,
    0,
  );
  const averageHatchRate =
    totalEggsSet > 0 ? Math.round((totalEggsHatched / totalEggsSet) * 100) : 0;

  return {
    bird: {
      id: bird.id,
      name: bird.name,
      bandNumber: bird.bandNumber,
      sex: bird.sex,
      breed: bird.breed,
      variety: bird.variety,
      color: bird.color,
      genetics: bird.genetics,
      flockId: bird.flockId,
      flockName: bird.flock.name,
      status: bird.status,
      notes: bird.notes,
      photoUrl: bird.photoUrl,
      visualTraits: bird.visualTraits,
      carriedTraits: bird.carriedTraits,
      genotypeNotes: bird.genotypeNotes,
      projectTags: bird.projectTags,
      createdAt: formatDateTime(bird.createdAt),
      traits: bird.traits.map((trait) => ({
        id: trait.id,
        name: trait.name,
        category: trait.category,
        description: trait.description,
      })),
    },
    notes: bird.noteEntries.map((note) => ({
      id: note.id,
      entityType: note.entityType,
      entityId: note.entityId,
      content: note.content,
      createdAt: formatDateTime(note.createdAt),
    })),
    photos: bird.photoEntries.map((photo) => ({
      id: photo.id,
      entityType: photo.entityType,
      entityId: photo.entityId,
      url: photo.url,
      caption: photo.caption,
      createdAt: formatDateTime(photo.createdAt),
    })),
    relatedPairings: relatedPairings.map((pairing) => ({
      id: pairing.id,
      name: pairing.name,
      sireId: pairing.sireId,
      damId: pairing.damId,
      sireName: pairing.sire.name,
      damName: pairing.dam.name,
      goals: pairing.goals,
      targetTraits: pairing.targetTraits,
      avoidTraits: pairing.avoidTraits,
      projectGoal: pairing.projectGoal,
      notes: pairing.notes,
      active: pairing.active,
      createdAt: formatDateTime(pairing.createdAt),
    })),
    relatedHatchGroups: relatedHatchGroups.map((group) => ({
      id: group.id,
      name: group.name,
      pairingId: group.pairingId,
      setDate: formatDateOnly(group.setDate),
      hatchDate: formatDateOnly(group.hatchDate),
      eggsSet: group.eggsSet,
      eggsHatched: group.eggsHatched,
      producedTraitsSummary: group.producedTraitsSummary,
      notes: group.notes,
      createdAt: formatDateTime(group.createdAt),
    })),
    offspring: offspring.map((chick) => ({
      id: chick.id,
      bandNumber: chick.bandNumber,
      hatchDate: formatDateOnly(chick.hatchDate),
      flockId: chick.flockId,
      hatchGroupId: chick.hatchGroupId,
      hatchGroupName: chick.hatchGroupName,
      status: chick.status,
      sex: chick.sex,
      color: chick.color,
      observedTraits: chick.observedTraits,
      notes: chick.notes,
      photoUrl: chick.photoUrl,
      createdAt: formatDateTime(chick.createdAt),
    })),
    performanceSnapshot: {
      relatedHatchGroupsCount: relatedHatchGroups.length,
      estimatedOffspringCount: offspring.length,
      averageHatchRate,
    },
  };
}

export async function createBirdNote(userId: string, birdId: string, content: string) {
  await requireOwnedBird(userId, birdId);

  return prisma.note.create({
    data: {
      userId,
      entityType: "bird",
      entityId: birdId,
      birdId,
      content,
    },
  });
}

export async function getPairingsData(userId: string) {
  const [pairings, birds] = await Promise.all([
    prisma.pairing.findMany({
      where: { userId },
      include: {
        sire: true,
        dam: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.bird.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    pairings: pairings.map((pairing) => ({
      id: pairing.id,
      name: pairing.name,
      sireId: pairing.sireId,
      damId: pairing.damId,
      goals: pairing.goals,
      targetTraits: pairing.targetTraits,
      avoidTraits: pairing.avoidTraits,
      projectGoal: pairing.projectGoal,
      notes: pairing.notes,
      active: pairing.active,
      createdAt: formatDateTime(pairing.createdAt),
      sireName: pairing.sire.name,
      damName: pairing.dam.name,
    })),
    birds: birds.map((bird) => ({
      id: bird.id,
      name: bird.name,
      bandNumber: bird.bandNumber,
      sex: bird.sex,
    })),
  };
}

export async function createPairing(
  userId: string,
  data: {
    name: string;
    sireId: string;
    damId: string;
    goals: string;
    targetTraits: string[];
    avoidTraits: string[];
    projectGoal: string;
    notes: string;
    active: boolean;
  },
) {
  await requireOwnedBirds(userId, [data.sireId, data.damId]);

  return prisma.pairing.create({
    data: {
      userId,
      ...data,
    },
  });
}

export async function getHatchGroupsData(userId: string) {
  const [groups, pairings] = await Promise.all([
    prisma.hatchGroup.findMany({
      where: { userId },
      include: { pairing: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.pairing.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    hatchGroups: groups.map((group) => ({
      id: group.id,
      name: group.name,
      pairingId: group.pairingId,
      setDate: formatDateOnly(group.setDate),
      hatchDate: formatDateOnly(group.hatchDate),
      eggsSet: group.eggsSet,
      eggsHatched: group.eggsHatched,
      producedTraitsSummary: group.producedTraitsSummary,
      notes: group.notes,
      createdAt: formatDateTime(group.createdAt),
      pairingName: group.pairing.name,
    })),
    pairings: pairings.map((pairing) => ({
      id: pairing.id,
      name: pairing.name,
      targetTraits: pairing.targetTraits,
    })),
  };
}

export async function createHatchGroup(
  userId: string,
  data: {
    name: string;
    pairingId: string;
    setDate: string;
    hatchDate: string;
    eggsSet: number;
    eggsHatched: number;
    producedTraitsSummary: string;
    notes: string;
  },
) {
  await requireOwnedPairing(userId, data.pairingId);

  return prisma.hatchGroup.create({
    data: {
      userId,
      ...data,
      setDate: new Date(`${data.setDate}T00:00:00`),
      hatchDate: new Date(`${data.hatchDate}T00:00:00`),
    },
  });
}

export async function getChicksData(userId: string) {
  const [chicks, flocks, hatchGroups] = await Promise.all([
    prisma.chick.findMany({
      where: { userId },
      include: {
        flock: true,
        hatchGroup: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.flock.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    }),
    prisma.hatchGroup.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    chicks: chicks.map((chick) => ({
      id: chick.id,
      bandNumber: chick.bandNumber,
      hatchDate: formatDateOnly(chick.hatchDate),
      flockId: chick.flockId,
      hatchGroupId: chick.hatchGroupId,
      status: chick.status,
      sex: chick.sex,
      color: chick.color,
      observedTraits: chick.observedTraits,
      notes: chick.notes,
      photoUrl: chick.photoUrl,
      createdAt: formatDateTime(chick.createdAt),
      flockName: chick.flock.name,
      hatchGroupName: chick.hatchGroup?.name ?? "-",
    })),
    flocks: flocks.map((flock) => ({ id: flock.id, name: flock.name })),
    hatchGroups: hatchGroups.map((group) => ({ id: group.id, name: group.name })),
  };
}

export async function createChick(
  userId: string,
  data: {
    bandNumber: string;
    hatchDate: string;
    flockId: string;
    hatchGroupId?: string;
    status: "Available" | "Reserved" | "Sold" | "Holdback";
    sex: "Male" | "Female" | "Unknown";
    color: string;
    observedTraits: string[];
    notes: string;
  },
) {
  await requireOwnedFlock(userId, data.flockId);

  if (data.hatchGroupId) {
    await requireOwnedHatchGroup(userId, data.hatchGroupId);
  }

  return prisma.chick.create({
    data: {
      userId,
      ...data,
      hatchDate: new Date(`${data.hatchDate}T00:00:00`),
      hatchGroupId: data.hatchGroupId || null,
      photoUrl: "",
    },
  });
}

export async function getReservationsData(userId: string) {
  const [reservations, customers, hatchGroups, chicks] = await Promise.all([
    prisma.reservation.findMany({
      where: { userId },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    }),
    prisma.hatchGroup.findMany({
      where: { userId },
      include: {
        pairing: {
          include: {
            sire: true,
            dam: true,
          },
        },
        chicks: {
          where: { userId, status: "Available" },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.chick.findMany({
      where: { userId },
      include: { flock: true, hatchGroup: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    reservations: reservations.map((reservation) => ({
      id: reservation.id,
      customerId: reservation.customerId,
      customerName: reservation.customer.name,
      requestedSex: reservation.requestedSex || "",
      requestedBreed: reservation.requestedBreed,
      requestedVariety: reservation.requestedVariety || "",
      requestedColor: reservation.requestedColor || "",
      quantity: reservation.quantity,
      status: reservation.status,
      notes: reservation.notes || "",
      createdAt: formatDateTime(reservation.createdAt),
    })),
    customers: customers.map((customer) => ({ id: customer.id, name: customer.name })),
    hatchGroups: hatchGroups.map((group) => ({
      id: group.id,
      name: group.name,
      pairingName: group.pairing.name,
      breed: group.pairing.sire.breed || group.pairing.dam.breed || "",
      variety: group.pairing.sire.variety || group.pairing.dam.variety || "",
      producedTraitsSummary: group.producedTraitsSummary || "",
      availableChickCount: group.chicks.length,
    })),
    chicks: chicks.map((chick) => ({
      id: chick.id,
      bandNumber: chick.bandNumber,
      flockId: chick.flockId,
      flockName: chick.flock.name,
      breed: chick.flock.breed,
      variety: chick.flock.variety,
      hatchGroupId: chick.hatchGroupId,
      hatchGroupName: chick.hatchGroup?.name ?? null,
      sex: chick.sex,
      color: chick.color,
      status: chick.status,
    })),
  };
}

export async function createReservation(
  userId: string,
  data: {
    customerId: string;
    requestedSex: string;
    requestedBreed: string;
    requestedVariety: string;
    requestedColor: string;
    quantity: number;
    status: "Waiting" | "Matched" | "Completed" | "Cancelled";
    notes: string;
  },
) {
  await requireOwnedCustomer(userId, data.customerId);

  return prisma.reservation.create({
    data: {
      userId,
      ...data,
    },
  });
}

export async function getOrdersData(userId: string) {
  const [orders, customers, chicks] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: {
        customer: true,
        orderChicks: {
          include: {
            chick: {
              include: {
                flock: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    }),
    prisma.chick.findMany({
      where: {
        userId,
        status: {
          in: ["Available", "Reserved"],
        },
      },
      include: {
        flock: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    orders: orders.map((order) => ({
      id: order.id,
      customerId: order.customerId,
      customer: order.customer.name,
      chickCount: order.orderChicks.length,
      assignedChicks: order.orderChicks.map((item) => ({
        id: item.chick.id,
        bandNumber: item.chick.bandNumber,
        flockName: item.chick.flock.name,
        status: item.chick.status,
      })),
      status: order.status,
      pickupDate: formatDateOnly(order.pickupDate),
      total: order.total,
      notes: order.notes,
      createdAt: formatDateTime(order.createdAt),
    })),
    customers: customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
    })),
    chicks: chicks.map((chick) => ({
      id: chick.id,
      bandNumber: chick.bandNumber,
      flockName: chick.flock.name,
      status: chick.status,
      color: chick.color,
      sex: chick.sex,
    })),
  };
}

export async function createOrder(
  userId: string,
  data: {
    customerId: string;
    total: number;
    status: string;
    pickupDate: string;
    notes: string;
    chickIds: string[];
  },
) {
  await requireOwnedCustomer(userId, data.customerId);

  const uniqueChickIds = Array.from(new Set(data.chickIds));

  if (uniqueChickIds.length > 0) {
    const ownedChicks = await prisma.chick.findMany({
      where: {
        id: { in: uniqueChickIds },
        userId,
        status: { in: ["Available", "Reserved"] },
      },
    });

    if (ownedChicks.length !== uniqueChickIds.length) {
      throw new Error("One or more chicks cannot be assigned to this order.");
    }
  }

  return prisma.order.create({
    data: {
      userId,
      customerId: data.customerId,
      total: data.total,
      status: data.status,
      pickupDate: new Date(`${data.pickupDate}T00:00:00`),
      notes: data.notes,
      orderChicks: {
        create: uniqueChickIds.map((chickId) => ({
          chickId,
        })),
      },
    },
    include: {
      orderChicks: true,
    },
  });
}

export async function getDashboardData(userId: string) {
  const [customers, flocks, chicks, reservations, orders, hatchGroups, birds, pairings] =
    await Promise.all([
      prisma.customer.findMany({ where: { userId } }),
      prisma.flock.findMany({ where: { userId } }),
      prisma.chick.findMany({
        where: { userId },
        include: { flock: true },
      }),
      prisma.reservation.findMany({
        where: { userId },
        include: { customer: true },
      }),
      prisma.order.findMany({
        where: { userId },
        include: {
          customer: true,
          orderChicks: true,
        },
      }),
      prisma.hatchGroup.findMany({
        where: { userId },
        include: { pairing: true },
      }),
      prisma.bird.findMany({
        where: { userId },
        include: { flock: true },
      }),
      prisma.pairing.findMany({
        where: { userId },
        include: { sire: true, dam: true },
      }),
    ]);

  return {
    stats: [
      {
        label: "Total Customers",
        value: String(customers.length),
        detail: "Shared customer records ready for messaging and waitlists",
      },
      {
        label: "Active Flocks",
        value: String(flocks.filter((flock) => flock.active).length),
        detail: "Breed and variety data organized for breeder planning",
      },
      {
        label: "Chicks Available",
        value: String(chicks.filter((chick) => chick.status === "Available").length),
        detail: "Inventory data is centralized for listings and reservations",
      },
      {
        label: "Reserved Chicks",
        value: String(chicks.filter((chick) => chick.status === "Reserved").length),
        detail: "Order and reservation flows are mapped for automation later",
      },
      {
        label: "Open Reservations",
        value: String(
          reservations.filter((reservation) =>
            ["Waiting", "Matched"].includes(reservation.status),
          ).length,
        ),
        detail: "Breeder requests still waiting on matches or fulfillment",
      },
    ],
    recentChicks: chicks.slice(0, 3).map((chick) => ({
      bandNumber: chick.bandNumber,
      hatchDate: formatDateOnly(chick.hatchDate),
      flock: chick.flock.name,
      status: chick.status,
      notes: chick.notes,
    })),
    recentReservations: reservations.slice(0, 3).map((reservation) => ({
      customer: reservation.customer.name,
      breed: reservation.requestedBreed,
      variety: reservation.requestedVariety || "-",
      quantity: String(reservation.quantity),
      status: reservation.status,
      createdAt: formatDateTime(reservation.createdAt),
    })),
    recentOrders: orders.slice(0, 3).map((order) => ({
      customer: order.customer.name,
      chickCount: String(order.orderChicks.length),
      status: order.status,
      pickupDate: formatDateOnly(order.pickupDate),
    })),
    recentHatchGroups: hatchGroups.slice(0, 3).map((group) => ({
      name: group.name,
      pairing: group.pairing.name,
      setDate: formatDateOnly(group.setDate),
      hatchDate: formatDateOnly(group.hatchDate),
      eggsSet: String(group.eggsSet),
      eggsHatched: String(group.eggsHatched),
    })),
    recentBirds: birds.slice(0, 4).map((bird) => ({
      name: bird.name,
      bandNumber: bird.bandNumber,
      flock: bird.flock.name,
      sex: bird.sex,
      status: bird.status,
    })),
    activePairings: pairings
      .filter((pairing) => pairing.active)
      .slice(0, 3)
      .map((pairing) => ({
        name: pairing.name,
        sire: pairing.sire.name,
        dam: pairing.dam.name,
        goals: pairing.goals || "-",
        status: pairing.active ? "Active" : "Inactive",
      })),
  };
}

export async function getAnalyticsBaseData(userId: string) {
  const [birds, chicks, hatchGroups, orders, pairings, reservations] = await Promise.all([
    prisma.bird.findMany({
      where: { userId },
      include: {
        traits: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.chick.findMany({
      where: { userId },
      include: {
        flock: true,
      },
    }),
    prisma.hatchGroup.findMany({
      where: { userId },
      include: { pairing: { include: { sire: true, dam: true } } },
    }),
    prisma.order.findMany({
      where: { userId },
      include: {
        orderChicks: true,
      },
    }),
    prisma.pairing.findMany({
      where: { userId },
      include: { sire: true, dam: true, hatchGroups: true },
    }),
    prisma.reservation.findMany({
      where: { userId },
    }),
  ]);

  return { birds, chicks, hatchGroups, orders, pairings, reservations };
}

export async function getAiToolsData(userId: string) {
  const [birds, chicks, customers, flocks, hatchGroups, pairings, traits] = await Promise.all([
    prisma.bird.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    }),
    prisma.chick.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    }),
    prisma.flock.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    }),
    prisma.hatchGroup.findMany({
      where: { userId },
      orderBy: { hatchDate: "desc" },
    }),
    prisma.pairing.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.trait.findMany({
      where: { userId },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
  ]);

  return {
    birds: birds.map((bird) => ({
      id: bird.id,
      name: bird.name,
      bandNumber: bird.bandNumber,
      sex: bird.sex,
      breed: bird.breed,
      variety: bird.variety,
      color: bird.color,
      genetics: bird.genetics,
      flockId: bird.flockId,
      status: bird.status,
      notes: bird.notes,
      photoUrl: bird.photoUrl,
      visualTraits: bird.visualTraits,
      carriedTraits: bird.carriedTraits,
      genotypeNotes: bird.genotypeNotes,
      projectTags: bird.projectTags,
      createdAt: formatDateTime(bird.createdAt),
    })),
    chicks: chicks.map((chick) => ({
      id: chick.id,
      bandNumber: chick.bandNumber,
      hatchDate: formatDateOnly(chick.hatchDate),
      flockId: chick.flockId,
      hatchGroupId: chick.hatchGroupId,
      status: chick.status,
      sex: chick.sex,
      color: chick.color,
      observedTraits: chick.observedTraits,
      notes: chick.notes,
      photoUrl: chick.photoUrl,
      createdAt: formatDateTime(chick.createdAt),
    })),
    customers: customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      location: customer.location,
      notes: customer.notes,
      status: customer.status,
      createdAt: formatDateTime(customer.createdAt),
    })),
    flocks: flocks.map((flock) => ({
      id: flock.id,
      name: flock.name,
      breed: flock.breed,
      variety: flock.variety,
      notes: flock.notes,
      active: flock.active,
      createdAt: formatDateTime(flock.createdAt),
    })),
    hatchGroups: hatchGroups.map((group) => ({
      id: group.id,
      name: group.name,
      pairingId: group.pairingId,
      setDate: formatDateOnly(group.setDate),
      hatchDate: formatDateOnly(group.hatchDate),
      eggsSet: group.eggsSet,
      eggsHatched: group.eggsHatched,
      producedTraitsSummary: group.producedTraitsSummary,
      notes: group.notes,
      createdAt: formatDateTime(group.createdAt),
    })),
    pairings: pairings.map((pairing) => ({
      id: pairing.id,
      name: pairing.name,
      sireId: pairing.sireId,
      damId: pairing.damId,
      goals: pairing.goals,
      targetTraits: pairing.targetTraits,
      avoidTraits: pairing.avoidTraits,
      projectGoal: pairing.projectGoal,
      notes: pairing.notes,
      active: pairing.active,
      createdAt: formatDateTime(pairing.createdAt),
    })),
    traits: traits.map(mapTrait),
  };
}
