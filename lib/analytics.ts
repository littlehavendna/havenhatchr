export type AnalyticsBird = {
  id: string;
  genotypeNotes: string;
  projectTags: string[];
  visualTraits: string[];
  carriedTraits: string[];
  traits?: Array<{ name: string }>;
};

export type AnalyticsChick = {
  id: string;
  hatchGroupId: string | null;
  status: string;
  sex: string;
  color: string;
  flock?: {
    breed: string;
    variety: string;
  };
};

export type AnalyticsHatchGroup = {
  id: string;
  name: string;
  pairingId: string;
  eggsSet: number;
  eggsHatched: number;
  notes: string;
  setDate: Date;
  hatchDate: Date;
  producedTraitsSummary: string;
  pairing: {
    name: string;
    sire: {
      id: string;
      breed: string;
      variety: string;
      name: string;
    };
    dam: {
      id: string;
      breed: string;
      variety: string;
      name: string;
    };
  };
};

export type AnalyticsPairing = {
  id: string;
  name: string;
  active: boolean;
  projectGoal: string;
  targetTraits: string[];
  sire: {
    id: string;
    name: string;
    breed: string;
    variety: string;
  };
  dam: {
    id: string;
    name: string;
    breed: string;
    variety: string;
  };
  hatchGroups?: Array<{
    eggsSet: number;
    eggsHatched: number;
  }>;
};

export type AnalyticsReservation = {
  id: string;
  quantity: number;
  requestedBreed: string;
  requestedVariety: string;
  requestedSex: string;
  requestedColor: string;
  status: string;
};

export type AnalyticsOrder = {
  id: string;
  status: string;
  pickupDate: Date;
};

export type AnalyticsBaseData = {
  birds: AnalyticsBird[];
  chicks: AnalyticsChick[];
  hatchGroups: AnalyticsHatchGroup[];
  orders: AnalyticsOrder[];
  pairings: AnalyticsPairing[];
  reservations: AnalyticsReservation[];
};

export function calculateHatchRate(eggsSet: number, eggsHatched: number) {
  if (eggsSet <= 0) {
    return 0;
  }

  return Math.round((eggsHatched / eggsSet) * 100);
}

export function buildAnalyticsPayload(data: AnalyticsBaseData) {
  const hatchPerformanceRows = getHatchPerformanceRows(data);
  const pairingPerformanceRows = getPairingPerformanceRows(data);
  const reservationPressureRows = getReservationPressureRows(data);
  const salesSnapshot = getSalesSnapshot(data);
  const geneticsSnapshot = getGeneticsSnapshot(data);
  const insights = getAlertsAndInsights(data);
  const dashboardInsights = getDashboardInsights(data);
  const activeGoalPairings = data.pairings
    .filter((pairing) => pairing.projectGoal.trim())
    .slice(0, 3)
    .map((pairing) => ({
      name: pairing.name,
      projectGoal: pairing.projectGoal,
    }));

  return {
    summary: {
      totalBirds: data.birds.length,
      activePairings: data.pairings.filter((pairing) => pairing.active).length,
      totalHatchGroups: data.hatchGroups.length,
      averageHatchRate: getAverageHatchRate(data),
      availableChicks: data.chicks.filter((chick) => chick.status === "Available").length,
      openReservations: data.reservations.filter((reservation) =>
        ["Waiting", "Matched"].includes(reservation.status),
      ).length,
      completedOrders: data.orders.filter((order) => order.status === "Completed").length,
    },
    hatchPerformanceRows,
    pairingPerformanceRows,
    reservationPressureRows,
    salesSnapshot,
    geneticsSnapshot,
    insights,
    dashboardInsights,
    activeGoalPairings,
  };
}

export function getAverageHatchRate(data: AnalyticsBaseData) {
  const totalSet = data.hatchGroups.reduce((sum, group) => sum + group.eggsSet, 0);
  const totalHatched = data.hatchGroups.reduce((sum, group) => sum + group.eggsHatched, 0);

  return calculateHatchRate(totalSet, totalHatched);
}

export function getHatchPerformanceRows(data: AnalyticsBaseData) {
  return data.hatchGroups.map((group) => ({
    id: group.id,
    name: group.name,
    pairing: group.pairing.name,
    eggsSet: group.eggsSet,
    eggsHatched: group.eggsHatched,
    hatchRate: calculateHatchRate(group.eggsSet, group.eggsHatched),
    notes: group.notes || "-",
  }));
}

