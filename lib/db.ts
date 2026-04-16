import { deriveIncubationDates, HATCH_BREED_OPTIONS } from "@/lib/hatch-groups";
import { prisma } from "@/lib/prisma";
import {
  SHOW_AWARD_TEMPLATES,
  SHOW_STANDARDS_PROFILES,
  SHOW_STANDARDS_SUPPORT,
} from "@/lib/show-standards";

function formatDateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

function formatDateTime(value: Date) {
  return value.toISOString();
}

function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00Z`);
}

const DEFAULT_EGG_SALE_LOCATIONS = [
  "Roadside",
  "Friend",
  "Market",
  "Feed Store",
  "Farm Stand",
  "Local Shop",
] as const;

function getDayDifference(from: string, to: string) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((parseDateOnly(to).getTime() - parseDateOnly(from).getTime()) / msPerDay);
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

async function requireOwnedIncubator(userId: string, incubatorId: string) {
  const incubator = await prisma.incubator.findFirst({
    where: { id: incubatorId, userId },
  });

  if (!incubator) {
    throw new Error("Incubator not found.");
  }

  return incubator;
}

async function requireOwnedChick(userId: string, chickId: string) {
  const chick = await prisma.chick.findFirst({
    where: { id: chickId, userId },
  });

  if (!chick) {
    throw new Error("Chick not found.");
  }

  return chick;
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

async function requireOwnedEggSaleLocation(userId: string, locationId: string) {
  const location = await prisma.eggSaleLocation.findFirst({
    where: { id: locationId, userId },
  });

  if (!location) {
    throw new Error("Egg sale location not found.");
  }

  return location;
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

async function requireOwnedShow(userId: string, showId: string) {
  const show = await prisma.show.findFirst({
    where: { id: showId, userId },
  });

  if (!show) {
    throw new Error("Show not found.");
  }

  return show;
}

function mapTrait(trait: { id: string; name: string; category: string; description: string }) {
  return {
    id: trait.id,
    name: trait.name,
    category: trait.category,
    description: trait.description,
  };
}

const showAwardFieldLabels = [
  ["bestOfBreed", "Best of Breed"],
  ["reserveOfBreed", "Reserve of Breed"],
  ["bestOfVariety", "Best of Variety"],
  ["reserveOfVariety", "Reserve of Variety"],
  ["bestAmerican", "Best American"],
  ["bestAsiatic", "Best Asiatic"],
  ["bestMediterranean", "Best Mediterranean"],
  ["bestContinental", "Best Continental"],
  ["bestEnglish", "Best English"],
  ["bestGame", "Best Game"],
  ["bestAllOtherStandardBreeds", "Best All Other Standard Breeds"],
  ["bestBantam", "Best Bantam"],
  ["bestInShow", "Best in Show"],
  ["reserveInShow", "Reserve in Show"],
] as const;

function getShowEntryAwards(
  entry: {
    customAwardText: string;
  } & Record<(typeof showAwardFieldLabels)[number][0], boolean>,
) {
  const awards: string[] = showAwardFieldLabels
    .filter(([field]) => entry[field])
    .map(([, label]) => label);

  if (entry.customAwardText) {
    awards.push(entry.customAwardText);
  }

  return awards;
}

function buildShowStringLabel(entry: {
  showString: string;
  sizeClass: string;
  breed: string;
  variety: string;
  sexClass: string;
  ageClass: string;
  specialEntryType: string;
  entryClass: string;
}) {
  if (entry.showString) {
    return entry.showString;
  }

  return [
    entry.sizeClass,
    entry.breed,
    entry.variety,
    entry.sexClass,
    entry.ageClass,
    entry.specialEntryType,
    entry.entryClass,
  ]
    .filter(Boolean)
    .join(" / ");
}

function incrementCount(map: Map<string, number>, key: string) {
  if (!key) {
    return;
  }

  map.set(key, (map.get(key) ?? 0) + 1);
}

function mapCountList(map: Map<string, number>, labelKey: string) {
  return Array.from(map.entries())
    .map(([label, count]) => ({ [labelKey]: label, count }))
    .sort((left, right) => {
      if (right.count === left.count) {
        return String(left[labelKey]).localeCompare(String(right[labelKey]));
      }

      return right.count - left.count;
    });
}

export async function getCustomersData(userId: string) {
  const customers = await prisma.customer.findMany({
    where: { userId },
    include: {
      reservations: {
        orderBy: { createdAt: "desc" },
      },
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
    reservations: customer.reservations.map((reservation) => ({
      id: reservation.id,
      customerId: reservation.customerId,
      requestedSex: reservation.requestedSex || "",
      requestedBreed: reservation.requestedBreed,
      requestedVariety: reservation.requestedVariety || "",
      requestedColor: reservation.requestedColor || "",
      quantity: reservation.quantity,
      status: reservation.status,
      notes: reservation.notes || "",
      createdAt: formatDateTime(reservation.createdAt),
    })),
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
      showEntries: {
        where: { userId },
        include: {
          show: true,
        },
        orderBy: [{ show: { date: "desc" } }, { createdAt: "desc" }],
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
  const showHistory = bird.showEntries.map((entry) => ({
    id: entry.id,
    showId: entry.showId,
    showName: entry.show.showName,
    showDate: formatDateOnly(entry.show.date),
    location: entry.show.location,
    species: entry.species,
    sizeClass: entry.sizeClass,
    sexClass: entry.sexClass,
    ageClass: entry.ageClass,
    breed: entry.breed,
    variety: entry.variety,
    division: entry.division,
    entryClass: entry.entryClass,
    specialEntryType: entry.specialEntryType,
    placement: entry.placement,
    result: entry.result,
    awards: getShowEntryAwards(entry),
    judgeComments: entry.judgeComments,
    judgeName: entry.judgeName,
    pointsEarned: entry.pointsEarned,
  }));
  const bestAwardsSummary = Array.from(
    new Map(
      showHistory
        .flatMap((entry) => entry.awards)
        .map((award) => [award, award]),
    ).values(),
  );

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
      breedDesignation: group.breedDesignation,
      setDate: formatDateOnly(group.setDate),
      lockdownDate: formatDateOnly(group.lockdownDate),
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
    showHistory,
    bestAwardsSummary,
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

function formatDeathReason(reason: string) {
  return reason
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (value) => value.toUpperCase());
}

function calculateHatchRate(eggsSet: number, eggsHatched: number) {
  if (eggsSet <= 0) {
    return 0;
  }

  return Math.round((eggsHatched / eggsSet) * 100);
}

function calculateFertilityRate(eggsSet: number, eggsCleared: number) {
  if (eggsSet <= 0) {
    return 0;
  }

  return Math.round(((eggsSet - eggsCleared) / eggsSet) * 100);
}

function calculateHatchOfFertileRate(eggsSet: number, eggsCleared: number, eggsHatched: number) {
  const fertileEggs = eggsSet - eggsCleared;
  if (fertileEggs <= 0) {
    return 0;
  }

  return Math.round((eggsHatched / fertileEggs) * 100);
}

function calculateSurvivalRate(totalChicks: number, deathCount: number) {
  if (totalChicks <= 0) {
    return 0;
  }

  return Math.round(((totalChicks - deathCount) / totalChicks) * 100);
}

export async function getHatchGroupsData(userId: string) {
  const [groups, pairings] = await Promise.all([
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
          where: { userId },
          include: {
            deathRecords: true,
          },
        },
        incubatorRuns: {
          include: {
            incubator: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.pairing.findMany({
      where: { userId },
      include: {
        sire: true,
        dam: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    hatchGroups: groups.map((group) => {
      const deathCount = group.chicks.reduce(
        (sum, chick) => sum + chick.deathRecords.length,
        0,
      );
      const incubatorRun = group.incubatorRuns[0];

      return {
        id: group.id,
        name: group.name,
        pairingId: group.pairingId,
        breedDesignation: group.breedDesignation,
        pairingName: group.pairing?.name ?? "Mixed flock / not set",
        pairingSireName: group.pairing?.sire.name ?? "",
        pairingDamName: group.pairing?.dam.name ?? "",
      setDate: formatDateOnly(group.setDate),
      lockdownDate: formatDateOnly(group.lockdownDate),
      hatchDate: formatDateOnly(group.hatchDate),
      eggsSet: group.eggsSet,
      eggsCleared: group.eggsCleared,
      eggsQuitters: group.eggsQuitters,
      eggsHatched: group.eggsHatched,
      producedTraitsSummary: group.producedTraitsSummary,
      notes: group.notes,
      createdAt: formatDateTime(group.createdAt),
        hatchRate: calculateHatchRate(group.eggsSet, group.eggsHatched),
        fertilityRate: calculateFertilityRate(group.eggsSet, group.eggsCleared),
        hatchOfFertileRate: calculateHatchOfFertileRate(
          group.eggsSet,
          group.eggsCleared,
          group.eggsHatched,
        ),
        chickCount: group.chicks.length,
        deathCount,
        survivalRate: calculateSurvivalRate(group.chicks.length, deathCount),
        incubatorName: incubatorRun?.incubator.name ?? "",
        incubatorRunId: incubatorRun?.id ?? null,
      };
    }),
    pairings: pairings.map((pairing) => ({
      id: pairing.id,
      name: pairing.name,
      targetTraits: pairing.targetTraits,
      sireName: pairing.sire.name,
      damName: pairing.dam.name,
      breedDesignation: pairing.sire.breed || pairing.dam.breed || "Chicken",
    })),
    breedOptions: HATCH_BREED_OPTIONS,
  };
}

export async function createHatchGroup(
  userId: string,
  data: {
    name: string;
    pairingId?: string;
    breedDesignation: string;
    setDate: string;
    lockdownDate?: string;
    hatchDate: string;
    eggsSet: number;
    eggsCleared: number;
    eggsQuitters: number;
    eggsHatched: number;
    producedTraitsSummary: string;
    notes: string;
  },
) {
  let producedTraitsSummary = data.producedTraitsSummary;

  if (data.pairingId) {
    const pairing = await requireOwnedPairing(userId, data.pairingId);
    if (!producedTraitsSummary && pairing.targetTraits.length > 0) {
      producedTraitsSummary = `Expected traits: ${pairing.targetTraits.join(", ")}`;
    }
  }
  const derivedDates = deriveIncubationDates(data.setDate, data.breedDesignation);

  return prisma.hatchGroup.create({
    data: {
      userId,
      ...data,
      producedTraitsSummary,
      pairingId: data.pairingId || null,
      setDate: new Date(`${data.setDate}T00:00:00`),
      lockdownDate: new Date(`${(data.lockdownDate || derivedDates.lockdownDate)}T00:00:00`),
      hatchDate: new Date(`${data.hatchDate}T00:00:00`),
    },
  });
}

export async function updateHatchGroup(
  userId: string,
  hatchGroupId: string,
  data: {
    name: string;
    pairingId?: string;
    breedDesignation: string;
    setDate: string;
    lockdownDate?: string;
    hatchDate: string;
    eggsSet: number;
    eggsCleared: number;
    eggsQuitters: number;
    eggsHatched: number;
    producedTraitsSummary: string;
    notes: string;
  },
) {
  await requireOwnedHatchGroup(userId, hatchGroupId);
  let producedTraitsSummary = data.producedTraitsSummary;
  if (data.pairingId) {
    const pairing = await requireOwnedPairing(userId, data.pairingId);
    if (!producedTraitsSummary && pairing.targetTraits.length > 0) {
      producedTraitsSummary = `Expected traits: ${pairing.targetTraits.join(", ")}`;
    }
  }
  const derivedDates = deriveIncubationDates(data.setDate, data.breedDesignation);

  return prisma.hatchGroup.update({
    where: { id: hatchGroupId },
    data: {
      ...data,
      producedTraitsSummary,
      pairingId: data.pairingId || null,
      setDate: new Date(`${data.setDate}T00:00:00`),
      lockdownDate: new Date(`${(data.lockdownDate || derivedDates.lockdownDate)}T00:00:00`),
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
        hatchGroup: {
          include: {
            pairing: {
              include: {
                sire: true,
                dam: true,
              },
            },
          },
        },
        dnaTestRequests: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        deathRecords: {
          orderBy: { deathDate: "desc" },
          take: 1,
        },
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
      dnaStatus: chick.dnaTestRequests[0]?.status ?? "None",
      createdAt: formatDateTime(chick.createdAt),
      flockName: chick.flock.name,
      hatchGroupName: chick.hatchGroup?.name ?? "-",
      pairingName: chick.hatchGroup?.pairing?.name ?? "",
      sireName: chick.hatchGroup?.pairing?.sire.name ?? "",
      damName: chick.hatchGroup?.pairing?.dam.name ?? "",
      deathRecord:
        chick.deathRecords[0]
          ? {
              id: chick.deathRecords[0].id,
              deathDate: formatDateOnly(chick.deathRecords[0].deathDate),
              deathReason: chick.deathRecords[0].deathReason,
              deathReasonLabel: formatDeathReason(chick.deathRecords[0].deathReason),
              notes: chick.deathRecords[0].notes,
            }
          : null,
    })),
    flocks: flocks.map((flock) => ({ id: flock.id, name: flock.name })),
    hatchGroups: hatchGroups.map((group) => ({ id: group.id, name: group.name })),
  };
}

export async function getChickProfileData(userId: string, chickId: string) {
  const [chick, flocks, hatchGroups] = await Promise.all([
    prisma.chick.findFirst({
      where: { id: chickId, userId },
      include: {
        flock: true,
        hatchGroup: {
          include: {
            pairing: {
              include: {
                sire: true,
                dam: true,
              },
            },
          },
        },
        noteEntries: {
          where: { userId },
          orderBy: { createdAt: "desc" },
        },
        photoEntries: {
          where: { userId },
          orderBy: { createdAt: "desc" },
        },
        dnaTestRequests: {
          where: { userId },
          orderBy: { createdAt: "desc" },
        },
        deathRecords: {
          where: { userId },
          orderBy: { deathDate: "desc" },
        },
        sire: true,
        dam: true,
      },
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

  if (!chick) {
    return null;
  }

  return {
    chick: {
      id: chick.id,
      bandNumber: chick.bandNumber,
      hatchDate: formatDateOnly(chick.hatchDate),
      flockId: chick.flockId,
      flockName: chick.flock.name,
      hatchGroupId: chick.hatchGroupId,
      hatchGroupName: chick.hatchGroup?.name ?? "",
      status: chick.status,
      sex: chick.sex,
      color: chick.color,
      observedTraits: chick.observedTraits,
      notes: chick.notes,
      photoUrl: chick.photoUrl,
      dnaStatus: chick.dnaTestRequests[0]?.status ?? "None",
      createdAt: formatDateTime(chick.createdAt),
      pairingName: chick.hatchGroup?.pairing?.name ?? "",
      sireName: chick.sire?.name ?? chick.hatchGroup?.pairing?.sire.name ?? "",
      damName: chick.dam?.name ?? chick.hatchGroup?.pairing?.dam.name ?? "",
      producedTraitsSummary: chick.hatchGroup?.producedTraitsSummary ?? "",
    },
    notes: chick.noteEntries.map((note) => ({
      id: note.id,
      entityType: note.entityType,
      entityId: note.entityId,
      content: note.content,
      createdAt: formatDateTime(note.createdAt),
    })),
    photos: chick.photoEntries.map((photo) => ({
      id: photo.id,
      entityType: photo.entityType,
      entityId: photo.entityId,
      url: photo.url,
      caption: photo.caption,
      createdAt: formatDateTime(photo.createdAt),
    })),
    dnaTests: chick.dnaTestRequests.map((request) => ({
      id: request.id,
      bandNumber: request.bandNumber,
      testType: request.testType,
      status: request.status,
      externalOrderId: request.externalOrderId || "",
      resultSummary: request.resultSummary || "",
      completedAt: request.completedAt ? formatDateTime(request.completedAt) : null,
      createdAt: formatDateTime(request.createdAt),
    })),
    deathRecords: chick.deathRecords.map((record) => ({
      id: record.id,
      deathDate: formatDateOnly(record.deathDate),
      deathReason: record.deathReason,
      deathReasonLabel: formatDeathReason(record.deathReason),
      notes: record.notes,
      createdAt: formatDateTime(record.createdAt),
    })),
    flocks: flocks.map((flock) => ({
      id: flock.id,
      name: flock.name,
    })),
    hatchGroups: hatchGroups.map((group) => ({
      id: group.id,
      name: group.name,
    })),
  };
}

export async function createDnaTestRequest(
  userId: string,
  data: {
    chickId: string;
    testType: string;
  },
) {
  const chick = await requireOwnedChick(userId, data.chickId);

  return prisma.dnaTestRequest.create({
    data: {
      userId,
      chickId: chick.id,
      bandNumber: chick.bandNumber,
      testType: data.testType,
      status: "Pending",
    },
  });
}

export async function createChick(
  userId: string,
  data: {
    bandNumber: string;
    hatchDate: string;
    flockId: string;
    hatchGroupId?: string;
    status: "Available" | "Reserved" | "Sold" | "Holdback" | "Deceased";
    sex: "Male" | "Female" | "Unknown";
    color: string;
    observedTraits: string[];
    notes: string;
  },
) {
  await requireOwnedFlock(userId, data.flockId);

  let pairingIds: { sireId: string | null; damId: string | null } = {
    sireId: null,
    damId: null,
  };

  if (data.hatchGroupId) {
    const hatchGroup = await prisma.hatchGroup.findFirst({
      where: { id: data.hatchGroupId, userId },
      include: {
        pairing: true,
      },
    });

    if (!hatchGroup) {
      throw new Error("Hatch group not found.");
    }

    pairingIds = {
      sireId: hatchGroup.pairing?.sireId ?? null,
      damId: hatchGroup.pairing?.damId ?? null,
    };
  }

  return prisma.chick.create({
    data: {
      userId,
      ...data,
      hatchDate: new Date(`${data.hatchDate}T00:00:00`),
      hatchGroupId: data.hatchGroupId || null,
      sireId: pairingIds.sireId,
      damId: pairingIds.damId,
      photoUrl: "",
    },
  });
}

export async function updateChick(
  userId: string,
  chickId: string,
  data: {
    bandNumber: string;
    hatchDate: string;
    flockId: string;
    hatchGroupId?: string;
    status: "Available" | "Reserved" | "Sold" | "Holdback" | "Deceased";
    sex: "Male" | "Female" | "Unknown";
    color: string;
    observedTraits: string[];
    notes: string;
  },
) {
  await requireOwnedChick(userId, chickId);
  await requireOwnedFlock(userId, data.flockId);

  let pairingIds: { sireId: string | null; damId: string | null } = {
    sireId: null,
    damId: null,
  };

  if (data.hatchGroupId) {
    const hatchGroup = await prisma.hatchGroup.findFirst({
      where: { id: data.hatchGroupId, userId },
      include: {
        pairing: true,
      },
    });

    if (!hatchGroup) {
      throw new Error("Hatch group not found.");
    }

    pairingIds = {
      sireId: hatchGroup.pairing?.sireId ?? null,
      damId: hatchGroup.pairing?.damId ?? null,
    };
  }

  return prisma.chick.update({
    where: { id: chickId },
    data: {
      bandNumber: data.bandNumber,
      hatchDate: new Date(`${data.hatchDate}T00:00:00`),
      flockId: data.flockId,
      hatchGroupId: data.hatchGroupId || null,
      status: data.status,
      sex: data.sex,
      color: data.color,
      observedTraits: data.observedTraits,
      notes: data.notes,
      sireId: pairingIds.sireId,
      damId: pairingIds.damId,
    },
  });
}

export async function createChickDeathRecord(
  userId: string,
  data: {
    chickId: string;
    deathDate: string;
    deathReason:
      | "FailureToThrive"
      | "ShippedWeak"
      | "SplayLeg"
      | "Injury"
      | "Predator"
      | "UnabsorbedYolk"
      | "AssistedHatchComplications"
      | "Unknown"
      | "Other";
    notes: string;
  },
) {
  await requireOwnedChick(userId, data.chickId);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.chickDeathRecord.findFirst({
      where: { chickId: data.chickId, userId },
    });

    if (existing) {
      throw new Error("A death record already exists for this chick.");
    }

    const record = await tx.chickDeathRecord.create({
      data: {
        userId,
        chickId: data.chickId,
        deathDate: new Date(`${data.deathDate}T00:00:00`),
        deathReason: data.deathReason,
        notes: data.notes,
      },
    });

    await tx.chick.update({
      where: { id: data.chickId },
      data: { status: "Deceased" },
    });

    return record;
  });
}

export async function createIncubator(
  userId: string,
  data: {
    name: string;
    brand: string;
    model: string;
    notes: string;
    active: boolean;
  },
) {
  return prisma.incubator.create({
    data: {
      userId,
      ...data,
    },
  });
}

export async function updateIncubator(
  userId: string,
  incubatorId: string,
  data: {
    name: string;
    brand: string;
    model: string;
    notes: string;
    active: boolean;
  },
) {
  await requireOwnedIncubator(userId, incubatorId);

  return prisma.incubator.update({
    where: { id: incubatorId },
    data,
  });
}

export async function createIncubatorRun(
  userId: string,
  data: {
    incubatorId: string;
    hatchGroupId: string;
    startDate: string;
    lockdownDate: string;
    expectedHatchDate: string;
    temperatureNotes: string;
    humidityNotes: string;
    turningNotes: string;
    lockdownHumidityNotes: string;
    specialAdjustments: string;
    generalNotes: string;
  },
) {
  await requireOwnedIncubator(userId, data.incubatorId);
  await requireOwnedHatchGroup(userId, data.hatchGroupId);

  return prisma.incubatorRun.create({
    data: {
      userId,
      incubatorId: data.incubatorId,
      hatchGroupId: data.hatchGroupId,
      startDate: new Date(`${data.startDate}T00:00:00`),
      lockdownDate: new Date(`${data.lockdownDate}T00:00:00`),
      expectedHatchDate: new Date(`${data.expectedHatchDate}T00:00:00`),
      temperatureNotes: data.temperatureNotes,
      humidityNotes: data.humidityNotes,
      turningNotes: data.turningNotes,
      lockdownHumidityNotes: data.lockdownHumidityNotes,
      specialAdjustments: data.specialAdjustments,
      generalNotes: data.generalNotes,
    },
  });
}

export async function updateIncubatorRun(
  userId: string,
  runId: string,
  data: {
    incubatorId: string;
    hatchGroupId: string;
    startDate: string;
    lockdownDate: string;
    expectedHatchDate: string;
    temperatureNotes: string;
    humidityNotes: string;
    turningNotes: string;
    lockdownHumidityNotes: string;
    specialAdjustments: string;
    generalNotes: string;
  },
) {
  const run = await prisma.incubatorRun.findFirst({
    where: { id: runId, userId },
  });

  if (!run) {
    throw new Error("Incubator run not found.");
  }

  await requireOwnedIncubator(userId, data.incubatorId);
  await requireOwnedHatchGroup(userId, data.hatchGroupId);

  return prisma.incubatorRun.update({
    where: { id: runId },
    data: {
      incubatorId: data.incubatorId,
      hatchGroupId: data.hatchGroupId,
      startDate: new Date(`${data.startDate}T00:00:00`),
      lockdownDate: new Date(`${data.lockdownDate}T00:00:00`),
      expectedHatchDate: new Date(`${data.expectedHatchDate}T00:00:00`),
      temperatureNotes: data.temperatureNotes,
      humidityNotes: data.humidityNotes,
      turningNotes: data.turningNotes,
      lockdownHumidityNotes: data.lockdownHumidityNotes,
      specialAdjustments: data.specialAdjustments,
      generalNotes: data.generalNotes,
    },
  });
}

export async function getIncubationData(userId: string) {
  const [incubators, hatchGroups, pairings, deathRecords] = await Promise.all([
    prisma.incubator.findMany({
      where: { userId },
      include: {
        runs: {
          include: {
            hatchGroup: {
              include: {
                chicks: {
                  where: { userId },
                  include: {
                    deathRecords: true,
                  },
                },
              },
            },
          },
          orderBy: { startDate: "desc" },
        },
      },
      orderBy: [{ active: "desc" }, { name: "asc" }],
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
          where: { userId },
          include: {
            deathRecords: true,
          },
        },
        incubatorRuns: {
          include: {
            incubator: true,
          },
          orderBy: { startDate: "desc" },
        },
      },
      orderBy: { hatchDate: "desc" },
    }),
    prisma.pairing.findMany({
      where: { userId },
      include: {
        hatchGroups: {
          include: {
            chicks: {
              where: { userId },
              include: { deathRecords: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.chickDeathRecord.findMany({
      where: { userId },
      include: {
        chick: {
          include: {
            hatchGroup: true,
          },
        },
      },
      orderBy: { deathDate: "desc" },
    }),
  ]);

  const hatchGroupSummaries = hatchGroups.map((group) => {
    const deathCount = group.chicks.reduce((sum, chick) => sum + chick.deathRecords.length, 0);
    const availableCount = group.chicks.filter((chick) => chick.status === "Available").length;
    const reservedCount = group.chicks.filter((chick) => chick.status === "Reserved").length;
    const soldCount = group.chicks.filter((chick) => chick.status === "Sold").length;
    const quitterCount = group.eggsQuitters;

    return {
      id: group.id,
      name: group.name,
      pairingName: group.pairing?.name ?? "Mixed flock / not set",
      breedDesignation: group.breedDesignation,
      setDate: formatDateOnly(group.setDate),
      lockdownDate: formatDateOnly(group.lockdownDate),
      hatchDate: formatDateOnly(group.hatchDate),
      eggsSet: group.eggsSet,
      eggsCleared: group.eggsCleared,
      eggsQuitters: group.eggsQuitters,
      eggsHatched: group.eggsHatched,
      hatchRate: calculateHatchRate(group.eggsSet, group.eggsHatched),
      fertilityRate: calculateFertilityRate(group.eggsSet, group.eggsCleared),
      hatchOfFertileRate: calculateHatchOfFertileRate(
        group.eggsSet,
        group.eggsCleared,
        group.eggsHatched,
      ),
      quitterCount,
      chickCount: group.chicks.length,
      deathCount,
      survivalRate: calculateSurvivalRate(group.chicks.length, deathCount),
      availableCount,
      reservedCount,
      soldCount,
      incubatorName: group.incubatorRuns[0]?.incubator.name ?? "",
      reviewFlag:
        calculateHatchRate(group.eggsSet, group.eggsHatched) < 60 || deathCount > 0,
      notes: group.notes,
    };
  });

  const incubatorSummaries = incubators.map((incubator) => {
    const eggsSet = incubator.runs.reduce((sum, run) => sum + run.hatchGroup.eggsSet, 0);
    const eggsCleared = incubator.runs.reduce((sum, run) => sum + run.hatchGroup.eggsCleared, 0);
    const eggsQuitters = incubator.runs.reduce((sum, run) => sum + run.hatchGroup.eggsQuitters, 0);
    const eggsHatched = incubator.runs.reduce((sum, run) => sum + run.hatchGroup.eggsHatched, 0);
    const deathCount = incubator.runs.reduce(
      (sum, run) =>
        sum +
        run.hatchGroup.chicks.reduce((innerSum, chick) => innerSum + chick.deathRecords.length, 0),
      0,
    );
    const chickCount = incubator.runs.reduce((sum, run) => sum + run.hatchGroup.chicks.length, 0);

    return {
      id: incubator.id,
      name: incubator.name,
      brand: incubator.brand,
      model: incubator.model,
      notes: incubator.notes,
      active: incubator.active,
      runCount: incubator.runs.length,
      eggsSet,
      eggsCleared,
      eggsQuitters,
      eggsHatched,
      hatchRate: calculateHatchRate(eggsSet, eggsHatched),
      fertilityRate: calculateFertilityRate(eggsSet, eggsCleared),
      hatchOfFertileRate: calculateHatchOfFertileRate(eggsSet, eggsCleared, eggsHatched),
      deathCount,
      survivalRate: calculateSurvivalRate(chickCount, deathCount),
      averageHatchRate:
        incubator.runs.length > 0
          ? Math.round(
              incubator.runs.reduce(
                (sum, run) =>
                  sum + calculateHatchRate(run.hatchGroup.eggsSet, run.hatchGroup.eggsHatched),
                0,
              ) / incubator.runs.length,
            )
          : 0,
      createdAt: formatDateTime(incubator.createdAt),
    };
  });

  const bestIncubator = [...incubatorSummaries].sort(
    (left, right) => right.averageHatchRate - left.averageHatchRate,
  )[0];
  const worstIncubator = [...incubatorSummaries].sort(
    (left, right) => left.averageHatchRate - right.averageHatchRate,
  )[0];

  const deathReasonCounts = new Map<string, number>();
  for (const record of deathRecords) {
    const label = formatDeathReason(record.deathReason);
    deathReasonCounts.set(label, (deathReasonCounts.get(label) ?? 0) + 1);
  }

  const pairingPerformance = pairings.map((pairing) => {
    const eggsSet = pairing.hatchGroups.reduce((sum, group) => sum + group.eggsSet, 0);
    const eggsHatched = pairing.hatchGroups.reduce((sum, group) => sum + group.eggsHatched, 0);
    return {
      id: pairing.id,
      name: pairing.name,
      hatchGroupCount: pairing.hatchGroups.length,
      eggsSet,
      eggsHatched,
      hatchRate: calculateHatchRate(eggsSet, eggsHatched),
    };
  });
  const topPairing = [...pairingPerformance].sort(
    (left, right) => right.hatchRate - left.hatchRate,
  )[0];

  return {
    incubators: incubatorSummaries.map((incubator) => ({
      ...incubator,
    })),
    runs: incubators.flatMap((incubator) =>
      incubator.runs.map((run) => {
        const deathCount = run.hatchGroup.chicks.reduce(
          (sum, chick) => sum + chick.deathRecords.length,
          0,
        );

        return {
          id: run.id,
          incubatorId: incubator.id,
          incubatorName: incubator.name,
          hatchGroupId: run.hatchGroupId,
          hatchGroupName: run.hatchGroup.name,
          startDate: formatDateOnly(run.startDate),
          lockdownDate: formatDateOnly(run.lockdownDate),
          expectedHatchDate: formatDateOnly(run.expectedHatchDate),
          temperatureNotes: run.temperatureNotes,
          humidityNotes: run.humidityNotes,
          turningNotes: run.turningNotes,
          lockdownHumidityNotes: run.lockdownHumidityNotes,
          specialAdjustments: run.specialAdjustments,
          generalNotes: run.generalNotes,
          eggsSet: run.hatchGroup.eggsSet,
          eggsCleared: run.hatchGroup.eggsCleared,
          eggsQuitters: run.hatchGroup.eggsQuitters,
          eggsHatched: run.hatchGroup.eggsHatched,
          hatchRate: calculateHatchRate(run.hatchGroup.eggsSet, run.hatchGroup.eggsHatched),
          fertilityRate: calculateFertilityRate(
            run.hatchGroup.eggsSet,
            run.hatchGroup.eggsCleared,
          ),
          hatchOfFertileRate: calculateHatchOfFertileRate(
            run.hatchGroup.eggsSet,
            run.hatchGroup.eggsCleared,
            run.hatchGroup.eggsHatched,
          ),
          quitterCount: run.hatchGroup.eggsQuitters,
          survivalRate: calculateSurvivalRate(run.hatchGroup.chicks.length, deathCount),
          deathCount,
          createdAt: formatDateTime(run.createdAt),
          updatedAt: formatDateTime(run.updatedAt),
        };
      }),
    ),
    hatchGroups: hatchGroupSummaries,
    pairings: pairingPerformance,
    deathRecords: deathRecords.map((record) => ({
      id: record.id,
      chickId: record.chickId,
      chickBandNumber: record.chick.bandNumber,
      hatchGroupName: record.chick.hatchGroup?.name ?? "",
      deathDate: formatDateOnly(record.deathDate),
      deathReason: record.deathReason,
      deathReasonLabel: formatDeathReason(record.deathReason),
      notes: record.notes,
    })),
    deathReasonSummary: Array.from(deathReasonCounts.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((left, right) => right.count - left.count),
    incubatorOptions: incubators.map((incubator) => ({
      id: incubator.id,
      name: incubator.name,
      active: incubator.active,
    })),
    hatchGroupOptions: hatchGroups.map((group) => ({
      id: group.id,
      name: group.name,
      setDate: formatDateOnly(group.setDate),
      lockdownDate: formatDateOnly(group.lockdownDate),
      expectedHatchDate: formatDateOnly(group.hatchDate),
    })),
    reports: {
      bestIncubator: bestIncubator
        ? `${bestIncubator.name} averages ${bestIncubator.averageHatchRate}% hatch rate`
        : "Add incubator runs to compare performance",
      lowestIncubator:
        worstIncubator && incubatorSummaries.length > 1
          ? `${worstIncubator.name} is lowest at ${worstIncubator.averageHatchRate}% average hatch rate`
          : "More incubator history is needed for low performer comparisons",
      mostCommonDeathReason:
        Array.from(deathReasonCounts.entries()).sort((left, right) => right[1] - left[1])[0]?.[0] ??
        "No death reasons logged",
      topPairing:
        topPairing && topPairing.hatchGroupCount > 0
          ? `${topPairing.name} is leading at ${topPairing.hatchRate}% hatch rate`
          : "No pairing performance data yet",
      hatchGroupsNeedingReview: hatchGroupSummaries
        .filter((group) => group.reviewFlag)
        .map((group) => group.name),
    },
  };
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
      pairingName: group.pairing?.name ?? "Mixed flock / not set",
      breed: group.pairing?.sire.breed || group.pairing?.dam.breed || "",
      variety: group.pairing?.sire.variety || group.pairing?.dam.variety || "",
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

export async function updateReservation(
  userId: string,
  reservationId: string,
  data: {
    requestedSex: string;
    requestedBreed: string;
    requestedVariety: string;
    requestedColor: string;
    quantity: number;
    status: "Waiting" | "Matched" | "Completed" | "Cancelled";
    notes: string;
  },
) {
  const reservation = await prisma.reservation.findFirst({
    where: { id: reservationId, userId },
  });

  if (!reservation) {
    throw new Error("Reservation not found.");
  }

  return prisma.reservation.update({
    where: { id: reservationId },
    data,
  });
}

export async function deleteReservation(userId: string, reservationId: string) {
  const reservation = await prisma.reservation.findFirst({
    where: { id: reservationId, userId },
  });

  if (!reservation) {
    throw new Error("Reservation not found.");
  }

  return prisma.reservation.delete({
    where: { id: reservationId },
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

async function ensureEggSaleSetup(userId: string) {
  const [settings, locationCount] = await Promise.all([
    prisma.eggSaleSettings.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        defaultPricePerEgg: 0,
        defaultPricePerDozen: 0,
        defaultSaleUnit: "PerDozen",
      },
    }),
    prisma.eggSaleLocation.count({
      where: { userId },
    }),
  ]);

  if (locationCount === 0) {
    await prisma.eggSaleLocation.createMany({
      data: DEFAULT_EGG_SALE_LOCATIONS.map((name) => ({
        userId,
        name,
        description: "",
        isActive: true,
      })),
    });
  }

  return settings;
}

function getEggSaleUnitQuantityLabel(unitType: "PerEgg" | "PerDozen" | "Flat", quantity: number) {
  if (unitType === "PerEgg") {
    return quantity === 1 ? "1 egg" : `${formatEggSaleNumber(quantity)} eggs`;
  }

  if (unitType === "PerDozen") {
    return quantity === 1 ? "1 dozen" : `${formatEggSaleNumber(quantity)} dozen`;
  }

  return quantity === 1 ? "1 flat sale" : `${formatEggSaleNumber(quantity)} flat sales`;
}

function formatEggSaleNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, "");
}

function mapEggSaleType(type: "TableEggs" | "HatchingEggs" | "Other") {
  if (type === "TableEggs") {
    return "Table Eggs";
  }

  if (type === "HatchingEggs") {
    return "Hatching Eggs";
  }

  return "Other";
}

function mapEggSaleUnit(unit: "PerEgg" | "PerDozen" | "Flat") {
  if (unit === "PerEgg") {
    return "Per Egg";
  }

  if (unit === "PerDozen") {
    return "Per Dozen";
  }

  return "Flat";
}

function calculateEggSaleTotal(
  unitType: "PerEgg" | "PerDozen" | "Flat",
  quantity: number,
  pricePerUnit: number,
) {
  if (unitType === "Flat") {
    return pricePerUnit;
  }

  return quantity * pricePerUnit;
}

export async function getEggSalesData(userId: string) {
  await ensureEggSaleSetup(userId);

  const [settings, locations, sales] = await Promise.all([
    prisma.eggSaleSettings.findUniqueOrThrow({
      where: { userId },
    }),
    prisma.eggSaleLocation.findMany({
      where: { userId },
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
    }),
    prisma.eggSale.findMany({
      where: { userId },
      include: {
        location: true,
      },
      orderBy: [{ saleDate: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  const locationStats = new Map<
    string,
    { locationId: string; locationName: string; revenue: number; saleCount: number }
  >();

  for (const sale of sales) {
    const entry = locationStats.get(sale.locationId) ?? {
      locationId: sale.locationId,
      locationName: sale.location.name,
      revenue: 0,
      saleCount: 0,
    };

    entry.revenue += sale.totalAmount;
    entry.saleCount += 1;
    locationStats.set(sale.locationId, entry);
  }

  return {
    settings: {
      id: settings.id,
      defaultPricePerEgg: settings.defaultPricePerEgg,
      defaultPricePerDozen: settings.defaultPricePerDozen,
      defaultSaleUnit: settings.defaultSaleUnit,
      defaultSaleUnitLabel: mapEggSaleUnit(settings.defaultSaleUnit),
      createdAt: formatDateTime(settings.createdAt),
      updatedAt: formatDateTime(settings.updatedAt),
    },
    locations: locations.map((location) => ({
      id: location.id,
      name: location.name,
      description: location.description,
      isActive: location.isActive,
      createdAt: formatDateTime(location.createdAt),
      updatedAt: formatDateTime(location.updatedAt),
      saleCount: locationStats.get(location.id)?.saleCount ?? 0,
      revenue: locationStats.get(location.id)?.revenue ?? 0,
    })),
    sales: sales.map((sale) => ({
      id: sale.id,
      saleDate: formatDateOnly(sale.saleDate),
      locationId: sale.locationId,
      locationName: sale.location.name,
      saleType: sale.saleType,
      saleTypeLabel: mapEggSaleType(sale.saleType),
      quantity: sale.quantity,
      quantityLabel: getEggSaleUnitQuantityLabel(sale.unitType, sale.quantity),
      unitType: sale.unitType,
      unitTypeLabel: mapEggSaleUnit(sale.unitType),
      pricePerUnit: sale.pricePerUnit,
      totalAmount: sale.totalAmount,
      notes: sale.notes,
      createdAt: formatDateTime(sale.createdAt),
      updatedAt: formatDateTime(sale.updatedAt),
    })),
    reporting: {
      byLocation: Array.from(locationStats.values()).sort((left, right) => {
        if (right.revenue === left.revenue) {
          return left.locationName.localeCompare(right.locationName);
        }

        return right.revenue - left.revenue;
      }),
    },
  };
}

export async function createEggSaleLocation(
  userId: string,
  data: {
    name: string;
    description: string;
  },
) {
  return prisma.eggSaleLocation.create({
    data: {
      userId,
      name: data.name,
      description: data.description,
      isActive: true,
    },
  });
}

export async function updateEggSaleLocation(
  userId: string,
  locationId: string,
  data: {
    name: string;
    description: string;
    isActive: boolean;
  },
) {
  await requireOwnedEggSaleLocation(userId, locationId);

  return prisma.eggSaleLocation.update({
    where: { id: locationId },
    data: {
      name: data.name,
      description: data.description,
      isActive: data.isActive,
    },
  });
}

export async function updateEggSaleSettings(
  userId: string,
  data: {
    defaultPricePerEgg: number;
    defaultPricePerDozen: number;
    defaultSaleUnit: "PerEgg" | "PerDozen" | "Flat";
  },
) {
  return prisma.eggSaleSettings.upsert({
    where: { userId },
    update: {
      defaultPricePerEgg: data.defaultPricePerEgg,
      defaultPricePerDozen: data.defaultPricePerDozen,
      defaultSaleUnit: data.defaultSaleUnit,
    },
    create: {
      userId,
      defaultPricePerEgg: data.defaultPricePerEgg,
      defaultPricePerDozen: data.defaultPricePerDozen,
      defaultSaleUnit: data.defaultSaleUnit,
    },
  });
}

export async function createEggSale(
  userId: string,
  data: {
    saleDate: string;
    locationId: string;
    saleType: "TableEggs" | "HatchingEggs" | "Other";
    quantity: number;
    unitType: "PerEgg" | "PerDozen" | "Flat";
    pricePerUnit: number;
    notes: string;
  },
) {
  const location = await requireOwnedEggSaleLocation(userId, data.locationId);

  if (!location.isActive) {
    throw new Error("This egg sale location is inactive.");
  }

  const quantity = data.unitType === "Flat" ? 1 : data.quantity;
  const totalAmount = calculateEggSaleTotal(data.unitType, quantity, data.pricePerUnit);

  return prisma.eggSale.create({
    data: {
      userId,
      saleDate: new Date(`${data.saleDate}T00:00:00`),
      locationId: data.locationId,
      saleType: data.saleType,
      quantity,
      unitType: data.unitType,
      pricePerUnit: data.pricePerUnit,
      totalAmount,
      notes: data.notes,
    },
    include: {
      location: true,
    },
  });
}

export async function createFeedback(
  userId: string,
  data: {
    type: "Bug" | "FeatureRequest" | "GeneralFeedback";
    message: string;
    page: string;
  },
) {
  return prisma.feedback.create({
    data: {
      userId,
      type: data.type,
      message: data.message,
      page: data.page,
      status: "Open",
    },
  });
}

export async function getTasksData(userId: string) {
  const [hatchGroups, orders, reservations, tasks] = await Promise.all([
    prisma.hatchGroup.findMany({
      where: { userId },
      include: { pairing: true },
      orderBy: { lockdownDate: "asc" },
    }),
    prisma.order.findMany({
      where: { userId },
      include: { customer: true, orderChicks: true },
      orderBy: { pickupDate: "asc" },
    }),
    prisma.reservation.findMany({
      where: {
        userId,
        status: {
          in: ["Waiting", "Matched"],
        },
      },
      include: { customer: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.task.findMany({
      where: { userId },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  const today = formatDateOnly(new Date());

  const alerts = [
    ...hatchGroups.flatMap((group) => {
      const lockdownDate = formatDateOnly(group.lockdownDate);
      const hatchDate = formatDateOnly(group.hatchDate);
      const daysUntilLockdown = getDayDifference(today, lockdownDate);
      const daysUntilHatch = getDayDifference(today, hatchDate);
      const items: Array<{
        id: string;
        title: string;
        detail: string;
        category: string;
        dueDate: string;
        priority: "Today" | "Upcoming" | "Watch";
        href: string;
      }> = [];

      if (daysUntilLockdown <= 3) {
        items.push({
          id: `lockdown-${group.id}`,
          title: `Move ${group.name} to lockdown`,
          detail:
            group.pairing?.name
              ? `${group.pairing.name} hatch group reaches lockdown soon.`
              : "Mixed-flock hatch group reaches lockdown soon.",
          category: "Hatch Workflow",
          dueDate: lockdownDate,
          priority: daysUntilLockdown <= 0 ? "Today" : "Upcoming",
          href: "/hatch-groups",
        });
      }

      if (daysUntilHatch <= 2) {
        items.push({
          id: `hatch-${group.id}`,
          title: `Prepare for ${group.name} hatch`,
          detail: "Brooder space, notes, and chick intake should be ready before hatch day.",
          category: "Hatch Workflow",
          dueDate: hatchDate,
          priority: daysUntilHatch <= 0 ? "Today" : "Upcoming",
          href: "/hatch-groups",
        });
      }

      return items;
    }),
    ...orders.flatMap((order) => {
      const pickupDate = formatDateOnly(order.pickupDate);
      const daysUntilPickup = getDayDifference(today, pickupDate);

      if (daysUntilPickup > 3) {
        return [];
      }

      return [
        {
          id: `pickup-${order.id}`,
          title: `Prepare pickup for ${order.customer.name}`,
          detail: `${order.orderChicks.length} chicks assigned to this order.`,
          category: "Order Follow-Up",
          dueDate: pickupDate,
          priority: daysUntilPickup <= 0 ? "Today" : "Upcoming",
          href: "/orders",
        },
      ];
    }),
    ...reservations.flatMap((reservation) => {
      const createdDate = formatDateOnly(reservation.createdAt);
      const ageInDays = getDayDifference(createdDate, today);

      if (ageInDays < 7) {
        return [];
      }

      return [
        {
          id: `reservation-${reservation.id}`,
          title: `Review reservation for ${reservation.customer.name}`,
          detail: `Open ${reservation.status.toLowerCase()} reservation waiting ${ageInDays} days.`,
          category: "Customer Follow-Up",
          dueDate: createdDate,
          priority: ageInDays >= 14 ? "Today" : "Watch",
          href: "/reservations",
        },
      ];
    }),
  ].sort((left, right) => left.dueDate.localeCompare(right.dueDate));

  const dueToday = alerts.filter((task) => task.priority === "Today").length;
  const upcoming = alerts.filter((task) => task.priority === "Upcoming").length;
  const watchList = alerts.filter((task) => task.priority === "Watch").length;

  return {
    stats: {
      dueToday,
      upcoming,
      watchList,
      openTasks: tasks.filter((task) => task.status !== "Completed").length,
      completedTasks: tasks.filter((task) => task.status === "Completed").length,
    },
    alerts,
    tasks: tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: formatDateOnly(task.dueDate),
      relatedEntityType: task.relatedEntityType,
      relatedEntityId: task.relatedEntityId,
      notes: task.notes,
      createdAt: formatDateTime(task.createdAt),
    })),
  };
}

export async function createTask(
  userId: string,
  data: {
    title: string;
    description: string;
    status: "Open" | "InProgress" | "Completed";
    priority: "Low" | "Medium" | "High";
    dueDate: string;
    relatedEntityType:
      | "Bird"
      | "Chick"
      | "HatchGroup"
      | "Customer"
      | "Order"
      | "Reservation"
      | "Show"
      | "Other";
    relatedEntityId: string;
    notes: string;
  },
) {
  return prisma.task.create({
    data: {
      userId,
      ...data,
      dueDate: new Date(`${data.dueDate}T00:00:00`),
    },
  });
}

export async function updateTaskStatus(
  userId: string,
  taskId: string,
  status: "Open" | "InProgress" | "Completed",
) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!task) {
    throw new Error("Task not found.");
  }

  return prisma.task.update({
    where: { id: taskId },
    data: { status },
  });
}

export async function getShowsData(userId: string) {
  const [shows, birds, entries] = await Promise.all([
    prisma.show.findMany({
      where: { userId },
      include: {
        entries: {
          include: {
            bird: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { date: "asc" },
    }),
    prisma.bird.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    }),
    prisma.showEntry.findMany({
      where: { userId },
      include: {
        show: true,
        bird: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const today = formatDateOnly(new Date());
  const mappedEntries = entries.map((entry) => {
    const awards = getShowEntryAwards(entry);
    const showString = buildShowStringLabel(entry);

    return {
      id: entry.id,
      showId: entry.showId,
      showName: entry.show.showName,
      showDate: formatDateOnly(entry.show.date),
      location: entry.show.location,
      standardsProfile: entry.show.standardsProfile,
      awardTemplateName: entry.show.awardTemplateName,
      birdId: entry.birdId,
      birdName: entry.bird.name,
      bandNumber: entry.bird.bandNumber,
      entryType: entry.entryType,
      species: entry.species,
      sizeClass: entry.sizeClass,
      sexClass: entry.sexClass,
      ageClass: entry.ageClass,
      breed: entry.breed,
      variety: entry.variety,
      apaClass: entry.apaClass,
      varietyClassification: entry.varietyClassification,
      division: entry.division,
      specialShowDivision: entry.specialShowDivision || entry.show.specialShowDivision,
      entryClass: entry.entryClass,
      specialEntryType: entry.specialEntryType,
      awardTemplateKey: entry.awardTemplateKey || entry.show.awardTemplateName,
      breedClubAward: entry.breedClubAward,
      showString,
      result: entry.result,
      placement: entry.placement,
      awards,
      customAwardText: entry.customAwardText,
      pointsEarned: entry.pointsEarned,
      judgeName: entry.judgeName,
      judgeNumber: entry.judgeNumber,
      judgeComments: entry.judgeComments,
      numberInClass: entry.numberInClass,
      numberOfExhibitors: entry.numberOfExhibitors,
      isWin: entry.isWin,
      createdAt: formatDateTime(entry.createdAt),
    };
  });
  const showStringGroups = Array.from(
    mappedEntries.reduce((groups, entry) => {
      const key = [
        entry.sizeClass || "Open",
        entry.breed || "Breed not set",
        entry.variety || "Variety not set",
        entry.sexClass || "Sex class not set",
        entry.ageClass || "Age class not set",
      ].join(" | ");

      const current = groups.get(key) ?? {
        id: key,
        sizeClass: entry.sizeClass || "Open",
        breed: entry.breed || "Breed not set",
        variety: entry.variety || "Variety not set",
        sexClass: entry.sexClass || "Sex class not set",
        ageClass: entry.ageClass || "Age class not set",
        entries: [] as typeof mappedEntries,
      };

      current.entries.push(entry);
      groups.set(key, current);
      return groups;
    }, new Map<string, {
      id: string;
      sizeClass: string;
      breed: string;
      variety: string;
      sexClass: string;
      ageClass: string;
      entries: typeof mappedEntries;
    }>()),
  )
    .map(([, group]) => ({
      ...group,
      entries: [...group.entries].sort((left, right) => {
        if (left.showDate === right.showDate) {
          return left.birdName.localeCompare(right.birdName);
        }

        return right.showDate.localeCompare(left.showDate);
      }),
    }))
    .sort((left, right) => {
      const sizeCompare = left.sizeClass.localeCompare(right.sizeClass);
      if (sizeCompare !== 0) return sizeCompare;
      const breedCompare = left.breed.localeCompare(right.breed);
      if (breedCompare !== 0) return breedCompare;
      const varietyCompare = left.variety.localeCompare(right.variety);
      if (varietyCompare !== 0) return varietyCompare;
      const sexCompare = left.sexClass.localeCompare(right.sexClass);
      if (sexCompare !== 0) return sexCompare;
      return left.ageClass.localeCompare(right.ageClass);
    });

  const entriesByBreed = new Map<string, number>();
  const entriesByVariety = new Map<string, number>();
  const entriesByClass = new Map<string, number>();
  const winsByBird = new Map<string, number>();
  const winsByBreed = new Map<string, number>();
  const varietyPerformance = new Map<string, { wins: number; points: number }>();

  for (const entry of mappedEntries) {
    incrementCount(entriesByBreed, entry.breed || "Breed not set");
    incrementCount(entriesByVariety, entry.variety || "Variety not set");
    incrementCount(entriesByClass, entry.showString || entry.entryClass || "Class not set");

    if (entry.isWin || entry.awards.length > 0 || Boolean(entry.placement)) {
      incrementCount(winsByBird, entry.birdName);
      incrementCount(winsByBreed, entry.breed || "Breed not set");
      const varietyKey = entry.variety || "Variety not set";
      const current = varietyPerformance.get(varietyKey) ?? { wins: 0, points: 0 };
      current.wins += 1;
      current.points += entry.pointsEarned;
      varietyPerformance.set(varietyKey, current);
    }
  }

  return {
    upcomingShows: shows
      .filter((show) => formatDateOnly(show.date) >= today)
      .map((show) => ({
        id: show.id,
        showName: show.showName,
        location: show.location,
        date: formatDateOnly(show.date),
        standardsProfile: show.standardsProfile,
        awardTemplateName: show.awardTemplateName,
        specialShowDivision: show.specialShowDivision,
        notes: show.notes,
        entryCount: show.entries.length,
      })),
    pastShows: shows
      .filter((show) => formatDateOnly(show.date) < today)
      .map((show) => ({
        id: show.id,
        showName: show.showName,
        location: show.location,
        date: formatDateOnly(show.date),
        standardsProfile: show.standardsProfile,
        awardTemplateName: show.awardTemplateName,
        specialShowDivision: show.specialShowDivision,
        notes: show.notes,
        entryCount: show.entries.length,
      })),
    entries: mappedEntries,
    showStringGroups,
    report: {
      entriesByBreed: mapCountList(entriesByBreed, "breed"),
      entriesByVariety: mapCountList(entriesByVariety, "variety"),
      entriesByClass: mapCountList(entriesByClass, "entryClass"),
      winsByBird: mapCountList(winsByBird, "birdName"),
      winsByBreed: mapCountList(winsByBreed, "breed"),
      topPerformingVarieties: Array.from(varietyPerformance.entries())
        .map(([variety, stats]) => ({
          variety,
          wins: stats.wins,
          points: stats.points,
        }))
        .sort((left, right) => {
          if (right.wins === left.wins) {
            if (right.points === left.points) {
              return left.variety.localeCompare(right.variety);
            }

            return right.points - left.points;
          }

          return right.wins - left.wins;
        }),
      bestBirdsOverTime: mappedEntries
        .filter((entry) => entry.isWin || entry.awards.length > 0 || entry.pointsEarned > 0)
        .sort((left, right) => right.showDate.localeCompare(left.showDate))
        .slice(0, 8)
        .map((entry) => ({
          birdName: entry.birdName,
          bandNumber: entry.bandNumber,
          showName: entry.showName,
          showDate: entry.showDate,
          placement: entry.placement,
          awards: entry.awards,
          pointsEarned: entry.pointsEarned,
        })),
      recentJudgeComments: mappedEntries
        .filter((entry) => entry.judgeComments)
        .sort((left, right) => right.showDate.localeCompare(left.showDate))
        .slice(0, 8)
        .map((entry) => ({
          id: entry.id,
          birdName: entry.birdName,
          showName: entry.showName,
          showDate: entry.showDate,
          judgeName: entry.judgeName,
          judgeComments: entry.judgeComments,
        })),
    },
    birds: birds.map((bird) => ({
      id: bird.id,
      name: bird.name,
      bandNumber: bird.bandNumber,
      breed: bird.breed,
      variety: bird.variety,
      sex: bird.sex,
    })),
    shows: shows.map((show) => ({
      id: show.id,
      showName: show.showName,
      date: formatDateOnly(show.date),
      standardsProfile: show.standardsProfile,
      awardTemplateName: show.awardTemplateName,
      specialShowDivision: show.specialShowDivision,
    })),
    standardsSupport: {
      profiles: [...SHOW_STANDARDS_PROFILES],
      awardTemplates: [...SHOW_AWARD_TEMPLATES],
      species: SHOW_STANDARDS_SUPPORT.map((profile) => ({
        species: profile.species,
        sizeClasses: [...profile.sizeClasses],
        sexClasses: [...profile.sexClasses],
        ageClasses: [...profile.ageClasses],
        apaClasses: [...profile.apaClasses],
        specialShowDivisions: [...profile.specialShowDivisions],
        awardTemplates: [...profile.awardTemplates],
      })),
    },
  };
}

export async function createShow(
  userId: string,
  data: {
    showName: string;
    location: string;
    date: string;
    standardsProfile: string;
    awardTemplateName: string;
    specialShowDivision: string;
    notes: string;
  },
) {
  return prisma.show.create({
    data: {
      userId,
      showName: data.showName,
      location: data.location,
      date: new Date(`${data.date}T00:00:00`),
      standardsProfile: data.standardsProfile,
      awardTemplateName: data.awardTemplateName,
      specialShowDivision: data.specialShowDivision,
      notes: data.notes,
    },
  });
}

export async function updateShow(
  userId: string,
  showId: string,
  data: {
    showName: string;
    location: string;
    date: string;
    standardsProfile: string;
    awardTemplateName: string;
    specialShowDivision: string;
    notes: string;
  },
) {
  await requireOwnedShow(userId, showId);

  return prisma.show.update({
    where: { id: showId },
    data: {
      showName: data.showName,
      location: data.location,
      date: new Date(`${data.date}T00:00:00`),
      standardsProfile: data.standardsProfile,
      awardTemplateName: data.awardTemplateName,
      specialShowDivision: data.specialShowDivision,
      notes: data.notes,
    },
  });
}

export async function createShowEntry(
  userId: string,
  data: {
    showId: string;
    birdId: string;
    entryType: string;
    species: string;
    sizeClass: string;
    sexClass: string;
    ageClass: string;
    breed: string;
    variety: string;
    apaClass: string;
    varietyClassification: string;
    division: string;
    specialShowDivision: string;
    entryClass: string;
    specialEntryType: string;
    awardTemplateKey: string;
    breedClubAward: string;
    showString: string;
    result: string;
    placement: string;
    pointsEarned: number;
    judgeName: string;
    judgeNumber: string;
    judgeComments: string;
    customAwardText: string;
    numberInClass: number;
    numberOfExhibitors: number;
    bestOfBreed: boolean;
    reserveOfBreed: boolean;
    bestOfVariety: boolean;
    reserveOfVariety: boolean;
    bestAmerican: boolean;
    bestAsiatic: boolean;
    bestMediterranean: boolean;
    bestContinental: boolean;
    bestEnglish: boolean;
    bestGame: boolean;
    bestAllOtherStandardBreeds: boolean;
    bestBantam: boolean;
    bestInShow: boolean;
    reserveInShow: boolean;
    isWin: boolean;
  },
) {
  const show = await requireOwnedShow(userId, data.showId);
  const bird = await requireOwnedBird(userId, data.birdId);

  const breed = data.breed || bird.breed;
  const variety = data.variety || bird.variety;
  const sizeClass = data.sizeClass;
  const showString =
    data.showString ||
    buildShowStringLabel({
      showString: "",
      sizeClass,
      breed,
      variety,
      sexClass: data.sexClass,
      ageClass: data.ageClass,
      specialEntryType: data.specialEntryType,
      entryClass: data.entryClass,
    });

  return prisma.showEntry.create({
    data: {
      userId,
      ...data,
      breed,
      variety,
      awardTemplateKey: data.awardTemplateKey || show.awardTemplateName,
      specialShowDivision: data.specialShowDivision || show.specialShowDivision,
      showString,
    },
  });
}

export async function updateShowEntry(
  userId: string,
  entryId: string,
  data: {
    showId: string;
    birdId: string;
    entryType: string;
    species: string;
    sizeClass: string;
    sexClass: string;
    ageClass: string;
    breed: string;
    variety: string;
    apaClass: string;
    varietyClassification: string;
    division: string;
    specialShowDivision: string;
    entryClass: string;
    specialEntryType: string;
    awardTemplateKey: string;
    breedClubAward: string;
    showString: string;
    result: string;
    placement: string;
    pointsEarned: number;
    judgeName: string;
    judgeNumber: string;
    judgeComments: string;
    customAwardText: string;
    numberInClass: number;
    numberOfExhibitors: number;
    bestOfBreed: boolean;
    reserveOfBreed: boolean;
    bestOfVariety: boolean;
    reserveOfVariety: boolean;
    bestAmerican: boolean;
    bestAsiatic: boolean;
    bestMediterranean: boolean;
    bestContinental: boolean;
    bestEnglish: boolean;
    bestGame: boolean;
    bestAllOtherStandardBreeds: boolean;
    bestBantam: boolean;
    bestInShow: boolean;
    reserveInShow: boolean;
    isWin: boolean;
  },
) {
  const existingEntry = await prisma.showEntry.findFirst({
    where: { id: entryId, userId },
  });

  if (!existingEntry) {
    throw new Error("Show entry not found.");
  }

  const show = await requireOwnedShow(userId, data.showId);
  const bird = await requireOwnedBird(userId, data.birdId);

  const breed = data.breed || bird.breed;
  const variety = data.variety || bird.variety;
  const showString =
    data.showString ||
    buildShowStringLabel({
      showString: "",
      sizeClass: data.sizeClass,
      breed,
      variety,
      sexClass: data.sexClass,
      ageClass: data.ageClass,
      specialEntryType: data.specialEntryType,
      entryClass: data.entryClass,
    });

  return prisma.showEntry.update({
    where: { id: entryId },
    data: {
      ...data,
      breed,
      variety,
      awardTemplateKey: data.awardTemplateKey || show.awardTemplateName,
      specialShowDivision: data.specialShowDivision || show.specialShowDivision,
      showString,
    },
  });
}

export async function getStorefrontData(userId: string) {
  const [chicks, birds] = await Promise.all([
    prisma.chick.findMany({
      where: { userId, status: "Available" },
      include: { flock: true, hatchGroup: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.bird.findMany({
      where: { userId, status: "Active" },
      include: { flock: true },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  return {
    chicks: chicks.map((chick) => ({
      id: chick.id,
      type: "Chick",
      title: chick.bandNumber,
      subtitle: chick.flock.name,
      price: "Contact for pricing",
      shortDescription: [chick.flock.breed, chick.flock.variety, chick.color].filter(Boolean).join(" · ") || "Available chick",
      status: chick.status,
      hatchDate: formatDateOnly(chick.hatchDate),
      hatchGroupName: chick.hatchGroup?.name ?? "",
    })),
    birds: birds.map((bird) => ({
      id: bird.id,
      type: "Bird",
      title: bird.name,
      subtitle: bird.bandNumber,
      price: "Contact for pricing",
      shortDescription: [bird.breed, bird.variety, bird.color].filter(Boolean).join(" · ") || "Active breeder listing",
      status: bird.status,
      flockName: bird.flock.name,
    })),
  };
}

export async function getDashboardData(userId: string) {
  const [customers, flocks, chicks, reservations, orders, hatchGroups, birds, pairings, incubators] =
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
        include: {
          pairing: true,
          chicks: {
            where: { userId },
            include: {
              deathRecords: true,
            },
          },
          incubatorRuns: {
            include: {
              incubator: true,
            },
          },
        },
      }),
      prisma.bird.findMany({
        where: { userId },
        include: { flock: true },
      }),
      prisma.pairing.findMany({
        where: { userId },
        include: { sire: true, dam: true },
      }),
      prisma.incubator.findMany({
        where: { userId },
        include: {
          runs: {
            include: {
              hatchGroup: {
                include: {
                  chicks: {
                    where: { userId },
                    include: {
                      deathRecords: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

  const reviewAlerts = [
    ...hatchGroups
      .map((group) => {
        const deathCount = group.chicks.reduce(
          (sum, chick) => sum + chick.deathRecords.length,
          0,
        );
        const hatchRate = calculateHatchRate(group.eggsSet, group.eggsHatched);
        const fertilityRate = calculateFertilityRate(group.eggsSet, group.eggsCleared);

        if (hatchRate < 60) {
          return {
            key: `group-hatch-${group.id}`,
            title: `${group.name} needs hatch review`,
            detail: `${hatchRate}% hatch rate from ${group.eggsSet} eggs set. Check incubator notes, fertility, and handling.`,
            href: "/incubation",
            tone: "warning",
          };
        }

        if (deathCount > 0) {
          return {
            key: `group-loss-${group.id}`,
            title: `${group.name} has logged chick losses`,
            detail: `${deathCount} death record${deathCount === 1 ? "" : "s"} recorded. Review causes and survival notes.`,
            href: "/chicks",
            tone: "warning",
          };
        }

        if (group.eggsCleared > 0 && fertilityRate < 75) {
          return {
            key: `group-fertility-${group.id}`,
            title: `${group.name} is showing weak fertility`,
            detail: `${group.eggsCleared} clears logged with ${fertilityRate}% fertility. Review parent pairing and storage conditions.`,
            href: "/hatch-groups",
            tone: "watch",
          };
        }

        return null;
      })
      .filter(
        (
          alert,
        ): alert is {
          key: string;
          title: string;
          detail: string;
          href: string;
          tone: "warning" | "watch";
        } => alert !== null,
      ),
    ...incubators
      .map((incubator) => {
        if (incubator.runs.length < 2) {
          return null;
        }

        const eggsSet = incubator.runs.reduce((sum, run) => sum + run.hatchGroup.eggsSet, 0);
        const eggsHatched = incubator.runs.reduce(
          (sum, run) => sum + run.hatchGroup.eggsHatched,
          0,
        );
        const hatchRate = calculateHatchRate(eggsSet, eggsHatched);

        if (hatchRate >= 65) {
          return null;
        }

        return {
          key: `incubator-${incubator.id}`,
          title: `${incubator.name} is trending low`,
          detail: `${hatchRate}% hatch rate across ${incubator.runs.length} runs. Compare notes and calibrations.`,
          href: "/incubation",
          tone: "watch",
        };
      })
      .filter(
        (
          alert,
        ): alert is {
          key: string;
          title: string;
          detail: string;
          href: string;
          tone: "warning" | "watch";
        } => alert !== null,
      ),
  ]
    .slice(0, 5)
    .map((alert) => ({
      key: alert.key,
      title: alert.title,
      detail: alert.detail,
      href: alert.href,
      tone: alert.tone,
    }));

  return {
    stats: [
      {
        label: "Total Customers",
        value: String(customers.length),
        detail: "Customer records organized for messaging and waitlists",
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
        detail: "Chicks currently committed to customer reservations",
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
    onboardingChecklist: {
      completedCount: [
        flocks.length > 0,
        birds.length > 0,
        chicks.length > 0,
        pairings.length > 0,
        reservations.length > 0,
      ].filter(Boolean).length,
      totalCount: 5,
      items: [
        {
          key: "first-flock",
          label: "Create your first flock",
          description: "Set up a flock so birds and chicks have a home base.",
          href: "/flocks",
          complete: flocks.length > 0,
        },
        {
          key: "first-bird",
          label: "Add your first bird",
          description: "Start building the breeder directory that powers pairings and genetics.",
          href: "/birds",
          complete: birds.length > 0,
        },
        {
          key: "first-chick",
          label: "Add your first chick",
          description: "Track hatch outcomes and inventory from the start.",
          href: "/chicks",
          complete: chicks.length > 0,
        },
        {
          key: "first-pairing",
          label: "Create your first pairing",
          description: "Plan breeder outcomes and connect hatch groups.",
          href: "/pairings",
          complete: pairings.length > 0,
        },
        {
          key: "first-reservation",
          label: "Add your first reservation",
          description: "Capture demand early so chicks and orders stay aligned.",
          href: "/reservations",
          complete: reservations.length > 0,
        },
      ],
    },
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
      pairing: group.pairing?.name ?? "Mixed flock / not set",
      breedDesignation: group.breedDesignation,
      setDate: formatDateOnly(group.setDate),
      lockdownDate: formatDateOnly(group.lockdownDate),
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
    reviewAlerts,
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
      breedDesignation: group.breedDesignation,
      setDate: formatDateOnly(group.setDate),
      lockdownDate: formatDateOnly(group.lockdownDate),
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
