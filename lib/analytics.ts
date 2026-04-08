import { birds, chicks, hatchGroups, orders, pairings, reservations } from "@/lib/mock-data";
import { getMostCommonTrackedTraits, getRecentProjectTags } from "@/lib/genetics";

export function calculateHatchRate(eggsSet: number, eggsHatched: number) {
  if (eggsSet <= 0) {
    return 0;
  }

  return Math.round((eggsHatched / eggsSet) * 100);
}

export function getAverageHatchRate() {
  const totalSet = hatchGroups.reduce((sum, group) => sum + group.eggsSet, 0);
  const totalHatched = hatchGroups.reduce((sum, group) => sum + group.eggsHatched, 0);

  return calculateHatchRate(totalSet, totalHatched);
}

export function getHatchPerformanceRows() {
  return hatchGroups.map((group) => {
    const pairing = pairings.find((entry) => entry.id === group.pairingId);

    return {
      id: group.id,
      name: group.name,
      pairing: pairing?.name ?? "Unknown",
      eggsSet: group.eggsSet,
      eggsHatched: group.eggsHatched,
      hatchRate: calculateHatchRate(group.eggsSet, group.eggsHatched),
      notes: group.notes,
    };
  });
}

export function getPairingPerformanceRows() {
  return pairings.map((pairing) => {
    const pairingHatchGroups = hatchGroups.filter((group) => group.pairingId === pairing.id);
    const totalEggsSet = pairingHatchGroups.reduce((sum, group) => sum + group.eggsSet, 0);
    const totalChicksHatched = pairingHatchGroups.reduce(
      (sum, group) => sum + group.eggsHatched,
      0,
    );
    const sire = birds.find((bird) => bird.id === pairing.sireId);
    const dam = birds.find((bird) => bird.id === pairing.damId);

    return {
      id: pairing.id,
      pairingName: pairing.name,
      sire: sire?.name ?? "Unknown",
      dam: dam?.name ?? "Unknown",
      hatchGroupsCount: pairingHatchGroups.length,
      totalEggsSet,
      totalChicksHatched,
      averageHatchRate: calculateHatchRate(totalEggsSet, totalChicksHatched),
      projectGoal: pairing.projectGoal || "-",
    };
  });
}

export function getReservationPressureRows() {
  const demandMap = new Map<
    string,
    { breed: string; variety: string; sex: string; color: string; demand: number; availability: number }
  >();

  reservations.forEach((reservation) => {
    const key = [
      reservation.requestedBreed,
      reservation.requestedVariety,
      reservation.requestedSex,
      reservation.requestedColor,
    ].join("|");

    const matchingAvailability = chicks.filter((chick) => {
      if (chick.status !== "Available") {
        return false;
      }

      const group = hatchGroups.find((entry) => entry.id === chick.hatchGroupId);
      const pairing = pairings.find((entry) => entry.id === group?.pairingId);
      const sire = birds.find((bird) => bird.id === pairing?.sireId);
      const dam = birds.find((bird) => bird.id === pairing?.damId);
      const breedMatch =
        sire?.breed === reservation.requestedBreed ||
        dam?.breed === reservation.requestedBreed ||
        chicksBreed(chick.id) === reservation.requestedBreed;
      const varietyMatch =
        sire?.variety === reservation.requestedVariety ||
        dam?.variety === reservation.requestedVariety ||
        chicksVariety(chick.id) === reservation.requestedVariety;
      const colorMatch = chick.color
        .toLowerCase()
        .includes(reservation.requestedColor.toLowerCase().split(" ")[0] ?? "");

      return breedMatch || varietyMatch || colorMatch;
    }).length;

    const current = demandMap.get(key) ?? {
      breed: reservation.requestedBreed,
      variety: reservation.requestedVariety,
      sex: reservation.requestedSex,
      color: reservation.requestedColor,
      demand: 0,
      availability: matchingAvailability,
    };

    current.demand += reservation.quantity;
    current.availability = Math.max(current.availability, matchingAvailability);
    demandMap.set(key, current);
  });

  return Array.from(demandMap.values())
    .map((entry) => ({
      ...entry,
      gap: entry.demand - entry.availability,
    }))
    .sort((left, right) => right.gap - left.gap);
}