export function getPairingPerformanceRows(data: AnalyticsBaseData) {
  return data.pairings.map((pairing) => {
    const pairingHatchGroups = data.hatchGroups.filter((group) => group.pairingId === pairing.id);
    const totalEggsSet = pairingHatchGroups.reduce((sum, group) => sum + group.eggsSet, 0);
    const totalChicksHatched = pairingHatchGroups.reduce(
      (sum, group) => sum + group.eggsHatched,
      0,
    );

    return {
      id: pairing.id,
      pairingName: pairing.name,
      sire: pairing.sire.name,
      dam: pairing.dam.name,
      hatchGroupsCount: pairingHatchGroups.length,
      totalEggsSet,
      totalChicksHatched,
      averageHatchRate: calculateHatchRate(totalEggsSet, totalChicksHatched),
      projectGoal: pairing.projectGoal || "-",
    };
  });
}

export function getReservationPressureRows(data: AnalyticsBaseData) {
  const demandMap = new Map<
    string,
    {
      id: string;
      breed: string;
      variety: string;
      sex: string;
      color: string;
      demand: number;
      availability: number;
      gap: number;
    }
  >();

  data.reservations.forEach((reservation) => {
    const key = [
      reservation.requestedBreed,
      reservation.requestedVariety,
      reservation.requestedSex,
      reservation.requestedColor,
    ].join("|");

    const matchingAvailability = data.chicks.filter((chick) => {
      if (chick.status !== "Available") {
        return false;
      }

      const breedMatch = matchesRequestValue(reservation.requestedBreed, chick.flock?.breed ?? "");
      const varietyMatch = matchesRequestValue(
        reservation.requestedVariety,
        chick.flock?.variety ?? "",
      );
      const colorMatch = matchesRequestValue(reservation.requestedColor, chick.color);
      const sexMatch =
        !reservation.requestedSex.trim() ||
        matchesSexPreference(reservation.requestedSex, chick.sex);

      return (breedMatch || varietyMatch || colorMatch) && sexMatch;
    }).length;

    const current = demandMap.get(key) ?? {
      id: reservation.id,
      breed: reservation.requestedBreed || "Unspecified Breed",
      variety: reservation.requestedVariety || "Any Variety",
      sex: reservation.requestedSex || "No Preference",
      color: reservation.requestedColor || "Any Color",
      demand: 0,
      availability: matchingAvailability,
      gap: 0,
    };

    current.demand += reservation.quantity;
    current.availability = Math.max(current.availability, matchingAvailability);
    current.gap = current.demand - current.availability;
    demandMap.set(key, current);
  });

  return Array.from(demandMap.values()).sort((left, right) => right.gap - left.gap);
}

export function getSalesSnapshot(data: AnalyticsBaseData) {
  return {
    completedOrders: data.orders.filter((order) => order.status === "Completed").length,
    pendingOrders: data.orders.filter((order) =>
      ["Pending", "Scheduled"].includes(order.status),
    ).length,
    reservedChicks: data.chicks.filter((chick) => chick.status === "Reserved").length,
    availableChicks: data.chicks.filter((chick) => chick.status === "Available").length,
    pickupPreview: data.orders.slice(0, 4).map((order) => ({
      id: order.id,
      pickupDate: order.pickupDate.toISOString().slice(0, 10),
      status: order.status,
    })),
  };
}

export function getGeneticsSnapshot(data: AnalyticsBaseData) {
  const traitCounts = new Map<string, number>();

  data.birds.forEach((bird) => {
    const birdTraits = new Set([
      ...bird.visualTraits,
      ...bird.carriedTraits,
      ...(bird.traits?.map((trait) => trait.name) ?? []),
    ]);

    birdTraits.forEach((trait) => {
      if (!trait.trim()) {
        return;
      }

      traitCounts.set(trait, (traitCounts.get(trait) ?? 0) + 1);
    });
  });

  const mostTrackedTraits = Array.from(traitCounts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([trait, count]) => ({ trait, count }));

  const projectTagCounts = new Map<string, number>();
  data.birds.forEach((bird) => {
    bird.projectTags.forEach((tag) => {
      if (!tag.trim()) {
        return;
      }

      projectTagCounts.set(tag, (projectTagCounts.get(tag) ?? 0) + 1);
    });
  });

  const mostActiveProjectTags = Array.from(projectTagCounts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([tag]) => tag);

  return {
    mostTrackedTraits,
    mostActiveProjectTags,
    birdsWithGeneticsNotes: data.birds.filter((bird) => bird.genotypeNotes.trim()).length,
    pairingsWithTargetTraits: data.pairings.filter((pairing) => pairing.targetTraits.length > 0)
      .length,
  };
}

