"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/stat-card";

type BillingUser = {
  id: string;
  name: string;
  email: string;
  subscriptionStatus: string;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
};

type BillingData = {
  activeSubscriptions: BillingUser[];
  trialUsers: BillingUser[];
  pastDueUsers: BillingUser[];
  canceledSubscriptions: BillingUser[];
  renewalTimeline: BillingUser[];
};

export default function AdminBillingPage() {
  const [data, setData] = useState<BillingData | null>(null);

  useEffect(() => {
    async function load() {
      const response = await fetch("/api/admin/billing", { cache: "no-store" });
      if (response.ok) setData((await response.json()) as BillingData);
    }

    void load();
  }, []);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active" value={String(data?.activeSubscriptions.length ?? 0)} detail="Paying subscriptions" />
        <StatCard label="Trial" value={String(data?.trialUsers.length ?? 0)} detail="Trialing accounts" />
        <StatCard label="Past Due" value={String(data?.pastDueUsers.length ?? 0)} detail="Billing attention needed" />
        <StatCard label="Canceled" value={String(data?.canceledSubscriptions.length ?? 0)} detail="Canceled subscriptions still tracked" />
      </section>
      <Section title="Renewal Timeline">
        <div className="space-y-3">
          {(data?.renewalTimeline ?? []).map((user) => (
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
                Renewal: {user.currentPeriodEnd ? formatDate(user.currentPeriodEnd) : "-"}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">
                {user.stripeCustomerId || "-"} / {user.stripeSubscriptionId || "-"}
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
