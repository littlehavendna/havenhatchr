import type { Metadata } from "next";
import Link from "next/link";
import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start HavenHatchr with a 7 day free trial, then continue for $10 per month. Cancel anytime.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "HavenHatchr Pricing",
    description:
      "7 day free trial, then $10 per month for a breeder workspace covering flocks, chicks, reservations, customer workflows, and optional AI tools.",
    url: "/pricing",
  },
};

const included = [
  "Bird profiles, flock records, and breeding group organization",
  "Hatch groups, chick tracking, and availability management",
  "Reservations, customer notes, and order coordination",
  "Optional AI tools alongside the core breeder workflow",
];

const pricingNotes = [
  "7 day free trial",
  "Automatic transition to $10/month after the trial ends",
  "Cancel anytime through the billing portal",
  "Full access during an active trial or subscription",
];

export default function PricingPage() {
  return (
    <PublicPageShell>
      <section className="relative px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pt-16">
        <div className="pointer-events-none absolute inset-x-0 top-8 -z-10 mx-auto h-[360px] max-w-5xl rounded-full bg-[radial-gradient(circle,rgba(184,167,240,0.72)_0%,rgba(60,169,164,0.18)_48%,transparent_74%)]" />
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="soft-shadow rounded-[38px] border border-[color:var(--line)] bg-white/90 p-8 sm:p-10 lg:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
              Pricing
            </p>
            <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Simple pricing for breeders who want better organization.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[color:var(--muted)]">
              Start HavenHatchr with a 7 day free trial, then continue for $10 per
              month. No long-term commitment. Cancel anytime.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
              >
                Start Free Trial
              </Link>
              <Link
                href="/features"
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-white px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-[#f8f7fe]"
              >
                Review Features
              </Link>
            </div>
          </div>

          <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="soft-shadow rounded-[34px] border border-[color:var(--line)] bg-[#fcfbff] p-8 sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Starter plan
              </p>
              <div className="mt-4 flex items-end gap-3">
                <p className="text-5xl font-semibold tracking-tight">$10</p>
                <p className="pb-1 text-sm text-[color:var(--muted)]">per month after trial</p>
              </div>
              <div className="mt-6 grid gap-3">
                {pricingNotes.map((item) => (
                  <div
                    key={item}
                    className="rounded-[22px] border border-[color:var(--line)] bg-white px-4 py-4 text-sm leading-7 text-[color:var(--muted)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
                >
                  Create Account
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-white px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-[#f8f7fe]"
                >
                  Log In
                </Link>
              </div>
            </div>

            <div className="rounded-[34px] border border-[color:var(--line)] bg-[linear-gradient(180deg,#efeafd_0%,#dff4f1_100%)] p-8 sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Included
              </p>
              <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
                One subscription for the core breeder workflow.
              </h2>
              <div className="mt-6 grid gap-3">
                {included.map((item) => (
                  <div
                    key={item}
                    className="rounded-[22px] border border-white/70 bg-white/82 px-4 py-4 text-sm leading-7 text-[color:var(--muted)]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="soft-shadow rounded-[36px] border border-[color:var(--line)] bg-white/90 p-8 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
              Straightforward by design
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
              No confusing tiers. No bloated plan comparison table.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[color:var(--muted)]">
              HavenHatchr is priced to stay accessible for breeders, homesteaders,
              and growing farms that need a practical system for birds, hatches,
              reservations, and customer coordination.
            </p>
          </section>
        </div>
      </section>
    </PublicPageShell>
  );
}
