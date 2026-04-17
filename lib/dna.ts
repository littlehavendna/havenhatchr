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
    label: "Blue Egg Gene",
    description: "Checks whether a chick carries the blue egg gene tied to blue or green shell color.",
    priceCents: 1500,
  },
  chicken_recessive_white: {
    code: "chicken_recessive_white",
    label: "Recessive White",
    description: "Checks for the recessive white gene that can hide plumage color when inherited from both parents.",
    priceCents: 1500,
  },
} as const;

export type DnaTestCode = keyof typeof DNA_TEST_CATALOG;

export type DnaOrderSelections = {
  includeBlueEgg: boolean;
  includeRecessiveWhite: boolean;
};

export type DnaSelectionsByChick = Record<string, DnaOrderSelections>;

export type DnaLineItem = {
  code: DnaTestCode;
  label: string;
  quantity: number;
  unitPriceCents: number;
  totalPriceCents: number;
  baseUnitPriceCents: number;
  bulkTierLabel: string;
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

export function getDnaTestQuantities(
  chickIds: string[],
  selectionsByChick: DnaSelectionsByChick,
) {
  const quantities: Record<DnaTestCode, number> = {
    chicken_sex: chickIds.length,
    chicken_blue_egg: 0,
    chicken_recessive_white: 0,
  };

  for (const chickId of chickIds) {
    const selections = selectionsByChick[chickId];

    if (selections?.includeBlueEgg) {
      quantities.chicken_blue_egg += 1;
    }

    if (selections?.includeRecessiveWhite) {
      quantities.chicken_recessive_white += 1;
    }
  }

  return quantities;
}

export function getDnaTestQuantitiesFromRequestTests(requestTests: DnaTestCode[][]) {
  const quantities: Record<DnaTestCode, number> = {
    chicken_sex: 0,
    chicken_blue_egg: 0,
    chicken_recessive_white: 0,
  };

  for (const tests of requestTests) {
    for (const code of tests) {
      quantities[code] += 1;
    }
  }

  return quantities;
}

export function getOrderSelectedDnaTests(
  chickIds: string[],
  selectionsByChick: DnaSelectionsByChick,
) {
  const codes = new Set<DnaTestCode>(["chicken_sex"]);

  for (const chickId of chickIds) {
    for (const code of getSelectedDnaTests(selectionsByChick[chickId] ?? {
      includeBlueEgg: false,
      includeRecessiveWhite: false,
    })) {
      codes.add(code);
    }
  }

  return Array.from(codes);
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

export function getDnaOrderLineItemsFromQuantities(
  chickCount: number,
  quantities: Record<DnaTestCode, number>,
) {
  return (Object.entries(quantities) as Array<[DnaTestCode, number]>)
    .filter(([, quantity]) => quantity > 0)
    .map(([code, quantity]) => {
      const unitPriceCents = getDnaUnitPriceCents(code, chickCount);
      const bulkTier = code === "chicken_sex" ? getDnaSexBulkTier(chickCount) : null;

      return {
        code,
        label: DNA_TEST_CATALOG[code].label,
        quantity,
        unitPriceCents,
        totalPriceCents: unitPriceCents * quantity,
        baseUnitPriceCents: DNA_TEST_CATALOG[code].priceCents,
        bulkTierLabel: bulkTier?.label || "",
      } satisfies DnaLineItem;
    });
}

export function calculateDnaOrderTotal(
  chickIds: string[],
  selectionsByChick: DnaSelectionsByChick,
) {
  const quantities = getDnaTestQuantities(chickIds, selectionsByChick);
  return getDnaOrderLineItemsFromQuantities(chickIds.length, quantities).reduce(
    (sum, item) => sum + item.totalPriceCents,
    0,
  );
}

export function getDnaOrderLineItems(
  chickIds: string[],
  selectionsByChick: DnaSelectionsByChick,
) {
  return getDnaOrderLineItemsFromQuantities(
    chickIds.length,
    getDnaTestQuantities(chickIds, selectionsByChick),
  );
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
