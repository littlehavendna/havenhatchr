"use client";

import { FormEvent, useEffect, useState } from "react";

type FeatureFlag = {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  rolloutPercent: number | null;
  audience: string;
};

const emptyForm = {
  name: "",
  key: "",
  description: "",
  audience: "all",
  rolloutPercent: "100",
};

export default function AdminFeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadFlags();
  }, []);

  async function loadFlags() {
    const response = await fetch("/api/admin/feature-flags", { cache: "no-store" });
    if (response.ok) {
      const data = (await response.json()) as { featureFlags: FeatureFlag[] };
      setFlags(data.featureFlags);
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const response = await fetch("/api/admin/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          enabled: true,
          rolloutPercent: Number(form.rolloutPercent) || null,
        }),
      });
      if (!response.ok) throw new Error("Failed to create feature flag.");
      setForm(emptyForm);
      await loadFlags();
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to create feature flag.");
    }
  }

  async function toggleFlag(flag: FeatureFlag) {
    const response = await fetch(`/api/admin/feature-flags/${flag.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !flag.enabled }),
    });
    if (response.ok) await loadFlags();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-6">
        <h2 className="text-lg font-semibold tracking-tight">Create Flag</h2>
        <form onSubmit={handleCreate} className="mt-5 space-y-4">
          {(["name", "key", "description", "audience", "rolloutPercent"] as const).map((field) => (
            <input
              key={field}
              type="text"
              value={form[field]}
              onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
              placeholder={field}
              className="w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
            />
          ))}
          <button type="submit" className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]">
            Create Feature Flag
          </button>
          {error ? <p className="text-sm text-[#b34b75]">{error}</p> : null}
        </form>
      </section>
      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-6">
        <h2 className="text-lg font-semibold tracking-tight">Feature Flags</h2>
        <div className="mt-5 space-y-3">
          {flags.map((flag) => (
            <div key={flag.id} className="rounded-[20px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{flag.name}</p>
                  <p className="text-sm text-[color:var(--muted)]">{flag.key}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void toggleFlag(flag)}
                  className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
                    flag.enabled
                      ? "bg-[#edf7f8] text-[color:var(--teal)]"
                      : "bg-[#f5f3fd] text-[color:var(--accent)]"
                  }`}
                >
                  {flag.enabled ? "Enabled" : "Disabled"}
                </button>
              </div>
              <p className="mt-3 text-sm text-[color:var(--muted)]">{flag.description}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">
                Audience: {flag.audience} · Rollout: {flag.rolloutPercent ?? 0}%
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
