import type { Bird, Chick, Customer, HatchGroup, Note, Pairing } from "@/lib/types";

type ListingInput = {
  selectedBirdOrChick?: Bird | Chick | null;
  breed: string;
  variety: string;
  color: string;
  sex: string;
  notes: string;
  price: string;
};

type ReplyInput = {
  customer: Customer | null;
  topic: string;
  customNotes: string;
};

type PairingSuggestionInput = {
  sire: Bird | null;
  dam: Bird | null;
  breedingGoal: string;
  targetTraits: string[];
  avoidTraits: string[];
};

type PairingSuggestionOutput = {
  pairingSummary: string;
  strengths: string;
  potentialConcerns: string;
  recommendedNextStep: string;
};

export function generateListingText({
  selectedBirdOrChick,
  breed,
  variety,
  color,
  sex,
  notes,
  price,
}: ListingInput) {
  const recordLabel =
    selectedBirdOrChick && "name" in selectedBirdOrChick
      ? selectedBirdOrChick.name
      : selectedBirdOrChick
        ? selectedBirdOrChick.bandNumber
        : "this bird";

  const noteLine = notes.trim()
    ? ` Breeder notes highlight ${notes.trim().replace(/\.$/, "")}.`
    : "";

  return `${breed} ${variety} ${color} ${sex} available from HavenHatchr. ${recordLabel} is presented as a well-started, breeder-focused offering with organized records and clear flock history.${noteLine} Priced at ${price || "contact for pricing"}, this listing is ready for website, social, or direct customer sharing.`;
}

export function summarizeBreedingNotes(input: string | Note[]) {
  const text =
    typeof input === "string" ? input.trim() : input.map((note) => note.content).join(" ");

  if (!text) {
    return "No breeding notes were provided. Add observations, hatch outcomes, or pairing notes to generate a summary.";
  }

  return `Summary: ${text.split(/[.!?]/).filter(Boolean).slice(0, 2).join(". ")}. Key focus areas include breeder consistency, next-step follow-up, and keeper evaluation.`;
}

export function draftCustomerReply({ customer, topic, customNotes }: ReplyInput) {
  const name = customer?.name ?? "there";
  const noteLine = customNotes.trim()
    ? ` I also noted: ${customNotes.trim().replace(/\.$/, "")}.`
    : "";

  return `Hi ${name},\n\nThanks for reaching out about ${topic || "your request"}. I’m happy to help and can share the most current availability, timing, and breeder notes that match what you’re looking for.${noteLine}\n\nIf you want, I can also suggest the best current options from our upcoming hatch groups and available birds.\n\nBest,\nHavenHatchr`;
}

export function suggestPairings({
  sire,
  dam,
  breedingGoal,
  targetTraits,
  avoidTraits,
}: PairingSuggestionInput): PairingSuggestionOutput {
  const sireName = sire?.name ?? "Selected sire";
  const damName = dam?.name ?? "Selected dam";
  const sharedStrengths = Array.from(
    new Set([
      ...(sire?.visualTraits ?? []),
      ...(dam?.visualTraits ?? []),
      ...targetTraits,
    ]),
  ).slice(0, 4);
  const riskTraits = Array.from(
    new Set([...(sire?.carriedTraits ?? []), ...(dam?.carriedTraits ?? []), ...avoidTraits]),
  ).slice(0, 3);

  return {
    pairingSummary: `${sireName} paired with ${damName} aligns with the goal of ${
      breedingGoal || "building a stronger next-generation keeper line"
    }.`,
    strengths:
      sharedStrengths.length > 0
        ? `Primary strengths include ${sharedStrengths.join(", ")}.`
        : "Primary strengths include complementary type, project fit, and organized breeder tracking.",
    potentialConcerns:
      riskTraits.length > 0
        ? `Watch for ${riskTraits.join(", ")} when evaluating offspring outcomes.`
        : "Watch for consistency in hatch outcomes, type, and project direction before keeping back replacements.",
    recommendedNextStep:
      "Run the pairing through one hatch cycle, log early chick observations, and review keeper candidates against the stated breeding goal.",
  };
}

export function analyzeHatchRates(hatchGroups: HatchGroup[]) {
  if (hatchGroups.length === 0) {
    return "No hatch groups are available yet. Add hatch records to analyze hatch-rate patterns and breeding trends.";
  }

  const totalSet = hatchGroups.reduce((sum, group) => sum + group.eggsSet, 0);
  const totalHatched = hatchGroups.reduce((sum, group) => sum + group.eggsHatched, 0);
  const rate = totalSet > 0 ? Math.round((totalHatched / totalSet) * 100) : 0;

  return `Across ${hatchGroups.length} hatch groups, approximately ${rate}% of eggs set hatched successfully. Placeholder analysis suggests reviewing pair-specific fertility patterns, incubator consistency, and seasonal variation before making major breeder changes.`;
}

export function getExistingPairingContext(
  sire: Bird | null,
  dam: Bird | null,
  existingPairings: Pairing[],
) {
  if (!sire || !dam) {
    return null;
  }

  return (
    existingPairings.find(
      (pairing) => pairing.sireId === sire.id && pairing.damId === dam.id,
    ) ?? null
  );
}