export function getAlertsAndInsights(data: AnalyticsBaseData) {
  const averageHatchRate = getAverageHatchRate(data);
  const hatchPerformanceRows = getHatchPerformanceRows(data);
  const pairingPerformanceRows = getPairingPerformanceRows(data);
  const reservationPressure = getReservationPressureRows(data);
  const topDemand = reservationPressure[0];
  const bestPairing = [...pairingPerformanceRows].sort(
    (left, right) => right.averageHatchRate - left.averageHatchRate,
  )[0];
  const lowHatchGroup = hatchPerformanceRows.find((row) => row.hatchRate < averageHatchRate - 10);
  const missingGenetics = data.birds.filter((bird) => !bird.genotypeNotes.trim()).length;
  const openReservations = data.reservations
    .filter((reservation) => ["Waiting", "Matched"].includes(reservation.status))
    .reduce((sum, reservation) => sum + reservation.quantity, 0);
  const availableChicks = data.chicks.filter((chick) => chick.status === "Available").length;

  return [
    topDemand
      ? `${topDemand.color} ${topDemand.sex.toLowerCase()} demand is running ${topDemand.gap} above current availability.`
      : "Demand and availability are currently balanced across tracked reservations.",
    bestPairing
      ? `${bestPairing.pairingName} is currently the best performing pairing at ${bestPairing.averageHatchRate}% average hatch rate.`
      : "No pairing performance data is available yet.",
    openReservations > availableChicks
      ? `Reservation backlog exceeds current available chicks by ${openReservations - availableChicks}.`
      : "Current chick availability is covering active reservation demand.",
    missingGenetics > 0
      ? `${missingGenetics} birds are still missing genetics notes.`
      : "All active birds currently have genetics notes recorded.",
    lowHatchGroup
      ? `${lowHatchGroup.name} is below the current average hatch rate at ${lowHatchGroup.hatchRate}%.`
      : "No hatch groups are currently underperforming the overall average by a wide margin.",
  ];
}

export function getDashboardInsights(data: AnalyticsBaseData) {
  const bestPairing = [...getPairingPerformanceRows(data)].sort(
    (left, right) => right.averageHatchRate - left.averageHatchRate,
  )[0];
  const topProjectTag = getGeneticsSnapshot(data).mostActiveProjectTags[0] ?? "No active project tag";

  return {
    bestPerformingPairing: bestPairing?.pairingName ?? "No pairing data",
    currentAverageHatchRate: getAverageHatchRate(data),
    openReservationsCount: data.reservations.filter((reservation) =>
      ["Waiting", "Matched"].includes(reservation.status),
    ).length,
    topProjectTag,
  };
}

export function getBirdPerformanceSnapshot(
  birdId: string,
  data: Pick<AnalyticsBaseData, "pairings" | "hatchGroups" | "chicks">,
) {
  const relatedPairings = data.pairings.filter(
    (pairing) => pairing.sire.id === birdId || pairing.dam.id === birdId,
  );
  const relatedPairingIds = relatedPairings.map((pairing) => pairing.id);
  const relatedGroups = data.hatchGroups.filter((group) => relatedPairingIds.includes(group.pairingId));
  const relatedGroupIds = relatedGroups.map((group) => group.id);
  const relatedOffspring = data.chicks.filter((chick) => relatedGroupIds.includes(chick.hatchGroupId ?? ""));
  const totalEggsSet = relatedGroups.reduce((sum, group) => sum + group.eggsSet, 0);
  const totalEggsHatched = relatedGroups.reduce((sum, group) => sum + group.eggsHatched, 0);

  return {
    relatedHatchGroupsCount: relatedGroups.length,
    estimatedOffspringCount: relatedOffspring.length,
    averageHatchRate: calculateHatchRate(totalEggsSet, totalEggsHatched),
  };
}

function matchesRequestValue(requested: string, actual: string) {
  const requestedValue = requested.trim().toLowerCase();
  const actualValue = actual.trim().toLowerCase();

  if (!requestedValue || !actualValue) {
    return false;
  }

  return actualValue.includes(requestedValue) || requestedValue.includes(actualValue);
}

function matchesSexPreference(requestedSex: string, actualSex: string) {
  const requested = requestedSex.trim().toLowerCase();
  const actual = actualSex.trim().toLowerCase();

  if (!requested) {
    return false;
  }

  if (requested.includes("no preference") || requested.includes("straight run")) {
    return true;
  }

  if (!actual) {
    return false;
  }

  return actual.includes(requested) || requested.includes(actual);
}
