"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/stat-card";

type AdminSummary = {
  totals: {
    totalUsers: number;
    activeSubscribers: number;
    trialUsers: number;
    betaUsers: number;
    founderUsers: number;
    activeBreeders: number;
    aiUsageCount: number;
    signupsLast30Days: number;
    latestSignupAt: string | null;
  };
  recentSignups: Array<{
    id: string;
    name: string;
    email: string;
    subscriptionStatus: string;
    createdAt: string;
  }>;
  aiUsageSnapshot: Array<{ tool: string; count: number }>;
  alerts: string[];
};

export default function AdminOverviewPage() {
  const [data, setData] = useState<AdminSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/admin/summary", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load admin summary.");
        setData((await response.json()) as AdminSummary);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load admin summary.");
      }
    }

    void load();
  }, []);

  return (
    <div className="space-y-6">
      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-[#edf7f8] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--teal)]">
          Signup Snapshot
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          {data?.totals.totalUsers ?? 0} total account{(data?.totals.totalUsers ?? 0) === 1 ? "" : "s"}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
          {data
            ? data.totals.latestSignupAt
              ? `${data.totals.signupsLast30Days} signup${data.totals.signupsLast30Days === 1 ? "" : "s"} in the last 30 days. Latest account created ${formatDate(data.totals.latestSignupAt)}.`
              : "No signup activity is recorded yet."
            : "Loading signup activity..."}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Users" value={String(data?.totals.totalUsers ?? 0)} detail="All accounts in the system" />
        <StatCard label="Signups (30d)" value={String(data?.totals.signupsLast30Days ?? 0)} detail="Accounts created in the last 30 days" />
        <StatCard label="Active Subscribers" value={String(data?.totals.activeSubscribers ?? 0)} detail="Paying users with active access" />
        <StatCard label="Trial Users" value={String(data?.totals.trialUsers ?? 0)} detail="Accounts currently in free trial" />
        <StatCard label="Beta Users" value={String(data?.totals.betaUsers ?? 0)} detail="Accounts bypassing billing checks" />
        <StatCard label="Founder Users" value={String(data?.totals.founderUsers ?? 0)} detail="Founder access accounts" />
        <StatCard label="Active Breeders" value={String(data?.totals.activeBreeders ?? 0)} detail="Users with recorded breeder activity" />
        <StatCard label="AI Usage (7d)" value={String(data?.totals.aiUsageCount ?? 0)} detail="Recent AI tool activity" />
      </section>

      {error ? <p className="text-sm text-[#b34b75]">{error}</p> : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-6">
          <h2 className="text-lg font-semibold tracking-tight">Recent Signups</h2>
          <div className="mt-5 space-y-3">
            {(data?.recentSignups ?? []).map((user) => (
              <div key={user.id} className="rounded-[20px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-[color:var(--muted)]">{user.email}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
                    {user.subscriptionStatus}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  Signed up {formatDate(user.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-6">
          <h2 className="text-lg font-semibold tracking-tight">AI Usage Snapshot</h2>
          <div className="mt-5 space-y-3">
            {(data?.aiUsageSnapshot ?? []).map((entry) => (
              <div key={entry.tool} className="flex items-center justify-between rounded-[20px] border border-[color:var(--line)] bg-[#edf7f8] px-4 py-3">
                <span className="text-sm font-semibold">{entry.tool}</span>
                <span className="text-sm text-[color:var(--teal)]">{entry.count} events</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-6">
        <h2 className="text-lg font-semibold tracking-tight">Alerts & Issues</h2>
        <div className="mt-5 space-y-3">
          {(data?.alerts ?? []).length > 0 ? (
            data?.alerts.map((alert) => (
              <div key={alert} className="rounded-[20px] border border-[color:var(--line)] bg-[#fff7f8] p-4 text-sm text-[color:var(--muted)]">
                {alert}
              </div>
            ))
          ) : (
            <div className="rounded-[20px] border border-[color:var(--line)] bg-[#fcfbff] p-4 text-sm text-[color:var(--muted)]">
              No immediate account or billing alerts.
            </div>
          )}
        </div>
      </section>
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
