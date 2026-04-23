export const optionalModuleKeys = [
  "incubation",
  "tasks",
  "shows",
  "traits",
  "genetics",
  "analytics",
  "reservations",
  "orders",
  "eggSales",
  "inventory",
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
  reservations: true,
  orders: true,
  eggSales: true,
  inventory: true,
  storefront: true,
};

export const moduleLabels: Record<OptionalModuleKey, string> = {
  incubation: "Incubation",
  tasks: "Tasks",
  shows: "Shows",
  traits: "Traits",
  genetics: "Genetics",
  analytics: "Analytics",
  reservations: "Reservations",
  orders: "Orders",
  eggSales: "Egg Sales",
  inventory: "Inventory",
  storefront: "Storefront",
};

export function getModuleVisibilitySettingKey(userId: string) {
  return `user.moduleVisibility.${userId}`;
}

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
