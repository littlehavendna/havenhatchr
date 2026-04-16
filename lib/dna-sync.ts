import "server-only";

import { DnaTestOrderStatus, DnaTestStatus, type Prisma } from "@prisma/client";
import {
  getDnaResultsWebhookSecret,
  getHavenDnaResultsWebhookUrl,
  getLittleHavenApiSecret,
  getLittleHavenApiUrl,
} from "@/lib/dna-server";
import { prisma } from "@/lib/prisma";

function formatDateTime(value: Date | null) {
  return value ? value.toISOString() : null;
}

export async function syncDnaOrderToLittleHaven(orderId: string) {
  const order = await prisma.dnaTestOrder.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
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

  if (!order) {
    throw new Error("DNA order not found.");
  }

  if (order.externalOrderId && order.syncedAt) {
    return order;
  }

  try {
    const response = await fetch(`${getLittleHavenApiUrl().replace(/\/$/, "")}/api/integrations/havenhatchr/orders/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-littlehaven-api-secret": getLittleHavenApiSecret(),
      },
      body: JSON.stringify({
        source: "havenhatchr",
        havenOrderId: order.id,
        havenUserId: order.userId,
        contactName: order.contactName,
        contactEmail: order.contactEmail,
        notes: order.notes,
        totalAmountCents: order.totalAmountCents,
        selectedTests: order.selectedTests,
        callbackUrl: getHavenDnaResultsWebhookUrl(),
        callbackSecret: getDnaResultsWebhookSecret(),
        chicks: order.requests.map((request) => ({
          havenRequestId: request.id,
          chickId: request.chickId,
          bandNumber: request.bandNumber,
          sampleNumber: request.sampleNumber,
          selectedTests: request.selectedTests,
          hatchDate: request.chick.hatchDate.toISOString().slice(0, 10),
          flockName: request.chick.flock.name,
          color: request.chick.color,
          sex: request.chick.sex,
          observedTraits: request.chick.observedTraits,
          notes: request.chick.notes,
        })),
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as {
      externalCustomerId?: string;
      externalOrderCode?: string;
      externalOrderId?: string;
      message?: string;
    };

    if (!response.ok || !payload.externalOrderId) {
      throw new Error(payload.message || "Little Haven DNA intake rejected the order.");
    }

    await prisma.$transaction([
      prisma.dnaTestOrder.update({
        where: { id: order.id },
        data: {
          status: DnaTestOrderStatus.Synced,
          externalCustomerId: payload.externalCustomerId || "",
          externalOrderCode: payload.externalOrderCode || "",
          externalOrderId: payload.externalOrderId,
          syncedAt: new Date(),
          syncError: "",
        },
      }),
      prisma.dnaTestRequest.updateMany({
        where: {
          dnaTestOrderId: order.id,
        },
        data: {
          externalOrderId: payload.externalOrderId,
        },
      }),
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Little Haven DNA sync failed.";

    await prisma.dnaTestOrder.update({
      where: { id: order.id },
      data: {
        status: DnaTestOrderStatus.SyncFailed,
        syncError: message,
      },
    });

    throw error;
  }
}

export async function applyDnaResultsUpdate(data: {
  externalOrderCode?: string;
  externalOrderId?: string;
  completedAt?: string;
  results: Array<{
    sampleNumber: number;
    status?: "Pending" | "Completed" | "Cancelled";
    externalSampleId?: string;
    resultPayload?: Record<string, unknown>;
    resultSummary?: string;
  }>;
}) {
  const order = await prisma.dnaTestOrder.findFirst({
    where: data.externalOrderId
      ? { externalOrderId: data.externalOrderId }
      : { externalOrderCode: data.externalOrderCode || "" },
    include: {
      requests: true,
    },
  });

  if (!order) {
    throw new Error("Matching DNA order was not found.");
  }

  await prisma.$transaction(
    data.results.map((result) => {
      const matchingRequest = order.requests.find((request) => request.sampleNumber === result.sampleNumber);

      if (!matchingRequest) {
        throw new Error(`Sample number ${result.sampleNumber} was not found on this DNA order.`);
      }

      const nextStatus =
        result.status === "Cancelled"
          ? DnaTestStatus.Cancelled
          : result.status === "Completed" || result.resultSummary
            ? DnaTestStatus.Completed
            : DnaTestStatus.Pending;

      return prisma.dnaTestRequest.update({
        where: { id: matchingRequest.id },
        data: {
          status: nextStatus,
          externalSampleId: result.externalSampleId || "",
          resultPayload: result.resultPayload as Prisma.InputJsonValue | undefined,
          resultSummary: result.resultSummary || "",
          completedAt:
            nextStatus === DnaTestStatus.Completed
              ? new Date(data.completedAt || new Date().toISOString())
              : null,
        },
      });
    }),
  );

  const refreshedRequests = await prisma.dnaTestRequest.findMany({
    where: {
      dnaTestOrderId: order.id,
    },
  });

  const allFinished = refreshedRequests.every((request) => request.status !== DnaTestStatus.Pending);
  const allCompleted = refreshedRequests.every((request) => request.status === DnaTestStatus.Completed);

  await prisma.dnaTestOrder.update({
    where: { id: order.id },
    data: {
      status: allCompleted
        ? DnaTestOrderStatus.Completed
        : allFinished
          ? DnaTestOrderStatus.Synced
          : order.status,
      completedAt: allCompleted ? new Date(data.completedAt || new Date().toISOString()) : null,
    },
  });

  return {
    orderId: order.id,
    externalOrderId: order.externalOrderId || "",
    completedAt: formatDateTime(order.completedAt),
  };
}
