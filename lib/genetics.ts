export function formatList(values: string[]) {
  return values.length > 0 ? values.join(", ") : "-";
}

export function splitCommaSeparated(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

type PairingLike = {
  id: string;
  sireId?: string;
  damId?: string;
  targetTraits: string[];
  projectGoal?: string;
};

type HatchGroupLike = {
  id: string;
  pairingId: string;
};

type ChickLike = {
  hatchGroupId: string | null;
  observedTraits: string[];
};

type BirdLike = {
  visualTraits: string[];
  carriedTraits: string[];
  projectTags: string[];
};

export function buildProducedTraitsSummary(
  pairingId: string,
  pairings: PairingLike[],
  hatchGroups: HatchGroupLike[],
  chicks: ChickLike[],
) {
  const pairing = pairings.find((entry) => entry.id === pairingId);

  if (!pairing) {
    return "Traits still being evaluated.";
  }

  const hatchGroupIds = hatchGroups
    .filter((group) => group.pairingId === pairingId)
    .map((group) => group.id);

  const observedTraits = chicks
    .filter((chick) => chick.hatchGroupId && hatchGroupIds.includes(chick.hatchGroupId))
    .flatMap((chick) => chick.observedTraits);

  const traitPool = Array.from(
    new Set([...pairing.targetTraits, ...observedTraits]),
  ).slice(0, 4);

  return traitPool.length > 0 ? traitPool.join(", ") : "Traits still being evaluated.";
}

export function getBirdRelatedPairings<T extends PairingLike>(birdId: string, pairings: T[]) {
  return pairings.filter((pairing) => pairing.sireId === birdId || pairing.damId === birdId);
}

export function getBirdOffspringSummary(
  birdId: string,
  relatedPairings: Array<{ id: string }>,
  hatchGroups: HatchGroupLike[],
  chicks: ChickLike[],
) {
  const relatedPairingIds = relatedPairings.map((pairing) => pairing.id);
  const relatedHatchGroups = hatchGroups.filter((group) =>
    relatedPairingIds.includes(group.pairingId),
  );
  const relatedHatchGroupIds = relatedHatchGroups.map((group) => group.id);
  const offspring = chicks.filter(
    (chick) => chick.hatchGroupId && relatedHatchGroupIds.includes(chick.hatchGroupId),
  );
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

export function getMostCommonTrackedTraits(birds: BirdLike[], limit = 4) {
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

export function getRecentProjectTags(birds: BirdLike[], limit = 5) {
  return Array.from(new Set([...birds].reverse().flatMap((bird) => bird.projectTags))).slice(
    0,
    limit,
  );
}

export function getPairingsWithActiveGoals<T extends PairingLike>(pairings: T[], limit = 4) {
  return pairings.filter((pairing) => pairing.projectGoal?.trim()).slice(0, limit);
}
