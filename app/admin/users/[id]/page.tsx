"use client";

import { useEffect, useState } from "react";

type UserDetail = {
  user: {
    id: string;
    name: string;
    email: string;
    plan: string;
    subscriptionStatus: string;
    trialEnd: string | null;
    currentPeriodEnd: string | null;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    isBetaUser: boolean;
    isFounder: boolean;
    aiAccessEnabled: boolean;
    isAdmin: boolean;
    createdAt: string;
    lastLoginAt: string | null;
    accountDisabledAt: string | null;
  };
  recordCounts: Record<string, number>;
  recentActivity: Array<{ id: string; eventType: string; route: string; createdAt: string | null }>;
  aiUsageSummary: {
    totalEvents: number;
    byTool: Array<{ tool: string; count: number }>;
  };
  auditHistory: Array<{ id: string; action: string; summary: string; createdAt: string | null }>;
};

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [data, setData] = useState<UserDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { id } = await params;
        const response = await fetch(`/api/admin/users/${id}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load user detail.");
        setData((await response.json()) as UserDetail);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load user detail.");
      }
    }

    void load();
  }, [params]);

  const user = data?.user;

  return (
    <div className="space-y-6">
      {error ? <p className="text-sm text-[#b34b75]">{error}</p> : null}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DetailCard label="Plan" value={user?.plan ?? "-"} />
        <DetailCard label="Subscription" value={user?.subscriptionStatus ?? "-"} />
        <DetailCard label="Trial End" value={user?.trialEnd ? formatDate(user.trialEnd) : "-"} />
        <DetailCard label="Renewal" value={user?.currentPeriodEnd ? formatDate(user.currentPeriodEnd) : "-"} />
      </section>
      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Account Details">
          <KeyValue label="Name" value={user?.name ?? "-"} />
          <KeyValue label="Email" value={user?.email ?? "-"} />
          <KeyValue label="Created" value={user?.createdAt ? formatDate(user.createdAt) : "-"} />
          <KeyValue label="Last Login" value={user?.lastLoginAt ? formatDate(user.lastLoginAt) : "-"} />
          <KeyValue label="Disabled At" value={user?.accountDisabledAt ? formatDate(user.accountDisabledAt) : "-"} />
        </Section>
        <Section title="Feature Access">
          <KeyValue label="Beta Access" value={user?.isBetaUser ? "Enabled" : "No"} />
          <KeyValue label="Founder Access" value={user?.isFounder ? "Enabled" : "No"} />
          <KeyValue label="AI Access" value={user?.aiAccessEnabled ? "Enabled" : "Off"} />
          <KeyValue label="Admin Access" value={user?.isAdmin ? "Enabled" : "No"} />
          <KeyValue label="Stripe Customer" value={user?.stripeCustomerId ?? "-"} />
          <KeyValue label="Stripe Subscription" value={user?.stripeSubscriptionId ?? "-"} />
        </Section>
      </div>
      <Section title="Record Counts">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Object.entries(data?.recordCounts ?? {}).map(([key, value]) => (
            <DetailCard key={key} label={toLabel(key)} value={String(value)} />
          ))}
        </div>
      </Section>
      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Recent Activity">
          <div className="space-y-3">
            {(data?.recentActivity ?? []).map((item) => (
              <div key={item.id} className="rounded-[20px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
                <p className="font-semibold">{item.eventType}</p>
                <p className="text-sm text-[color:var(--muted)]">{item.route || "-"}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">
                  {item.createdAt ? formatDate(item.createdAt) : "-"}
                </p>
              </div>
            ))}
          </div>
        </Section>
        <Section title="AI Usage Summary">
          <KeyValue label="Total AI Events" value={String(data?.aiUsageSummary.totalEvents ?? 0)} />
          <div className="mt-4 space-y-3">
            {(data?.aiUsageSummary.byTool ?? []).map((item) => (
              <div key={item.tool} className="flex items-center justify-between rounded-[20px] border border-[color:var(--line)] bg-[#edf7f8] px-4 py-3">
                <span className="font-semibold">{item.tool}</span>
                <span className="text-sm text-[color:var(--teal)]">{item.count}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>
      <Section title="Audit History">
        <div className="space-y-3">
          {(data?.auditHistory ?? []).map((entry) => (
            <div key={entry.id} className="rounded-[20px] border border-[color:var(--line)] bg-[#fff7f8] p-4">
              <p className="font-semibold">{entry.action}</p>
              <p className="mt-1 text-sm text-[color:var(--muted)]">{entry.summary}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">
                {entry.createdAt ? formatDate(entry.createdAt) : "-"}
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

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[color:var(--line)] py-3 text-sm last:border-b-0">
      <span className="font-semibold">{label}</span>
      <span className="text-right text-[color:var(--muted)]">{value}</span>
    </div>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">{label}</p>
      <p className="mt-2 text-lg font-semibold tracking-tight">{value}</p>
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

function toLabel(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}
