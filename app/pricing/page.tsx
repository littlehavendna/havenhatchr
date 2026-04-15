import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start HavenHatchr with a 14 day free trial, then continue for $10 per month. Cancel anytime.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "HavenHatchr Pricing",
    description:
      "14 day free trial, then $10 per month for a breeder workspace covering flocks, chicks, reservations, orders, genetics, and analytics.",
    url: "/pricing",
  },
};

export default function PricingPage() {
  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="soft-shadow rounded-[36px] border border-[color:var(--line)] bg-white/90 p-8 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
            Pricing
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Simple subscription pricing for breeders
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--muted)]">
            Start HavenHatchr with a 14 day free trial, then continue on the starter plan for
            $10 per month. No commitment. Cancel anytime.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="soft-shadow rounded-[32px] border border-[color:var(--line)] bg-[#fcfbff] p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Starter
            </p>
            <p className="mt-4 text-5xl font-semibold tracking-tight">$10</p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">per month after your trial</p>
            <div className="mt-6 space-y-3 text-sm leading-7 text-[color:var(--muted)]">
              <p>14 day free trial</p>
              <p>Automatic transition to monthly billing after trial</p>
              <p>Manage or cancel anytime in the Stripe customer portal</p>
              <p>Full breeder workflow access during active trial or subscription</p>
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

          <div className="soft-shadow rounded-[32px] border border-[color:var(--line)] bg-white/90 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Included
            </p>
            <div className="mt-5 grid gap-3">
              {[
                "Customers, reservations, and orders",
                "Bird profiles, flock records, and hatch groups",
                "Genetics tracking and analytics",
                "AI tools and breeder workflows",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[20px] border border-[color:var(--line)] bg-[#f7f4ff] p-4 text-sm text-[color:var(--muted)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
