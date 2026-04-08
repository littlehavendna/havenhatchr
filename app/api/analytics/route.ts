import { NextResponse } from "next/server";
import { calculateHatchRate } from "@/lib/analytics";
import { getAnalyticsBaseData } from "@/lib/db";

export async function GET() {
  const { birds, chicks, hatchGroups, orders, pairings, reservations } =
    await getAnalyticsBaseData();

  const hatchPerformanceRows = hatchGroups.map((group) => ({
    id: group.id,
    name: group.name,
    pairing: group.pairing.name,
    eggsSet: group.eggsSet,
    eggsHatched: group.eggsHatched,
    hatchRate: calculateHatchRate(group.eggsSet, group.eggsHatched),
    notes: group.notes,
  }));

  const pairingPerformanceRows = pairings.map((pairing) => {
    const relatedGroups = hatchGroups.filter((group) => group.pairingId === pairing.id);
    const totalEggsSet = relatedGroups.reduce((sum, group) => sum + group.eggsSet, 0);
    const totalChicksHatched = relatedGroups.reduce((sum, group) => sum + group.eggsHatched, 0);

    return {
      id: pairing.id,
      pairingName: pairing.name,
      sire: pairing.sire.name,
      dam: pairing.dam.name,
      hatchGroupsCount: relatedGroups.length,
      totalEggsSet,
      totalChicksHatched,
      averageHatchRate: calculateHatchRate(totalEggsSet, totalChicksHatched),
      projectGoal: pairing.projectGoal || "-",
    };
  });

  const avgRate = calculateHatchRate(
    hatchGroups.reduce((sum, group) => sum + group.eggsSet, 0),
    hatchGroups.reduce((sum, group) => sum + group.eggsHatched, 0),
  );

  const reservationPressureMap = new Map<
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

  reservations.forEach((reservation) => {
    const availability = chicks.filter((chick) => {
      const matchingGroup = hatchGroups.find((group) => group.id === chick.hatchGroupId);
      const matchingPairing = pairings.find((pairing) => pairing.id === matchingGroup?.pairingId);
      const breedMatch =
        matchingPairing?.sire.breed === reservation.requestedBreed ||
        matchingPairing?.dam.breed === reservation.requestedBreed;
      const varietyMatch =
        matchingPairing?.sire.variety === reservation.requestedVariety ||
        matchingPairing?.dam.variety === reservation.requestedVariety;
      const colorMatch = chick.color
        .toLowerCase()
        .includes(reservation.requestedColor.toLowerCase().split(" ")[0] ?? "");

      return chick.status === "Available" && (breedMatch || varietyMatch || colorMatch);
    }).length;

    const key = [
      reservation.requestedBreed,
      reservation.requestedVariety,
      reservation.requestedSex,
      reservation.requestedColor,
    ].join("|");

    const current = reservationPressureMap.get(key) ?? {
      id: reservation.id,
      breed: reservation.requestedBreed,
      variety: reservation.requestedVariety,
      sex: reservation.requestedSex,
      color: reservation.requestedColor,
      demand: 0,
      availability,
      gap: 0,
    };

    current.demand += reservation.quantity;
    current.availability = Math.max(current.availability, availability);
    current.gap = current.demand - current.availability;

    reservationPressureMap.set(key, current);
  });

  const reservationPressureRows = Array.from(reservationPressureMap.values()).sort(
    (left, right) => right.gap - left.gap,
  );

  const mostTrackedTraits = Array.from(
    new Map(
      birds.flatMap((bird) => [...bird.visualTraits, ...bird.carriedTraits]).map((trait) => [
        trait,
        birds.filter(
          (bird) => bird.visualTraits.includes(trait) || bird.carriedTraits.includes(trait),
        ).length,
      ]),
    ).entries(),
  )
    .slice(0, 5)
    .map(([trait, count]) => ({ trait, count }));

  const mostActiveProjectTags = Array.from(
    new Set(birds.flatMap((bird) => bird.projectTags)),
  ).slice(0, 5);
  const activeGoalPairings = pairings
    .filter((pairing) => pairing.projectGoal.trim())
    .slice(0, 3)
    .map((pairing) => ({
      name: pairing.name,
      projectGoal: pairing.projectGoal,
    }));
  const bestPairing = [...pairingPerformanceRows].sort(
    (left, right) => right.averageHatchRate - left.averageHatchRate,
  )[0];
  const topProjectTag = mostActiveProjectTags[0] ?? "No active project tag";

  const insights = [
    reservationPressureRows.length > 0
      ? `${reservationPressureRows[0].color} ${reservationPressureRows[0].sex.toLowerCase()} demand is outpacing current availability.`
      : "Demand appears balanced right now.",
    pairingPerformanceRows.length > 0
      ? `${pairingPerformanceRows[0].pairingName} is a current performance leader.`
      : "No pairing performance data yet.",
    birds.filter((bird) => !bird.genotypeNotes.trim()).length > 0
      ? `${birds.filter((bird) => !bird.genotypeNotes.trim()).length} birds are missing genetics notes.`
      : "All birds currently have genetics notes.",
  ];

  return NextResponse.json({
    summary: {
      totalBirds: birds.length,
      activePairings: pairings.filter((pairing) => pairing.active).length,
      totalHatchGroups: hatchGroups.length,
      averageHatchRate: avgRate,
      availableChicks: chicks.filter((chick) => chick.status === "Available").length,
      openReservations: reservations.filter((reservation) =>
        ["Waiting", "Matched"].includes(reservation.status),
      ).length,
      completedOrders: orders.filter((order) => order.status === "Ready").length,
    },
    hatchPerformanceRows,
    pairingPerformanceRows,
    reservationPressureRows,
    salesSnapshot: {
      completedOrders: orders.filter((order) => order.status === "Ready").length,
      pendingOrders: orders.filter((order) => order.status === "Pending").length,
      reservedChicks: chicks.filter((chick) => chick.status === "Reserved").length,
      availableChicks: chicks.filter((chick) => chick.status === "Available").length,
      pickupPreview: orders.slice(0, 4).map((order) => ({
        id: order.id,
        pickupDate: order.pickupDate.toISOString().slice(0, 10),
        status: order.status,
      })),
    },
    geneticsSnapshot: {
      mostTrackedTraits,
      mostActiveProjectTags,
      birdsWithGeneticsNotes: birds.filter((bird) => bird.genotypeNotes.trim()).length,
      pairingsWithTargetTraits: pairings.filter((pairing) => pairing.targetTraits.length > 0)
        .length,
    },
    activeGoalPairings,
    insights,
    dashboardInsights: {
      bestPerformingPairing: bestPairing?.pairingName ?? "No pairing data",
      currentAverageHatchRate: avgRate,
      openReservationsCount: reservations.filter((reservation) =>
        ["Waiting", "Matched"].includes(reservation.status),
      ).length,
      topProjectTag,
    },
  });
}
