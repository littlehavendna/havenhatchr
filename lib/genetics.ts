import { birds, chicks, hatchGroups, pairings } from "@/lib/mock-data";

export function formatList(values: string[]) {
  return values.length > 0 ? values.join(", ") : "-";
}

export function splitCommaSeparated(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildProducedTraitsSummary(pairingId: string) {
  const pairing = pairings.find((entry) => entry.id === pairingId);

  if (!pairing) {
    return "Traits still being evaluated.";
  }

  const hatchGroupIds = hatchGroups
    .filter((group) => group.pairingId === pairingId)
    .map((group) => group.id);

  const observedTraits = chicks
    .filter((chick) => hatchGroupIds.includes(chick.hatchGroupId))
    .flatMap((chick) => chick.observedTraits);

  const traitPool = Array.from(
    new Set([...pairing.targetTraits, ...observedTraits]),
  ).slice(0, 4);

  return traitPool.length > 0 ? traitPool.join(", ") : "Traits still being evaluated.";
}

export function getBirdRelatedPairings(birdId: string) {
  return pairings.filter((pairing) => pairing.sireId === birdId || pairing.damId === birdId);
}

export function getBirdOffspringSummary(birdId: string) {
  const relatedPairings = getBirdRelatedPairings(birdId);
  const relatedPairingIds = relatedPairings.map((pairing) => pairing.id);
  const relatedHatchGroups = hatchGroups.filter((group) =>
    relatedPairingIds.includes(group.pairingId),
  );
  const relatedHatchGroupIds = relatedHatchGroups.map((group) => group.id);
  const offspring = chicks.filter((chick) => relatedHatchGroupIds.includes(chick.hatchGroupId));
  const topObservedTraits = Array.from(
    new Set(offspring.flatMap((chick) => chick.observedTraits)),
  ).slice(0, 4);

  return {
    pairings: relatedPairings,
    hatchGroups: relatedHatchGroups,
    offspring,
    topObservedTraits,
  };
}

export function getMostCommonTrackedTraits(limit = 4) {
  const counts = new Map<string, number>();

  birds.forEach((bird) => {
    [...bird.visualTraits, ...bird.carriedTraits].forEach((trait) => {
      counts.set(trait, (counts.get(trait) ?? 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([trait, count]) => ({ trait, count }));
}

export function getRecentProjectTags(limit = 5) {
  return Array.from(new Set([...birds].reverse().flatMap((bird) => bird.projectTags))).slice(
    0,
    limit,
  );
}

export function getPairingsWithActiveGoals(limit = 4) {
  return pairings.filter((pairing) => pairing.projectGoal.trim()).slice(0, limit);
}
