import { prisma } from "@/lib/prisma";

function formatDateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

function formatDateTime(value: Date) {
  return value.toISOString();
}

export async function getCustomersData() {
  const customers = await prisma.customer.findMany({
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

export async function createCustomer(data: {
  name: string;
  email: string;
  phone: string;
  location: string;
  notes: string;
  status: string;
}) {
  return prisma.customer.create({
    data,
  });
}

export async function getFlocksData() {
  return prisma.flock.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createFlock(data: {
  name: string;
  breed: string;
  variety: string;
  notes: string;
  active: boolean;
}) {
  return prisma.flock.create({
    data,
  });
}

export async function getBirdsData() {
  const [birds, flocks] = await Promise.all([
    prisma.bird.findMany({
      include: { flock: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.flock.findMany({ orderBy: { name: "asc" } }),
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

export async function createBird(data: {
  name: string;
  bandNumber: string;
  sex: "Male" | "Female" | "Unknown";
  breed: string;
  variety: string;
  color: string;
  flockId: string;
  status: "Active" | "Holdback" | "Retired" | "Sold";
  notes: string;
}) {
  return prisma.bird.create({
    data: {
      ...data,
      genetics: "Not tracked yet",
      photoUrl: "",
      visualTraits: [],
      carriedTraits: [],
      genotypeNotes: "",
      projectTags: [],
    },
  });
}

export async function getPairingsData() {
  const [pairings, birds] = await Promise.all([
    prisma.pairing.findMany({
      include: {
        sire: true,
        dam: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.bird.findMany({ orderBy: { name: "asc" } }),
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

export async function createPairing(data: {
  name: string;
  sireId: string;
  damId: string;
  goals: string;
  targetTraits: string[];
  avoidTraits: string[];
  projectGoal: string;
  notes: string;
  active: boolean;
}) {
  return prisma.pairing.create({ data });
}

export async function getHatchGroupsData() {
  const [groups, pairings] = await Promise.all([
    prisma.hatchGroup.findMany({
      include: { pairing: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.pairing.findMany({ orderBy: { name: "asc" } }),
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

export async function createHatchGroup(data: {
  name: string;
  pairingId: string;
  setDate: string;
  hatchDate: string;
  eggsSet: number;
  eggsHatched: number;
  producedTraitsSummary: string;
  notes: string;
}) {
  return prisma.hatchGroup.create({
    data: {
      ...data,
      setDate: new Date(`${data.setDate}T00:00:00`),
      hatchDate: new Date(`${data.hatchDate}T00:00:00`),
    },
  });
}

export async function getChicksData() {
  const [chicks, flocks, hatchGroups] = await Promise.all([
    prisma.chick.findMany({
      include: {
        flock: true,
        hatchGroup: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.flock.findMany({ orderBy: { name: "asc" } }),
    prisma.hatchGroup.findMany({ orderBy: { name: "asc" } }),
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

export async function createChick(data: {
  bandNumber: string;
  hatchDate: string;
  flockId: string;
  hatchGroupId?: string;
  status: "Available" | "Reserved" | "Sold" | "Holdback";
  sex: "Male" | "Female" | "Unknown";
  color: string;
  observedTraits: string[];
  notes: string;
}) {
  return prisma.chick.create({
    data: {
      ...data,
      hatchDate: new Date(`${data.hatchDate}T00:00:00`),
      hatchGroupId: data.hatchGroupId || null,
      photoUrl: "",
    },
  });
}

export async function getReservationsData() {
  const [reservations, customers, flocks, hatchGroups, chicks] = await Promise.all([
    prisma.reservation.findMany({
      include: { customer: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.findMany({ orderBy: { name: "asc" } }),
    prisma.flock.findMany({ orderBy: { name: "asc" } }),
    prisma.hatchGroup.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.chick.findMany({
      include: { flock: true, hatchGroup: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    reservations: reservations.map((reservation) => ({
      id: reservation.id,
      customerId: reservation.customerId,
      customerName: reservation.customer.name,
      requestedSex: reservation.requestedSex,
      requestedBreed: reservation.requestedBreed,
      requestedVariety: reservation.requestedVariety,
      requestedColor: reservation.requestedColor,
      quantity: reservation.quantity,
      status: reservation.status,
      notes: reservation.notes,
      createdAt: formatDateTime(reservation.createdAt),
    })),
    customers: customers.map((customer) => ({ id: customer.id, name: customer.name })),
    flocks: flocks.map((flock) => ({
      id: flock.id,
      name: flock.name,
      breed: flock.breed,
      variety: flock.variety,
    })),
    hatchGroups: hatchGroups.map((group) => ({
      id: group.id,
      name: group.name,
      producedTraitsSummary: group.producedTraitsSummary,
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
      color: chick.color,
      status: chick.status,
    })),
  };
}

export async function createReservation(data: {
  customerId: string;
  requestedSex: string;
  requestedBreed: string;
  requestedVariety: string;
  requestedColor: string;
  quantity: number;
  status: "Waiting" | "Matched" | "Completed" | "Cancelled";
  notes: string;
}) {
  return prisma.reservation.create({ data });
}

export async function getOrdersData() {
  const orders = await prisma.order.findMany({
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });

  return orders.map((order) => ({
    id: order.id,
    customer: order.customer.name,
    chickCount: order.chickIds.length,
    status: order.status,
    pickupDate: formatDateOnly(order.pickupDate),
  }));
}

export async function getDashboardData() {
  const [
    customers,
    flocks,
    chicks,
    reservations,
    orders,
    hatchGroups,
    birds,
    pairings,
  ] = await Promise.all([
    prisma.customer.findMany(),
    prisma.flock.findMany(),
    prisma.chick.findMany({ include: { flock: true } }),
    prisma.reservation.findMany({ include: { customer: true } }),
    prisma.order.findMany({ include: { customer: true } }),
    prisma.hatchGroup.findMany({ include: { pairing: true } }),
    prisma.bird.findMany({ include: { flock: true } }),
    prisma.pairing.findMany({ include: { sire: true, dam: true } }),
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
      variety: reservation.requestedVariety,
      quantity: String(reservation.quantity),
      status: reservation.status,
      createdAt: formatDateTime(reservation.createdAt),
    })),
    recentOrders: orders.slice(0, 3).map((order) => ({
      customer: order.customer.name,
      chickCount: String(order.chickIds.length),
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
        goals: pairing.goals,
        status: pairing.active ? "Active" : "Inactive",
      })),
  };
}

export async function getAnalyticsBaseData() {
  const [birds, chicks, hatchGroups, orders, pairings, reservations] = await Promise.all([
    prisma.bird.findMany(),
    prisma.chick.findMany(),
    prisma.hatchGroup.findMany({
      include: { pairing: { include: { sire: true, dam: true } } },
    }),
    prisma.order.findMany(),
    prisma.pairing.findMany({
      include: { sire: true, dam: true, hatchGroups: true },
    }),
    prisma.reservation.findMany(),
  ]);

  return { birds, chicks, hatchGroups, orders, pairings, reservations };
}
