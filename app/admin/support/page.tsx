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
  recentAccountEvents: Array<{
    id: string;
    action: string;
    summary: string;
    createdAt: string | null;
  }>;
  recentUsage: Array<{ id: string; eventType: string; route: string; createdAt: string | null }>;
  recentOperationalEvents: Array<{
    id: string;
    level: string;
    source: string;
    eventType: string;
    message: string;
    route: string;
    requestId: string | null;
    createdAt: string | null;
  }>;
  placeholderImpersonation: string;
};

export default function AdminSupportPage() {
  const [data, setData] = useState<SupportData | null>(null);
  const [search, setSearch] = useState("");
  const [requestError, setRequestError] = useState("");
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

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

  async function handleLoadDemoData(userId: string) {
    try {
      setRequestError("");
      setLoadingUserId(userId);

      const response = await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "loadDemoData", userId }),
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Unable to load demo data.");
      }

      await loadSupport(search);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Unable to load demo data.");
    } finally {
      setLoadingUserId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Support Operations</h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Search user accounts, review recent account events, diagnose billing or access
              state, and optionally load demo data into a clean test account.
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
        {requestError ? <p className="mt-4 text-sm text-[#b34b75]">{requestError}</p> : null}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Account Diagnostics">
          <div className="space-y-3">
            {(data?.users ?? []).map((user) => (
              <div
                key={user.id}
                className="rounded-[20px] border border-[color:var(--line)] bg-[#fcfbff] p-4"
              >
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-[color:var(--muted)]">{user.email}</p>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  {user.subscriptionStatus} · {user.accountDisabledAt ? "Disabled" : "Active"}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">
                  {user.stripeCustomerId || "No Stripe customer"}
                </p>
                <button
                  type="button"
                  onClick={() => handleLoadDemoData(user.id)}
                  disabled={loadingUserId === user.id}
                  className="mt-4 inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)] transition hover:bg-[#f8f7fe] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loadingUserId === user.id ? "Loading..." : "Load Demo Data"}
                </button>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Recent Account Events">
          <div className="space-y-3">
            {(data?.recentAccountEvents ?? []).map((entry) => (
              <div
                key={entry.id}
                className="rounded-[20px] border border-[color:var(--line)] bg-[#fff7f8] p-4"
              >
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

      <Section title="Recent Operational Events">
        <div className="space-y-3">
          {(data?.recentOperationalEvents ?? []).map((entry) => (
            <div
              key={entry.id}
              className="rounded-[20px] border border-[color:var(--line)] bg-[#f7f5ff] p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold">{entry.eventType}</span>
                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
                  {entry.level}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                  {entry.source}
                </span>
              </div>
              <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{entry.message}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">
                {entry.route || "No route"} {entry.requestId ? `· ${entry.requestId}` : ""}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">
                {entry.createdAt ? formatDate(entry.createdAt) : "-"}
              </p>
            </div>
          ))}
        </div>
      </Section>

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
