"use client";

import Link from "next/link";
import { useState } from "react";

type PaywallScreenProps = {
  isBetaUser?: boolean;
};

export function PaywallScreen({ isBetaUser = false }: PaywallScreenProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [requestError, setRequestError] = useState("");

  async function handleStartTrial() {
    try {
      setIsRedirecting(true);
      setRequestError("");

      const response = await fetch("/api/billing/checkout", { method: "POST" });
      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Unable to start the free trial.");
      }

      window.location.href = data.url;
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : "Unable to start the free trial.",
      );
      setIsRedirecting(false);
    }
  }

  return (
    <section className="soft-shadow rounded-[32px] border border-[color:var(--line)] bg-white/90 p-6 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
          Billing Required
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Start your 14 day free trial
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
          HavenHatchr includes full breeder workflow access during your 14 day trial, then
          continues at $10 per month. Cancel anytime through the billing portal.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <PricingPill label="Trial" value="14 days free" />
          <PricingPill label="After Trial" value="$10/month" />
          <PricingPill label="Commitment" value="Cancel anytime" />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleStartTrial}
            disabled={isRedirecting || isBetaUser}
            className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isRedirecting ? "Redirecting..." : "Start Free Trial"}
          </button>
          <Link
            href="/settings"
            className="inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-white px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-[#f8f7fe]"
          >
            Open Billing Settings
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-white px-6 py-3 text-sm font-semibold text-[color:var(--muted)] transition hover:bg-[#f8f7fe]"
          >
            View Pricing
          </Link>
        </div>

        {requestError ? <p className="mt-4 text-sm text-[#b34b75]">{requestError}</p> : null}
      </div>
    </section>
  );
}

function PricingPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
