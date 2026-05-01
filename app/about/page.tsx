import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PublicPageShell } from "@/components/public-page-shell";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about the breeder behind HavenHatchr and the vision for a more personal, practical software platform for breeders, homesteaders, and growing farms.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About HavenHatchr",
    description:
      "HavenHatchr is a breeder-built software platform created to give breeders clearer records, calmer workflows, and a more personal experience.",
    url: "/about",
  },
};

const values = [
  {
    title: "Breeder built",
    description:
      "HavenHatchr comes from real experience with breeding projects, flock management, genetics, and the daily details that matter.",
  },
  {
    title: "Family rooted",
    description:
      "This work is part of a larger family life built around homesteading, raising animals, and teaching the next generation through hands-on work.",
  },
  {
    title: "Personal by design",
    description:
      "The goal is not to create cold, corporate software. The goal is to build something clear, approachable, and genuinely useful for real breeders.",
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
                  Software built by someone who understands breeding from the inside.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--muted)]">
                  HavenHatchr was created to give breeders, homesteaders, and growing
                  farms a better way to manage the records, hatch planning, and customer
                  communication that so often gets scattered across notebooks, spreadsheets,
                  and memory.
                </p>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--muted)]">
                  This is not software dreamed up by a detached team that has never raised
                  birds. It is rooted in the real work of breeding, genetics, flock planning,
                  and building something reliable enough to use year after year.
                </p>
              </div>

              <div className="relative min-h-[320px]">
                <Image
                  src="/images/eggsongrass.jpeg"
                  alt="Eggs on grass"
                  fill
                  sizes="(min-width: 1024px) 46vw, 100vw"
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
                HavenHatchr grew out of the same passion that built Little Haven DNA.
              </h2>
              <p className="mt-4 text-base leading-8 text-white/72">
                A lifelong fascination with genetics, breeding projects, and how traits
                move from one generation to the next eventually led to a bigger vision:
                not just testing and understanding birds better, but giving breeders better
                tools to run their programs.
              </p>
            </div>

            <div className="soft-shadow rounded-[34px] border border-[color:var(--line)] bg-white/88 p-8 sm:p-10">
              <div className="space-y-5 text-base leading-8 text-[color:var(--muted)]">
                <p>
                  Breeding ermine Ameraucanas pushed that fascination into something much
                  deeper. Learning dominant white, co-dominance, and recessive white pathways
                  required real study, careful observation, and a commitment to understanding
                  the flock with confidence. That process shaped not only the lab side of the
                  work, but the recordkeeping side too.
                </p>
                <p>
                  Over time, it became obvious that breeders need more than passion and memory
                  to stay organized. They need a place to connect birds, hatches, notes,
                  reservations, and customer promises without losing track of the details that
                  make a breeding program successful.
                </p>
                <p>
                  HavenHatchr was created from that need. It is meant to feel like a thoughtful,
                  dependable breeding workspace for the people doing this work every day, whether
                  they are managing a small homestead flock or building a growing farm operation.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                Why this matters
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Built for real breeders, not generic agriculture software.
              </h2>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {values.map((item, index) => (
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
                The vision
              </p>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Better systems, clearer records, and software that still feels human.
              </h2>
              <div className="mt-5 space-y-4 text-sm leading-7 text-[color:var(--muted)]">
                <p>
                  Just like Little Haven DNA was built to make testing more approachable and
                  more personal, HavenHatchr is built to make breeder recordkeeping more
                  organized without making it cold or overwhelming.
                </p>
                <p>
                  It matters that the software is accessible. It matters that it feels calm.
                  It matters that breeders can trust what they put into it and find what they
                  need later when breeding decisions, hatch planning, and customer follow-through
                  are on the line.
                </p>
                <p>
                  Optional AI can support parts of the workflow, but the heart of HavenHatchr
                  is still strong records, thoughtful organization, and tools that respect the
                  way real breeders work.
                </p>
              </div>
            </div>

            <div className="rounded-[34px] border border-[color:var(--line)] bg-[linear-gradient(180deg,#efeafd_0%,#dff4f1_100%)] p-8 sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                From my family to yours
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                A real business built around work that matters.
              </h2>
              <p className="mt-4 text-base leading-8 text-[color:var(--muted)]">
                As a homeschooling mother of three and someone whose work is deeply tied to
                family, animals, and education, I care about building tools that are useful,
                honest, and worth trusting. HavenHatchr is part of that larger vision.
              </p>
              <p className="mt-4 text-base leading-8 text-[color:var(--muted)]">
                When you use HavenHatchr, you are supporting a breeder-built, family-rooted
                business that believes accuracy matters, but so does connection.
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
