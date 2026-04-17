import "server-only";

import { DnaTestOrderStatus, DnaTestStatus, type Prisma } from "@prisma/client";
import Stripe from "stripe";
import { getAppOrigin, getRequiredEnv } from "@/lib/env";
import {
  DEFAULT_DNA_TESTING_INSTRUCTIONS,
  DNA_SYSTEM_SETTING_KEYS,
  DNA_TEST_CATALOG,
  type DnaSelectionsByChick,
  getDnaOrderLineItemsFromQuantities,
  getDnaTestQuantitiesFromRequestTests,
  getOrderSelectedDnaTests,
  calculateDnaOrderTotal,
  getDnaOrderLineItems,
  getSelectedDnaTests,
  normalizeDnaInstructions,
  normalizeDnaTestingEnabled,
} from "@/lib/dna";
import { prisma } from "@/lib/prisma";
import { createHttpError } from "@/lib/security";

function formatDateTime(value: Date) {
  return value.toISOString();
}

let dnaStripeClient: Stripe | null = null;

async function requireOwnedChicks(userId: string, chickIds: string[]) {
  const records = await prisma.chick.findMany({
    where: {
      userId,
      id: { in: chickIds },
    },
    include: {
      flock: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      bandNumber: "asc",
    },
  });

  if (records.length !== chickIds.length) {
    throw createHttpError("One or more selected chicks could not be found.", 404);
  }

  return records;
}

export async function getDnaSettings() {
  const settings = await prisma.systemSetting.findMany({
    where: {
      key: {
        in: [DNA_SYSTEM_SETTING_KEYS.enabled, DNA_SYSTEM_SETTING_KEYS.instructions],
      },
    },
  });

  const byKey = new Map(settings.map((setting) => [setting.key, setting.value]));

  return {
    enabled: normalizeDnaTestingEnabled(byKey.get(DNA_SYSTEM_SETTING_KEYS.enabled)),
    instructions: normalizeDnaInstructions(byKey.get(DNA_SYSTEM_SETTING_KEYS.instructions)),
  };
}

export function getDefaultDnaSystemSettings() {
  return [
    {
      key: DNA_SYSTEM_SETTING_KEYS.enabled,
      label: "DNA Testing Enabled",
      description:
        "Set to true to allow DNA test ordering from the chicks area, or false to temporarily turn it off.",
      value: true,
    },
    {
      key: DNA_SYSTEM_SETTING_KEYS.instructions,
      label: "DNA Testing Instructions",
      description:
        "Instructions shown to customers after they submit a paid DNA order from HavenHatchr.",
      value: DEFAULT_DNA_TESTING_INSTRUCTIONS,
    },
  ] satisfies Array<{
    key: string;
    label: string;
    description: string;
    value: Prisma.InputJsonValue;
  }>;
}

export async function getDnaRequestConfig(userId: string) {
  const [user, settings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
      },
    }),
    getDnaSettings(),
  ]);

  if (!user) {
    throw createHttpError("User not found.", 404);
  }

  return {
    enabled: settings.enabled,
    instructions: settings.instructions,
    defaultContactName: user.name,
    defaultContactEmail: user.email,
    tests: Object.values(DNA_TEST_CATALOG).map((test) => ({
      code: test.code,
      label: test.label,
      description: test.description,
      priceCents: test.priceCents,
    })),
  };
}

