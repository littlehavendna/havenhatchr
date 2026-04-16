"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type DnaSuccessResponse = {
  order: {
    id: string;
    status: string;
    externalOrderCode: string;
    syncError: string;
    instructions: string;
    chicks: Array<{
      id: string;
      bandNumber: string;
      flockName: string;
      sampleNumber: number;
      status: string;
      resultSummary: string;
    }>;
  };
  error?: string;
};

export default function DnaSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const [data, setData] = useState<DnaSuccessResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setError("Missing DNA order.");
      return;
    }

    async function loadOrder() {
      try {
        const response = await fetch(`/api/dna-tests/orders/${orderId}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as DnaSuccessResponse;

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load the DNA order.");
        }

        setData(payload);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load the DNA order.");
      }
    }

    void loadOrder();
  }, [orderId]);

  return (
    <div className="space-y-6">
      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
          DNA Order Submitted
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Your samples are ready to send</h1>
        <p className="mt-3 max-w-3xl text-sm text-[color:var(--muted)]">
          Payment is complete. Little Haven DNA will handle the customer emails, portal access,
          and order updates once the lab intake succeeds.
        </p>
      </section>

      {error ? (
        <section className="soft-shadow rounded-[28px] border border-[#f0c7d8] bg-[#fff8fb] p-6 text-sm text-[#9b4768]">
          {error}
        </section>
      ) : data ? (
        <>
          <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#edf7f8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--teal)]">
                {data.order.status}
              </span>
              {data.order.externalOrderCode ? (
                <span className="rounded-full border border-[color:var(--line)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  Little Haven Order {data.order.externalOrderCode}
                </span>
              ) : null}
            </div>

            {data.order.syncError ? (
              <p className="mt-4 text-sm text-[#9b4768]">
                Payment succeeded, but the automatic Little Haven DNA handoff still needs attention:{" "}
                {data.order.syncError}
              </p>
            ) : null}

            <div className="mt-5 rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-5">
              <h2 className="text-lg font-semibold tracking-tight">Instructions</h2>
              <div className="mt-3 space-y-2 text-sm text-[color:var(--muted)]">
                {data.order.instructions.split("\n").map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          </section>

          <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-6">
            <h2 className="text-lg font-semibold tracking-tight">Sample Numbers</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {data.order.chicks.map((chick) => (
                <div
                  key={chick.id}
                  className="rounded-2xl border border-[color:var(--line)] bg-[#fcfbff] px-4 py-4"
                >
                  <p className="font-semibold">
                    Sample #{chick.sampleNumber} · {chick.bandNumber}
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">{chick.flockName}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/chicks"
          className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
        >
          Back to Chicks
        </Link>
      </div>
    </div>
  );
}
