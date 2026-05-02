export const HATCH_BREED_OPTIONS = [
  { value: "Chicken", label: "Chicken", incubationDays: 21, lockdownOffsetDays: 3 },
  { value: "Duck", label: "Duck", incubationDays: 28, lockdownOffsetDays: 3 },
  { value: "Quail", label: "Quail", incubationDays: 18, lockdownOffsetDays: 3 },
  { value: "Emu", label: "Emu", incubationDays: 50, lockdownOffsetDays: 3 },
  { value: "Turkey", label: "Turkey", incubationDays: 28, lockdownOffsetDays: 3 },
  { value: "Goose", label: "Goose", incubationDays: 30, lockdownOffsetDays: 3 },
] as const;

export type HatchBreedDesignation = (typeof HATCH_BREED_OPTIONS)[number]["value"];

const HATCH_BREED_RULES = new Map(
  HATCH_BREED_OPTIONS.map((option) => [option.value, option]),
);

function parseDateOnly(value: string) {
  const trimmed = value.trim();
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  const usMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);

  const [, year, month, day] = isoMatch
    ? isoMatch
    : usMatch
      ? [usMatch[0], usMatch[3], usMatch[1].padStart(2, "0"), usMatch[2].padStart(2, "0")]
      : [];

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatIsoDateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

function addDays(value: string, days: number) {
  const next = parseDateOnly(value);
  if (!next) {
    return "";
  }

  next.setUTCDate(next.getUTCDate() + days);
  return formatIsoDateOnly(next);
}

export function getHatchBreedRule(
  designation: string | null | undefined,
): (typeof HATCH_BREED_OPTIONS)[number] {
  return HATCH_BREED_RULES.get((designation || "Chicken") as HatchBreedDesignation) ?? HATCH_BREED_OPTIONS[0];
}

export function deriveIncubationDates(setDate: string, designation: string) {
  if (!setDate) {
    return { hatchDate: "", lockdownDate: "" };
  }

  const rule = getHatchBreedRule(designation);
  const hatchDate = addDays(setDate, rule.incubationDays);
  const lockdownDate = addDays(hatchDate, -rule.lockdownOffsetDays);

  return { hatchDate, lockdownDate };
}
