import type { Metadata } from "next";
import Link from "next/link";
import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Explore HavenHatchr features for flock records, hatch planning, reservations, customer management, and optional AI support.",
  alternates: {
    canonical: "/features",
  },
  openGraph: {
    title: "HavenHatchr Features",
    description:
      "See how HavenHatchr helps breeders organize birds, hatches, reservations, and day-to-day farm operations with optional AI tools.",
    url: "/features",
  },
};

const featureSections = [
  {
    eyebrow: "Bird and flock records",
    title: "Organize your breeding program with cleaner records.",
    description:
      "Keep birds, flocks, breeding groups, and identification details connected so you can find the right history without digging through notes, spreadsheets, or text threads.",
    highlights: [
      "Bird profiles with searchable history",
      "Band numbers and breeder notes",
      "Flock and breeding group organization",
      "A clearer system for long-term recordkeeping",
    ],
  },
  {
    eyebrow: "Hatch workflow",
    title: "Track hatches from planning to pickup.",
    description:
      "Manage hatch groups, chick status, and availability in one place so the operational side of your hatchery stays easier to follow as batches overlap.",
    highlights: [
      "Hatch groups and run tracking",
      "Chick counts, status, and availability",
      "Better visibility into active and upcoming hatches",
      "Fewer missed handoffs on pickup day",
    ],
  },
  {
    eyebrow: "Reservations and customers",
    title: "Keep buyers, commitments, and inventory aligned.",
    description:
      "Tie reservations and customer details directly to what is available so you can manage interest, promised chicks, and pickup coordination more professionally.",
    highlights: [
      "Reservation tracking by hatch or chick availability",
      "Customer notes and repeat buyer history",
      "Simpler visibility into open versus reserved inventory",
      "Less confusion when demand picks up",
    ],
  },
  {
    eyebrow: "Optional AI",
    title: "Use AI where it helps, not where it gets in the way.",
    description:
      "HavenHatchr can include optional AI tools to support workflows, summaries, and breeder operations, while the core product remains useful on its own without requiring AI for daily use.",
    highlights: [
      "Optional AI support for selected workflows",
      "Core records and operations do not depend on AI",
      "Designed to stay practical and breeder-focused",
      "A better fit for teams that want flexibility",
    ],
  },
];

const audienceCards = [
  {
    title: "Breeders",
    description:
      "Track breeding groups, bird history, hatch outcomes, and reservations with a system built around breeding decisions.",
  },
  {
    title: "Homesteaders",
    description:
      "Keep a smaller operation organized with simple tools for birds, chicks, notes, and planned pickups.",
  },
  {
    title: "Growing farms",
    description:
      "Standardize daily workflows as your flock count, hatch volume, and customer activity continue to expand.",
  },
];

export default function FeaturesPage() {
  return (
    <PublicPageShell>
      <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="soft-shadow rounded-[36px] border border-[color:var(--line)] bg-white/90 p-8 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
              Features
            </p>
            <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Everything you need to run a more organized breeding operation.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[color:var(--muted)]">
              HavenHatchr brings breeder records, hatch workflow, customer coordination,
              and optional AI support into one system designed for practical day-to-day
              farm use.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
              >
                Get Started
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-white px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-[#f8f7fe]"
              >
                View Pricing
              </Link>
            </div>
          </div>

          <div className="space-y-6">
            {featureSections.map((section, index) => (
              <section
                key={section.title}
                className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch"
              >
                <div
                  className={`soft-shadow rounded-[34px] border border-[color:var(--line)] p-8 sm:p-10 ${
                    index % 2 === 0 ? "bg-white/90" : "bg-[#fcfaff]"
                  }`}
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                    {section.eyebrow}
                  </p>
                  <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                    {section.title}
                  </h2>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--muted)]">
                    {section.description}
                  </p>
                </div>

                <div className="soft-shadow rounded-[34px] border border-[color:var(--line)] bg-[linear-gradient(180deg,#efeafd_0%,#e2f5f2_100%)] p-8 sm:p-10">
                  <div className="grid gap-3">
                    {section.highlights.map((item) => (
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
            ))}
          </div>

          <section className="rounded-[36px] border border-[color:var(--line)] bg-[#2f2558] p-8 text-white sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/65">
              Built for serious poultry people
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
              A better fit for breeders, homesteaders, and growing farms.
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {audienceCards.map((card) => (
                <article key={card.title} className="rounded-[28px] bg-white/10 p-6">
                  <h3 className="text-xl font-semibold tracking-tight">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/72">{card.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="soft-shadow rounded-[36px] border border-[color:var(--line)] bg-white/90 p-8 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
              One organized system
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Built to support the full breeder workflow from records to reservations.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[color:var(--muted)]">
              HavenHatchr brings together the parts of the operation that matter most:
              bird history, hatch planning, customer coordination, and optional AI support
              in a workspace that stays practical, polished, and easy to manage.
            </p>
          </section>
        </div>
      </section>
    </PublicPageShell>
  );
}
