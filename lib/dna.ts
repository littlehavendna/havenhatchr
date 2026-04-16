export const DNA_SYSTEM_SETTING_KEYS = {
  enabled: "dna_testing_enabled",
  instructions: "dna_testing_instructions",
} as const;

export const DEFAULT_DNA_TESTING_INSTRUCTIONS = [
  "Label each sample with the HavenHatchr sample number shown on your order.",
  "Use the same sample number on the blood card, filter paper, or collection note.",
  "Mail samples to Little Haven DNA and keep the sample numbers matched exactly.",
  "You will receive Little Haven DNA order emails, and completed results will sync back here automatically.",
].join("\n");

export const DNA_TEST_CATALOG = {
  chicken_sex: {
    code: "chicken_sex",
    label: "DNA Sexing",
    description: "Required base test for each selected chick.",
    priceCents: 800,
  },
  chicken_blue_egg: {
    code: "chicken_blue_egg",
    label: "Blue Gene",
    description: "Optional blue egg gene result for each selected chick.",
    priceCents: 1500,
  },
  chicken_recessive_white: {
    code: "chicken_recessive_white",
    label: "Recessive White",
    description: "Optional recessive white gene result for each selected chick.",
    priceCents: 1500,
  },
} as const;

export type DnaTestCode = keyof typeof DNA_TEST_CATALOG;

export type DnaOrderSelections = {
  includeBlueEgg: boolean;
  includeRecessiveWhite: boolean;
};

export type DnaBulkTier = {
  minQuantity: number;
  unitPriceCents: number;
  label: string;
};

export const DNA_SEX_BULK_TIERS: DnaBulkTier[] = [
  { minQuantity: 50, unitPriceCents: 700, label: "Bulk tier 50+" },
  { minQuantity: 100, unitPriceCents: 650, label: "Bulk tier 100+" },
  { minQuantity: 150, unitPriceCents: 600, label: "Bulk tier 150+" },
];

export function getSelectedDnaTests(selections: DnaOrderSelections) {
  const selectedTests: DnaTestCode[] = ["chicken_sex"];

  if (selections.includeBlueEgg) {
    selectedTests.push("chicken_blue_egg");
  }

  if (selections.includeRecessiveWhite) {
    selectedTests.push("chicken_recessive_white");
  }

  return selectedTests;
}

export function getDnaSexUnitPriceCents(chickCount: number) {
  if (chickCount >= 150) {
    return 600;
  }

  if (chickCount >= 100) {
    return 650;
  }

  if (chickCount >= 50) {
    return 700;
  }

  return DNA_TEST_CATALOG.chicken_sex.priceCents;
}

export function getDnaSexBulkTier(chickCount: number) {
  if (chickCount >= 150) {
    return DNA_SEX_BULK_TIERS[2];
  }

  if (chickCount >= 100) {
    return DNA_SEX_BULK_TIERS[1];
  }

  if (chickCount >= 50) {
    return DNA_SEX_BULK_TIERS[0];
  }

  return null;
}

export function getDnaUnitPriceCents(code: DnaTestCode, chickCount: number) {
  if (code === "chicken_sex") {
    return getDnaSexUnitPriceCents(chickCount);
  }

  return DNA_TEST_CATALOG[code].priceCents;
}

export function calculateDnaOrderTotal(chickCount: number, selectedTests: DnaTestCode[]) {
  return selectedTests.reduce((sum, code) => sum + getDnaUnitPriceCents(code, chickCount) * chickCount, 0);
}

export function getDnaOrderLineItems(chickCount: number, selectedTests: DnaTestCode[]) {
  return selectedTests.map((code) => {
    const unitPriceCents = getDnaUnitPriceCents(code, chickCount);
    const bulkTier = code === "chicken_sex" ? getDnaSexBulkTier(chickCount) : null;

    return {
      code,
      label: DNA_TEST_CATALOG[code].label,
      quantity: chickCount,
      unitPriceCents,
      totalPriceCents: unitPriceCents * chickCount,
      baseUnitPriceCents: DNA_TEST_CATALOG[code].priceCents,
      bulkTierLabel: bulkTier?.label || "",
    };
  });
}

export function formatCurrencyFromCents(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value / 100);
}

export function normalizeDnaTestingEnabled(value: unknown) {
  return typeof value === "boolean" ? value : true;
}

export function normalizeDnaInstructions(value: unknown) {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : DEFAULT_DNA_TESTING_INSTRUCTIONS;
}
