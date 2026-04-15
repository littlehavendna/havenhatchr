"use client";

import { type ReactNode, useEffect, useState } from "react";
import { StatCard } from "@/components/stat-card";

type StorefrontItem = {
  id: string;
  type: "Bird" | "Chick";
  title: string;
  subtitle: string;
  price: string;
  shortDescription: string;
  status: string;
  hatchDate?: string;
  hatchGroupName?: string;
  flockName?: string;
};

type StorefrontResponse = {
  chicks: StorefrontItem[];
  birds: StorefrontItem[];
};

export default function StorefrontPage() {
  const [data, setData] = useState<StorefrontResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/storefront", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load storefront.");
        }

        setData((await response.json()) as StorefrontResponse);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load storefront.");
      }
    }

    void load();
  }, []);

  const stats = [
    {
      label: "Available Chicks",
      value: String(data?.chicks.length ?? 0),
      detail: "Current chick inventory available for listing and customer review.",
    },
    {
      label: "Bird Listing Candidates",
      value: String(data?.birds.length ?? 0),
      detail: "Active birds organized for breeder listing workflows.",
    },
    {
      label: "Storefront State",
      value: "Active",
      detail: "Current listing-ready inventory inside your breeder workspace.",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
          Storefront
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Storefront Inventory</h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
          Review listing-ready chicks and birds with organized descriptions, pricing fields, and breeder context.
        </p>
        {error ? <p className="mt-4 text-sm text-[#b34b75]">{error}</p> : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} detail={card.detail} />
        ))}
      </section>

      <StorefrontSection
        title="Available Chicks"
        emptyCopy="No available chicks are currently listed."
        items={data?.chicks ?? []}
      />

      <StorefrontSection
        title="Bird Listing Candidates"
        emptyCopy="No active birds are currently listed here."
        items={data?.birds ?? []}
      />
    </div>
  );
}

function StorefrontSection({
  title,
  emptyCopy,
  items,
}: {
  title: string;
  emptyCopy: string;
  items: StorefrontItem[];
}) {
  return (
    <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
        {title}
      </p>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {items.length > 0 ? (
          items.map((item) => (
            <article key={`${item.type}-${item.id}`} className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Pill tone="teal">{item.type}</Pill>
                    <Pill tone="accent">{item.status}</Pill>
                  </div>
                  <p className="mt-3 text-base font-semibold tracking-tight text-foreground">{item.title}</p>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">{item.subtitle}</p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
                  {item.price}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{item.shortDescription}</p>
              <div className="mt-3 text-sm text-[color:var(--muted)]">
                {item.hatchDate ? <p>Hatch Date: {formatDate(item.hatchDate)}</p> : null}
                {item.hatchGroupName ? <p>Hatch Group: {item.hatchGroupName}</p> : null}
                {item.flockName ? <p>Flock: {item.flockName}</p> : null}
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-5 text-sm text-[color:var(--muted)]">
            {emptyCopy}
          </div>
        )}
      </div>
    </section>
  );
}

function Pill({ children, tone }: { children: ReactNode; tone: "accent" | "teal" }) {
  const className = tone === "accent" ? "bg-[#f5f3fd] text-[color:var(--accent)]" : "bg-[#edf7f8] text-[color:var(--teal)]";
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${className}`}>{children}</span>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}
