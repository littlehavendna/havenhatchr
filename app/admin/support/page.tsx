"use client";

import { useEffect, useState } from "react";

type SupportData = {
  users: Array<{
    id: string;
    name: string;
    email: string;
    subscriptionStatus: string;
    accountDisabledAt: string | null;
    stripeCustomerId: string | null;
  }>;
  recentAccountEvents: Array<{ id: string; action: string; summary: string; createdAt: string | null }>;
  recentUsage: Array<{ id: string; eventType: string; route: string; createdAt: string | null }>;
  placeholderImpersonation: string;
};

export default function AdminSupportPage() {
  const [data, setData] = useState<SupportData | null>(null);
  const [search, setSearch] = useState("");

  async function loadSupport(query = "") {
    const response = await fetch(`/api/admin/support?search=${encodeURIComponent(query)}`, {
      cache: "no-store",
    });
    if (response.ok) {
      setData((await response.json()) as SupportData);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadSupport();
    });
  }, []);

  return (
    <div className="space-y-6">
      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Support Operations</h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Search user accounts, review recent account events, and diagnose billing or access state.
            </p>
          </div>
          <input
            type="text"
            value={search}
            onChange={(event) => {
              const value = event.target.value;
              setSearch(value);
              void loadSupport(value);
            }}
            placeholder="Search user, email, or Stripe customer id"
            className="w-full max-w-md rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
          />
        </div>
      </section>
      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Account Diagnostics">
          <div className="space-y-3">
            {(data?.users ?? []).map((user) => (
              <div key={user.id} className="rounded-[20px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-[color:var(--muted)]">{user.email}</p>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  {user.subscriptionStatus} · {user.accountDisabledAt ? "Disabled" : "Active"}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">
                  {user.stripeCustomerId || "No Stripe customer"}
                </p>
              </div>
            ))}
          </div>
        </Section>
        <Section title="Recent Account Events">
          <div className="space-y-3">
            {(data?.recentAccountEvents ?? []).map((entry) => (
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
      <Section title="Support Notes">
        <div className="rounded-[20px] border border-[color:var(--line)] bg-[#edf7f8] p-4 text-sm text-[color:var(--muted)]">
          {data?.placeholderImpersonation ?? "-"}
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