export async function createDnaCheckoutOrder(
  userId: string,
  data: {
    chickIds: string[];
    contactName: string;
    contactEmail: string;
    notes: string;
    selectionsByChick: DnaSelectionsByChick;
  },
) {
  const settings = await getDnaSettings();

  if (!settings.enabled) {
    throw createHttpError("DNA testing is temporarily unavailable.", 409);
  }

  const chicks = await requireOwnedChicks(userId, data.chickIds);
  const selectedTests = getOrderSelectedDnaTests(data.chickIds, data.selectionsByChick);
  const totalAmountCents = calculateDnaOrderTotal(data.chickIds, data.selectionsByChick);

  if (chicks.length === 0) {
    throw createHttpError("Select at least one chick for DNA testing.", 400);
  }

  const order = await prisma.dnaTestOrder.create({
    data: {
      userId,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      notes: data.notes,
      selectedTests,
      totalAmountCents,
      status: DnaTestOrderStatus.PendingPayment,
      requests: {
        create: chicks.map((chick, index) => {
          const requestSelectedTests = getSelectedDnaTests(data.selectionsByChick[chick.id] ?? {
            includeBlueEgg: false,
            includeRecessiveWhite: false,
          });

          return {
            userId,
            chickId: chick.id,
            bandNumber: chick.bandNumber,
            sampleNumber: index + 1,
            testType: requestSelectedTests.map((code) => DNA_TEST_CATALOG[code].label).join(", "),
            selectedTests: requestSelectedTests,
            status: DnaTestStatus.Pending,
          };
        }),
      },
    },
    include: {
      requests: {
        include: {
          chick: {
            include: {
              flock: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          sampleNumber: "asc",
        },
      },
    },
  });

  return {
    id: order.id,
    contactName: order.contactName,
    contactEmail: order.contactEmail,
    totalAmountCents: order.totalAmountCents,
    selectedTests: order.selectedTests,
    lineItems: getDnaOrderLineItems(data.chickIds, data.selectionsByChick),
    chicks: order.requests.map((request) => ({
      id: request.chickId,
      bandNumber: request.bandNumber,
      flockName: request.chick.flock.name,
      sampleNumber: request.sampleNumber ?? 0,
      selectedTests: request.selectedTests,
    })),
    instructions: settings.instructions,
  };
}

export async function getDnaOrderForUser(userId: string, orderId: string) {
  const [order, settings] = await Promise.all([
    prisma.dnaTestOrder.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        requests: {
          include: {
            chick: {
              include: {
                flock: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            sampleNumber: "asc",
          },
        },
      },
    }),
    getDnaSettings(),
  ]);

  if (!order) {
    throw createHttpError("DNA order not found.", 404);
  }

  return {
    id: order.id,
    contactName: order.contactName,
    contactEmail: order.contactEmail,
    notes: order.notes,
    selectedTests: order.selectedTests,
    totalAmountCents: order.totalAmountCents,
    status: order.status,
    stripeCheckoutSessionId: order.stripeCheckoutSessionId || "",
    externalOrderId: order.externalOrderId || "",
    externalOrderCode: order.externalOrderCode || "",
    syncError: order.syncError || "",
    syncedAt: order.syncedAt ? formatDateTime(order.syncedAt) : null,
    completedAt: order.completedAt ? formatDateTime(order.completedAt) : null,
    instructions: settings.instructions,
    lineItems: getDnaOrderLineItemsFromQuantities(
      order.requests.length,
      getDnaTestQuantitiesFromRequestTests(
        order.requests.map((request) => request.selectedTests as Array<keyof typeof DNA_TEST_CATALOG>),
      ),
    ),
    chicks: order.requests.map((request) => ({
      id: request.chickId,
      bandNumber: request.bandNumber,
      flockName: request.chick.flock.name,
      sampleNumber: request.sampleNumber ?? 0,
      status: request.status,
      resultSummary: request.resultSummary || "",
      selectedTests: request.selectedTests,
    })),
  };
}

export function getDnaPublishableKey() {
  return process.env.NEXT_PUBLIC_DNA_STRIPE_PUBLISHABLE_KEY
    || getRequiredEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
}

export function getDnaStripe() {
  const secretKey = process.env.DNA_STRIPE_SECRET_KEY || getRequiredEnv("STRIPE_SECRET_KEY");

  dnaStripeClient ??= new Stripe(secretKey);
  return dnaStripeClient;
}

export function getDnaStripeWebhookSecret() {
  return process.env.DNA_STRIPE_WEBHOOK_SECRET || getRequiredEnv("STRIPE_WEBHOOK_SECRET");
}

export function getLittleHavenApiUrl() {
  return getRequiredEnv("LITTLEHAVEN_DNA_API_URL");
}

export function getLittleHavenApiSecret() {
  return getRequiredEnv("LITTLEHAVEN_DNA_API_SECRET");
}

export function getDnaResultsWebhookSecret() {
  return getRequiredEnv("DNA_RESULTS_WEBHOOK_SECRET");
}

export function getHavenDnaResultsWebhookUrl() {
  return `${getAppOrigin()}/api/dna-tests/results`;
}
