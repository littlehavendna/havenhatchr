export const optionalModuleKeys = [
  "incubation",
  "tasks",
  "shows",
  "traits",
  "genetics",
  "analytics",
  "aiTools",
  "reservations",
  "orders",
  "eggSales",
  "storefront",
] as const;

export type OptionalModuleKey = (typeof optionalModuleKeys)[number];

export type ModuleVisibility = Record<OptionalModuleKey, boolean>;

export const defaultModuleVisibility: ModuleVisibility = {
  incubation: true,
  tasks: true,
  shows: true,
  traits: true,
  genetics: true,
  analytics: true,
  aiTools: true,
  reservations: true,
  orders: true,
  eggSales: true,
  storefront: true,
};

export const moduleLabels: Record<OptionalModuleKey, string> = {
  incubation: "Incubation",
  tasks: "Tasks",
  shows: "Shows",
  traits: "Traits",
  genetics: "Genetics",
  analytics: "Analytics",
  aiTools: "AI Tools",
  reservations: "Reservations",
  orders: "Orders",
  eggSales: "Egg Sales",
  storefront: "Storefront",
};

export function normalizeModuleVisibility(value: unknown): ModuleVisibility {
  const normalized = { ...defaultModuleVisibility };

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return normalized;
  }

  for (const key of optionalModuleKeys) {
    if (typeof (value as Record<string, unknown>)[key] === "boolean") {
      normalized[key] = (value as Record<string, boolean>)[key];
    }
  }

  return normalized;
}
