import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Browse setup and workflow guides for using HavenHatchr as a breeder, homesteader, or growing farm.",
  alternates: {
    canonical: "/guides",
  },
  openGraph: {
    title: "HavenHatchr Guides",
    description:
      "Walkthrough guides for setting up flocks, hatch workflows, reservations, and breeder operations in HavenHatchr.",
    url: "/guides",
  },
};

const walkthroughSteps = [
  {
    number: "01",
    title: "Set up your breeding records",
    description:
      "Start by adding birds, flock groupings, band numbers, and the notes you normally keep across notebooks or spreadsheets.",
  },
  {
    number: "02",
    title: "Build your hatch workflow",
    description:
      "Create hatch groups, track chick progress, and keep availability visible from planning through pickup.",
  },
  {
    number: "03",
    title: "Coordinate buyers clearly",
    description:
      "Tie reservations and customer details to real availability so promises stay organized as demand grows.",
  },
];

const guideCards = [
  {
    title: "Getting Started",
    description:
      "A clean first-run guide for setting up birds, flocks, and the records you will rely on most often.",
    image: "/images/eggsinhand.jpeg",
  },
  {
    title: "Hatch Workflow",
    description:
      "A practical walkthrough for moving from incubation planning to chick tracking and pickup readiness.",
    image: "/images/chicksinincubator.jpeg",
  },
  {
    title: "Reservations",
    description:
      "A focused guide for handling customer requests, availability, and promised chicks more professionally.",
    image: "/images/chicksongourd.jpeg",
  },
];

const learningPoints = [
  "How to structure bird and flock records in a way that scales.",
  "How to manage hatch groups without losing track of active batches.",
  "How to keep reservations, customer notes, and chick availability aligned.",
  "How optional AI can support workflow tasks without becoming required.",
];

export default function GuidesPage() {
  return (
    <PublicPageShell>
      <section className="relative px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pt-16">
        <div className="pointer-events-none absolute inset-x-0 top-8 -z-10 mx-auto h-[360px] max-w-5xl rounded-full bg-[radial-gradient(circle,rgba(184,167,240,0.72)_0%,rgba(60,169,164,0.18)_48%,transparent_74%)]" />
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="soft-shadow overflow-hidden rounded-[38px] border border-[color:var(--line)] bg-white/90">
            <div className="grid gap-0 lg:grid-cols-[1.02fr_0.98fr]">
              <div className="p-8 sm:p-10 lg:p-12">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                  Guides
                </p>
                <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                  A pretty walkthrough page for learning the HavenHatchr workflow.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--muted)]">
                  These guides are meant to help breeders, homesteaders, and growing
                  farms get organized faster with a calmer, more structured setup process.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
                  >
                    Start Your Setup
                  </Link>
                  <Link
                    href="/features"
                    className="inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-white px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-[#f8f7fe]"
                  >
                    View Features
                  </Link>
                </div>
              </div>

              <div className="relative min-h-[320px]">
                <Image
                  src="/images/rainbowdozen.jpeg"
                  alt="Guide overview"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[34px] border border-[color:var(--line)] bg-[#2f2558] p-8 text-white sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/65">
                Walkthrough
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Learn the system in a logical order.
              </h2>
              <p className="mt-4 max-w-lg text-base leading-8 text-white/72">
                The goal is to help new customers understand how records, hatches,
                reservations, and optional AI fit together without overwhelming them.
              </p>
            </div>

            <div className="soft-shadow rounded-[34px] border border-[color:var(--line)] bg-white/88 p-8 sm:p-10">
              <div className="space-y-5">
                {walkthroughSteps.map((step) => (
                  <div key={step.number} className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--accent-soft)] font-semibold text-[color:var(--accent)]">
                      {step.number}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight">{step.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                Guide library
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Start with the guide that matches the work in front of you.
              </h2>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {guideCards.map((guide) => (
                <article
                  key={guide.title}
                  className="soft-shadow overflow-hidden rounded-[32px] border border-[color:var(--line)] bg-white/88"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={guide.image}
                      alt={guide.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-semibold tracking-tight">{guide.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                      {guide.description}
                    </p>
                    <Link
                      href="/signup"
                      className="mt-6 inline-flex items-center rounded-full border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-[#f8f7fe]"
                    >
                      Open this path
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="soft-shadow rounded-[34px] border border-[color:var(--line)] bg-white/90 p-8 sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                What you will learn
              </p>
              <div className="mt-6 grid gap-3">
                {learningPoints.map((point) => (
                  <div
                    key={point}
                    className="rounded-[22px] border border-[color:var(--line)] bg-[#faf8ff] px-4 py-4 text-sm leading-7 text-[color:var(--muted)]"
                  >
                    {point}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[34px] border border-[color:var(--line)] bg-[linear-gradient(180deg,#efeafd_0%,#dff4f1_100%)] p-8 sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                Next buildout
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Ready for deeper walkthroughs.
              </h2>
              <p className="mt-4 text-base leading-8 text-[color:var(--muted)]">
                This page now has the structure for individual guide pages, screenshots,
                setup checklists, and more detailed how-to content when you are ready.
              </p>
            </div>
          </section>
        </div>
      </section>
    </PublicPageShell>
  );
}
