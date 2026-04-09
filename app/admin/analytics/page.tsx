"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/stat-card";

type AdminAnalytics = {
  totals: {
    users: number;
    activeSubscribers: number;
    trialUsers: number;
    disabledAccounts: number;
    enabledFeatureFlags: number;
    usageEvents: number;
    aiUsageEvents: number;
  };
  productUsage: Array<{ eventType: string; count: number }>;
  aiUsage: Array<{ tool: string; count: number }>;
  recentUsage: Array<{ id: string; eventType: string; route: string; createdAt: string | null }>;
};

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AdminAnalytics | null>(null);

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/admin/analytics", { cache: "no-store" });
      if (response.ok) setData((await response.json()) as AdminAnalytics);
    }

    void load();
  }, []);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Users" value={String(data?.totals.users ?? 0)} detail="Total accounts" />
        <StatCard label="Enabled Flags" value={String(data?.totals.enabledFeatureFlags ?? 0)} detail="Live internal toggles" />
        <StatCard label="Usage Events" value={String(data?.totals.usageEvents ?? 0)} detail="Tracked product activity" />
        <StatCard label="AI Events" value={String(data?.totals.aiUsageEvents ?? 0)} detail="Tracked AI tool activity" />
      </section>
      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Product Usage">
          <ListCard items={(data?.productUsage ?? []).map((item) => `${item.eventType}: ${item.count}`)} />
        </Section>
        <Section title="AI Usage">
          <ListCard items={(data?.aiUsage ?? []).map((item) => `${item.tool}: ${item.count}`)} />
        </Section>
      </div>
      <Section title="Recent Usage Events">
        <div className="space-y-3">
          {(data?.recentUsage ?? []).map((event) => (
            <div key={event.id} className="rounded-[20px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
              <p className="font-semibold">{event.eventType}</p>
              <p className="text-sm text-[color:var(--muted)]">{event.route || "-"}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">
                {event.createdAt ? formatDate(event.createdAt) : "-"}
              </p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-6">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ListCard({ items }: { items: string[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item} className="rounded-[20px] border border-[color:var(--line)] bg-[#edf7f8] p-4 text-sm text-foreground">
          {item}
        </div>
      ))}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