export function getSalesSnapshot() {
  return {
    completedOrders: orders.filter((order) => order.status === "Ready").length,
    pendingOrders: orders.filter((order) => order.status === "Pending").length,
    reservedChicks: chicks.filter((chick) => chick.status === "Reserved").length,
    availableChicks: chicks.filter((chick) => chick.status === "Available").length,
    pickupPreview: orders
      .slice(0, 4)
      .map((order) => ({ id: order.id, pickupDate: order.pickupDate, status: order.status })),
  };
}

export function getGeneticsSnapshot() {
  return {
    mostTrackedTraits: getMostCommonTrackedTraits(5),
    mostActiveProjectTags: getRecentProjectTags(5),
    birdsWithGeneticsNotes: birds.filter((bird) => bird.genotypeNotes.trim()).length,
    pairingsWithTargetTraits: pairings.filter((pairing) => pairing.targetTraits.length > 0).length,
  };
}

export function getAlertsAndInsights() {
  const averageHatchRate = getAverageHatchRate();
  const hatchPerformanceRows = getHatchPerformanceRows();
  const pairingPerformanceRows = getPairingPerformanceRows();
  const reservationPressure = getReservationPressureRows();
  const topDemand = reservationPressure[0];
  const bestPairing = [...pairingPerformanceRows].sort(
    (left, right) => right.averageHatchRate - left.averageHatchRate,
  )[0];
  const lowHatchGroup = hatchPerformanceRows.find((row) => row.hatchRate < averageHatchRate - 10);
  const missingGenetics = birds.filter((bird) => !bird.genotypeNotes.trim()).length;
  const openReservations = reservations
    .filter((reservation) => ["Waiting", "Matched"].includes(reservation.status))
    .reduce((sum, reservation) => sum + reservation.quantity, 0);
  const availableChicks = chicks.filter((chick) => chick.status === "Available").length;

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

export function getDashboardInsights() {
  const bestPairing = [...getPairingPerformanceRows()].sort(
    (left, right) => right.averageHatchRate - left.averageHatchRate,
  )[0];
  const topProjectTag = getRecentProjectTags(1)[0] ?? "No active project tag";

  return {
    bestPerformingPairing: bestPairing?.pairingName ?? "No pairing data",
    currentAverageHatchRate: getAverageHatchRate(),
    openReservationsCount: reservations.filter((reservation) =>
      ["Waiting", "Matched"].includes(reservation.status),
    ).length,
    topProjectTag,
  };
}

export function getBirdPerformanceSnapshot(birdId: string) {
  const relatedPairings = pairings.filter(
    (pairing) => pairing.sireId === birdId || pairing.damId === birdId,
  );
  const relatedPairingIds = relatedPairings.map((pairing) => pairing.id);
  const relatedGroups = hatchGroups.filter((group) => relatedPairingIds.includes(group.pairingId));
  const relatedGroupIds = relatedGroups.map((group) => group.id);
  const relatedOffspring = chicks.filter((chick) => relatedGroupIds.includes(chick.hatchGroupId));
  const totalEggsSet = relatedGroups.reduce((sum, group) => sum + group.eggsSet, 0);
  const totalEggsHatched = relatedGroups.reduce((sum, group) => sum + group.eggsHatched, 0);

  return {
    relatedHatchGroupsCount: relatedGroups.length,
    estimatedOffspringCount: relatedOffspring.length,
    averageHatchRate: calculateHatchRate(totalEggsSet, totalEggsHatched),
  };
}

function chicksBreed(chickId: string) {
  const chick = chicks.find((entry) => entry.id === chickId);
  const group = hatchGroups.find((entry) => entry.id === chick?.hatchGroupId);
  const pairing = pairings.find((entry) => entry.id === group?.pairingId);
  const sire = birds.find((bird) => bird.id === pairing?.sireId);

  return sire?.breed ?? "Unknown";
}

function chicksVariety(chickId: string) {
  const chick = chicks.find((entry) => entry.id === chickId);
  const group = hatchGroups.find((entry) => entry.id === chick?.hatchGroupId);
  const pairing = pairings.find((entry) => entry.id === group?.pairingId);
  const sire = birds.find((bird) => bird.id === pairing?.sireId);

  return sire?.variety ?? "Unknown";
}
