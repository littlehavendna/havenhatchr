import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn why HavenHatchr was built for breeders, homesteaders, and growing farms that want cleaner records and more personal tools.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About HavenHatchr",
    description:
      "HavenHatchr is a breeder-focused software project built around practical flock, hatch, reservation, and customer workflows.",
    url: "/about",
  },
};

const principles = [
  {
    title: "Built from real breeder work",
    description:
      "HavenHatchr is shaped by the kind of daily flock management, hatch planning, and customer coordination that happens in real breeding programs.",
  },
  {
    title: "Clear before complicated",
    description:
      "The goal is not to bury breeders in enterprise software. The goal is to make important records easier to follow, search, and trust.",
  },
  {
    title: "Personal, not generic",
    description:
      "This is meant to feel like a thoughtful working system for people who actually raise birds, not a stripped-down copy of software built for somebody else.",
  },
];

export default function AboutPage() {
  return (
    <PublicPageShell>
      <section className="relative px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pt-16">
        <div className="pointer-events-none absolute inset-x-0 top-8 -z-10 mx-auto h-[360px] max-w-5xl rounded-full bg-[radial-gradient(circle,rgba(184,167,240,0.72)_0%,rgba(60,169,164,0.18)_48%,transparent_74%)]" />
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="soft-shadow overflow-hidden rounded-[38px] border border-[color:var(--line)] bg-white/90">
            <div className="grid gap-0 lg:grid-cols-[1fr_0.92fr]">
              <div className="p-8 sm:p-10 lg:p-12">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                  About HavenHatchr
                </p>
                <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                  A breeder-built system for clear records and calmer daily work.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--muted)]">
                  HavenHatchr was created for breeders, homesteaders, and growing farms
                  that need more than scattered notes, text messages, and spreadsheets,
                  but still want something personal, practical, and easy to live in.
                </p>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--muted)]">
                  It is built around the real work of managing birds, hatches, reservations,
                  and customer communication in a way that feels organized without feeling corporate.
                </p>
              </div>

              <div className="relative min-h-[320px]">
                <Image
                  src="/images/eggsongrass.jpeg"
                  alt="Eggs on grass"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-[34px] border border-[color:var(--line)] bg-[#2f2558] p-8 text-white sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/65">
                Our story
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Built from the needs of small, serious poultry operations.
              </h2>
              <p className="mt-4 text-base leading-8 text-white/72">
                HavenHatchr comes from the same world as the breeders it serves:
                people who care deeply about their birds, their hatch plans, their
                customer commitments, and the details that make a breeding program work.
              </p>
            </div>

            <div className="soft-shadow rounded-[34px] border border-[color:var(--line)] bg-white/88 p-8 sm:p-10">
              <div className="space-y-5 text-base leading-8 text-[color:var(--muted)]">
                <p>
                  The idea behind HavenHatchr is simple. Breeders deserve software
                  that understands how their work actually happens. Birds connect to
                  flocks. Flocks connect to hatch outcomes. Hatch outcomes connect to
                  availability, reservations, and customer follow-through.
                </p>
                <p>
                  Too often, that information ends up spread across paper records,
                  phone notes, social messages, and memory. HavenHatchr exists to bring
                  those moving parts into one organized workspace that supports real
                  operations without making them feel oversized or impersonal.
                </p>
                <p>
                  The vision is professional software with a human feel. Clean enough
                  for growing farms. Approachable enough for homesteaders. Useful enough
                  for breeders who need to trust their records year after year.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                What matters here
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                The product is guided by practical breeder priorities.
              </h2>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {principles.map((item, index) => (
                <article
                  key={item.title}
                  className={`soft-shadow rounded-[32px] border border-[color:var(--line)] p-7 ${
                    index === 1 ? "bg-[#edf7f8]" : "bg-white/88"
                  }`}
                >
                  <h3 className="text-2xl font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
            <div className="soft-shadow rounded-[34px] border border-[color:var(--line)] bg-white/90 p-8 sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                How we think about tools
              </p>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Strong records first. Helpful extras second.
              </h2>
              <div className="mt-5 space-y-4 text-sm leading-7 text-[color:var(--muted)]">
                <p>Bird records should stay connected to flock history and breeding decisions.</p>
                <p>Hatch planning should be easier to follow from incubation through pickup.</p>
                <p>Reservations and customer notes should support clearer communication.</p>
                <p>Optional AI should help where useful, but never be required for the product to work well.</p>
              </div>
            </div>

            <div className="rounded-[34px] border border-[color:var(--line)] bg-[linear-gradient(180deg,#efeafd_0%,#dff4f1_100%)] p-8 sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                Looking ahead
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Built to grow with the people using it.
              </h2>
              <p className="mt-4 text-base leading-8 text-[color:var(--muted)]">
                HavenHatchr is meant to keep evolving around the real needs of breeders
                and farm families who want better systems without losing the personal side
                of what they do.
              </p>
              <Link
                href="/signup"
                className="mt-8 inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
              >
                Start with HavenHatchr
              </Link>
            </div>
          </section>
        </div>
      </section>
    </PublicPageShell>
  );
}
