"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DnaEmbeddedCheckout } from "@/components/dna-embedded-checkout";
import { formatCurrencyFromCents } from "@/lib/dna";

type DnaOrderResponse = {
  order: {
    id: string;
    totalAmountCents: number;
    status: string;
    instructions: string;
    chicks: Array<{
      id: string;
      bandNumber: string;
      flockName: string;
      sampleNumber: number;
      status: string;
      resultSummary: string;
    }>;
    lineItems: Array<{
      code: string;
      label: string;
      quantity: number;
      unitPriceCents: number;
      totalPriceCents: number;
    }>;
  };
  clientSecret: string | null;
  publishableKey: string;
  error?: string;
};

export default function DnaCheckoutPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const [data, setData] = useState<DnaOrderResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setError("Missing DNA order.");
      setIsLoading(false);
      return;
    }

    async function loadOrder() {
      try {
        const response = await fetch(`/api/dna-tests/orders/${orderId}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as DnaOrderResponse;

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load the DNA checkout.");
        }

        setData(payload);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load the DNA checkout.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadOrder();
  }, [orderId]);

  return (
    <div className="space-y-6">
      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
              DNA Checkout
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Complete your DNA order</h1>
          </div>
          <Link
            href="/chicks"
            className="inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--muted)] transition hover:bg-[#f8f7fe]"
          >
            Back to Chicks
          </Link>
        </div>
      </section>

      {isLoading ? (
        <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-6 text-sm text-[color:var(--muted)]">
          Loading DNA checkout...
        </section>
      ) : error ? (
        <section className="soft-shadow rounded-[28px] border border-[#f0c7d8] bg-[#fff8fb] p-6 text-sm text-[#9b4768]">
          {error}
        </section>
      ) : data ? (
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-6">
            <h2 className="text-lg font-semibold tracking-tight">Order Summary</h2>
            <div className="mt-4 space-y-3">
              {data.order.lineItems.map((item) => (
                <div
                  key={item.code}
                  className="rounded-2xl border border-[color:var(--line)] bg-[#fcfbff] px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-sm font-semibold text-[color:var(--accent)]">
                      {formatCurrencyFromCents(item.totalPriceCents)}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">
                    {item.quantity} sample{item.quantity === 1 ? "" : "s"} at{" "}
                    {formatCurrencyFromCents(item.unitPriceCents)} each
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel-strong)] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Total
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">
                {formatCurrencyFromCents(data.order.totalAmountCents)}
              </p>
            </div>
            <div className="mt-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Sample Numbers
              </h3>
              <div className="mt-3 space-y-2">
                {data.order.chicks.map((chick) => (
                  <div
                    key={chick.id}
                    className="rounded-2xl border border-[color:var(--line)] bg-[#fcfbff] px-4 py-3 text-sm"
                  >
                    <p className="font-semibold">
                      Sample #{chick.sampleNumber} · {chick.bandNumber}
                    </p>
                    <p className="mt-1 text-[color:var(--muted)]">{chick.flockName}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="soft-shadow overflow-hidden rounded-[28px] border border-[color:var(--line)] bg-white/88 p-3 sm:p-4">
            {data.clientSecret ? (
              <DnaEmbeddedCheckout
                clientSecret={data.clientSecret}
                publishableKey={data.publishableKey}
              />
            ) : (
              <div className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-6 text-sm text-[color:var(--muted)]">
                This order is no longer waiting for payment.
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
