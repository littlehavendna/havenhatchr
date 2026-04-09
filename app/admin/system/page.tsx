"use client";

import { FormEvent, useEffect, useState } from "react";

type SystemSetting = {
  id: string;
  key: string;
  label: string;
  description: string;
  value: unknown;
};

type FormState = Record<string, string>;

export default function AdminSystemPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [form, setForm] = useState<FormState>({});

  async function loadSettings() {
    const response = await fetch("/api/admin/system", { cache: "no-store" });
    if (response.ok) {
      const data = (await response.json()) as { settings: SystemSetting[] };
      setSettings(data.settings);
      setForm(
        Object.fromEntries(
          data.settings.map((setting) => [setting.key, formatValue(setting.value)]),
        ),
      );
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadSettings();
    });
  }, []);

  async function handleSave(event: FormEvent<HTMLFormElement>, setting: SystemSetting) {
    event.preventDefault();
    await fetch("/api/admin/system", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: setting.key,
        label: setting.label,
        description: setting.description,
        value: parseValue(form[setting.key] ?? ""),
      }),
    });
    await loadSettings();
  }

  return (
    <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-6">
      <h2 className="text-lg font-semibold tracking-tight">System Settings</h2>
      <div className="mt-5 space-y-4">
        {settings.map((setting) => (
          <form
            key={setting.id}
            onSubmit={(event) => void handleSave(event, setting)}
            className="rounded-[20px] border border-[color:var(--line)] bg-[#fcfbff] p-4"
          >
            <p className="font-semibold">{setting.label}</p>
            <p className="mt-1 text-sm text-[color:var(--muted)]">{setting.description}</p>
            <textarea
              value={form[setting.key] ?? ""}
              onChange={(event) =>
                setForm((current) => ({ ...current, [setting.key]: event.target.value }))
              }
              rows={3}
              className="mt-4 w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
            />
            <button
              type="submit"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
            >
              Save Setting
            </button>
          </form>
        ))}
      </div>
    </section>
  );
}

function formatValue(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value);
}

function parseValue(value: string) {
  if (value === "true") return true;
  if (value === "false") return false;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
