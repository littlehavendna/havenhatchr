import Link from "next/link";

const features = [
  {
    title: "Track band numbers",
    description:
      "Attach every bird to a clean record with lineage, notes, and breeder history in one place.",
  },
  {
    title: "Manage hatch groups",
    description:
      "Keep incubator runs, hatch dates, and outcomes organized from setting eggs to pickup day.",
  },
  {
    title: "Organize customers",
    description:
      "Store reservations, contact notes, and repeat buyers without relying on messy spreadsheets.",
  },
  {
    title: "Track chick availability",
    description:
      "See what is reserved, what is open, and what is ready across upcoming hatches.",
  },
];

const workflow = [
  "Flocks and breeding groups stay tied to the birds that produced each hatch.",
  "Band numbers make it easy to identify, sort, and reference birds later.",
  "Reservations connect customers directly to available chicks and hatch groups.",
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="px-4 pt-4 sm:px-6 lg:px-8">
        <div className="glass-panel soft-shadow mx-auto flex max-w-7xl items-center justify-between rounded-[30px] border border-[color:var(--line)] px-5 py-4 sm:px-6">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            HavenHatchr
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-[color:var(--muted)] md:flex">
            <a href="#features" className="transition hover:text-foreground">
              Features
            </a>
            <a href="#pricing" className="transition hover:text-foreground">
              Pricing
            </a>
            <Link href="/dashboard" className="transition hover:text-foreground">
              Login
            </Link>
          </nav>
          <Link
            href="/dashboard"
            className="rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#265b42]"
          >
            Login
          </Link>
        </div>
      </header>

      <main>
        <section className="relative px-4 pb-14 pt-10 sm:px-6 sm:pt-16 lg:px-8 lg:pt-24">
          <div className="pointer-events-none absolute inset-x-0 top-8 -z-10 mx-auto h-[420px] max-w-6xl rounded-full bg-[radial-gradient(circle,rgba(216,234,214,0.9)_0%,rgba(216,234,214,0.25)_42%,transparent_72%)]" />
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div className="max-w-2xl">
              <p className="inline-flex rounded-full border border-[color:var(--line)] bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                Poultry breeder software
              </p>
              <h1 className="mt-6 text-5xl font-semibold tracking-[-0.04em] text-foreground sm:text-6xl lg:text-[5.2rem] lg:leading-[0.96]">
                Organize Your Flock. Track Every Chick.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[color:var(--muted)] sm:text-xl">
                The all-in-one system for breeders to track flocks, chicks, and
                customers.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-7 py-3.5 text-base font-semibold text-white transition hover:bg-[#265b42]"
                >
                  Get Started
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-white/75 px-7 py-3.5 text-base font-semibold text-foreground transition hover:bg-white"
                >
                  Explore Features
                </a>
              </div>
              <div className="mt-8 flex flex-wrap gap-6 text-sm text-[color:var(--muted)]">
                <p>Flocks</p>
                <p>Band numbers</p>
                <p>Hatch groups</p>
                <p>Reservations</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-6 top-8 h-24 w-24 rounded-full bg-[color:var(--warm)]/40 blur-2xl" />
              <div className="absolute -right-4 bottom-10 h-28 w-28 rounded-full bg-[color:var(--accent-soft)] blur-2xl" />
              <div className="soft-shadow relative overflow-hidden rounded-[38px] border border-[color:var(--line)] bg-[linear-gradient(160deg,#fbf8f1_0%,#f0f7ee_55%,#e1ecdb_100%)] p-4 sm:p-5">
                <div className="rounded-[30px] border border-white/70 bg-white/80 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-[color:var(--muted)]">
                        This week at the hatchery
                      </p>
                      <p className="mt-2 text-3xl font-semibold tracking-tight">
                        148 chicks tracked
                      </p>
                    </div>
                    <div className="rounded-full bg-[color:var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--accent)]">
                      24 reserved
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[26px] border border-[color:var(--line)] bg-[#fcfdf9] p-4">
                      <p className="text-sm text-[color:var(--muted)]">Breeding groups</p>
                      <p className="mt-2 text-2xl font-semibold">18 active</p>
                      <p className="mt-1 text-sm text-[color:var(--accent)]">
                        Lineage and notes connected
                      </p>
                    </div>
                    <div className="rounded-[26px] border border-[color:var(--line)] bg-[#fcfdf9] p-4">
                      <p className="text-sm text-[color:var(--muted)]">Band registry</p>
                      <p className="mt-2 text-2xl font-semibold">96% complete</p>
                      <p className="mt-1 text-sm text-[color:var(--accent)]">
                        Searchable by bird or hatch
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-[28px] border border-[color:var(--line)] bg-[#f7f3e8] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[color:var(--muted)]">
                          Upcoming pickup list
                        </p>
                        <p className="mt-1 text-lg font-semibold">Saturday hatch group</p>
                      </div>
                      <p className="text-sm font-medium text-[color:var(--accent)]">
                        9 reservations
                      </p>
                    </div>
                    <div className="mt-4 space-y-3">
                      {[
                        "Blue laced red Wyandotte",
                        "Olive Egger",
                        "Buff Orpington",
                      ].map((breed) => (
                        <div
                          key={breed}
                          className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm"
                        >
                          <span>{breed}</span>
                          <span className="text-[color:var(--muted)]">Available</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[34px] border border-[color:var(--line)] bg-[#23372b] p-8 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/65">
                Built for real breeder workflows
              </p>
              <h2 className="mt-4 max-w-md text-3xl font-semibold tracking-tight sm:text-4xl">
                Replace scattered notebooks, texts, and spreadsheets.
              </h2>
              <p className="mt-5 max-w-lg text-base leading-8 text-white/72">
                HavenHatchr gives you one clear system for flock records, hatch
                planning, customer reservations, and chick availability.
              </p>
            </div>

            <div className="soft-shadow rounded-[34px] border border-[color:var(--line)] bg-white/86 p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                How it works
              </p>
              <div className="mt-6 space-y-5">
                {workflow.map((item, index) => (
                  <div key={item} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--accent-soft)] font-semibold text-[color:var(--accent)]">
                      0{index + 1}
                    </div>
                    <p className="pt-1 text-base leading-8 text-[color:var(--muted)]">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                Features
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                The same calm, organized feeling your breeding records should have.
              </h2>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {features.map((feature, index) => (
                <article
                  key={feature.title}
                  className={`soft-shadow rounded-[30px] border border-[color:var(--line)] p-6 ${
                    index % 2 === 0 ? "bg-white/90" : "bg-[#f8fbf6]"
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--accent-soft)] text-sm font-semibold text-[color:var(--accent)]">
                    HH
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-6 sm:px-6 lg:px-8 lg:py-14">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="soft-shadow rounded-[36px] border border-[color:var(--line)] bg-white/86 p-7 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                Why breeders use it
              </p>
              <h2 className="mt-4 max-w-lg text-3xl font-semibold tracking-tight sm:text-4xl">
                Easier planning for each hatch, and fewer missed details.
              </h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  ["Flocks", "Tie breeding groups to the birds, notes, and outcomes that matter."],
                  ["Chicks", "Track age, status, and availability from hatch through pickup."],
                  ["Band numbers", "Keep identification consistent and easy to search later."],
                  ["Reservations", "Know which customers are waiting and what has been promised."],
                ].map(([title, description]) => (
                  <div
                    key={title}
                    className="rounded-[26px] border border-[color:var(--line)] bg-[#fcfdf9] p-5"
                  >
                    <p className="text-lg font-semibold tracking-tight">{title}</p>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[36px] border border-[color:var(--line)] bg-[linear-gradient(180deg,#f7f3e8_0%,#edf5ea_100%)] p-7 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                Made for small farms and growing hatcheries
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Keep the operation tidy without making it feel corporate.
              </h2>
              <p className="mt-5 text-base leading-8 text-[color:var(--muted)]">
                The visual direction is intentionally warm, calm, and practical.
                It feels more like a thoughtful breeding workspace than generic
                software.
              </p>
              <Link
                href="/dashboard"
                className="mt-8 inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#265b42]"
              >
                Open HavenHatchr
              </Link>
            </div>
          </div>
        </section>

        <section id="pricing" className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div className="soft-shadow mx-auto max-w-5xl rounded-[38px] border border-[color:var(--line)] bg-white/86 p-6 sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
                  Pricing
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Simple pricing for breeders who need better organization.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[color:var(--muted)]">
                  Start with one clean workspace for flocks, chicks, band
                  numbers, hatch groups, and customer reservations.
                </p>
              </div>

              <div className="rounded-[30px] border border-[color:var(--line)] bg-[#f8fbf6] p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  Starter
                </p>
                <p className="mt-3 text-4xl font-semibold tracking-tight">$19</p>
                <p className="mt-1 text-sm text-[color:var(--muted)]">per month</p>
                <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
                  For breeders who want records, hatch planning, and reservation
                  tracking all in one place.
                </p>
                <Link
                  href="/dashboard"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#265b42]"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-[color:var(--line)] py-6 text-sm text-[color:var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>HavenHatchr</p>
          <p>Breeder software for flocks, chicks, hatch groups, and reservations.</p>
        </div>
      </footer>
    </div>
  );
}
