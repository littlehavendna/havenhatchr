"use client";

import { FormEvent, useState } from "react";
import { DataTable } from "@/components/data-table";
import { birds, pairings as starterPairings } from "@/lib/mock-data";
import type { Pairing } from "@/lib/types";

type PairingForm = {
  name: string;
  sireId: string;
  damId: string;
  goals: string;
  notes: string;
  active: boolean;
};

const emptyForm: PairingForm = {
  name: "",
  sireId: "",
  damId: "",
  goals: "",
  notes: "",
  active: true,
};

export default function PairingsPage() {
  const [pairings, setPairings] = useState<Pairing[]>(starterPairings);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<PairingForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof PairingForm, string>>>({});

  const rows = pairings.map((pairing) => ({
    name: pairing.name,
    sire: birds.find((bird) => bird.id === pairing.sireId)?.name ?? "Unknown",
    dam: birds.find((bird) => bird.id === pairing.damId)?.name ?? "Unknown",
    goals: pairing.goals,
    status: pairing.active ? "Active" : "Inactive",
    notes: pairing.notes,
  }));

  function updateField<K extends keyof PairingForm>(key: K, value: PairingForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function openModal() {
    setForm(emptyForm);
    setErrors({});
    setIsOpen(true);
  }

  function closeModal() {
    setForm(emptyForm);
    setErrors({});
    setIsOpen(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Partial<Record<keyof PairingForm, string>> = {};
    if (!form.name.trim()) nextErrors.name = "Pairing Name is required.";
    if (!form.sireId) nextErrors.sireId = "Sire is required.";
    if (!form.damId) nextErrors.damId = "Dam is required.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setPairings((current) => [
      {
        id: `pairing_${crypto.randomUUID()}`,
        name: form.name.trim(),
        sireId: form.sireId,
        damId: form.damId,
        goals: form.goals.trim() || "-",
        notes: form.notes.trim() || "-",
        active: form.active,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);

    closeModal();
  }

  return (
    <>
      <div className="space-y-6">
        <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Pairings</h2>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                Keep sire and dam combinations organized for breeder goals, notes,
                and future pairing outcome tools.
              </p>
            </div>
            <button
              type="button"
              onClick={openModal}
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
            >
              Add Pairing
            </button>
          </div>
        </section>

        <DataTable
          title="Breeder Pairings"
          description="Pairings structured for hatch planning, breeder goals, and future genetics workflows."
          columns={[
            { key: "name", label: "Pairing Name" },
            { key: "sire", label: "Sire" },
            { key: "dam", label: "Dam" },
            { key: "goals", label: "Goals" },
            { key: "status", label: "Status" },
            { key: "notes", label: "Notes" },
          ]}
          rows={rows}
        />
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#221c3f]/40 px-4 backdrop-blur-sm">
          <div className="soft-shadow w-full max-w-2xl rounded-[30px] border border-[color:var(--line)] bg-white p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight">Add Pairing</h3>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  Create a new breeder pairing and add it to the table immediately.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-2xl border border-[color:var(--line)] px-3 py-2 text-sm text-[color:var(--muted)] transition hover:bg-[#f8f7fe]"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
              <FormField
                label="Pairing Name"
                error={errors.name}
                input={
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="Blue Meadow Spring Pair"
                    className={inputClassName(errors.name)}
                  />
                }
              />

              <FormField
                label="Sire"
                error={errors.sireId}
                input={
                  <select
                    value={form.sireId}
                    onChange={(event) => updateField("sireId", event.target.value)}
                    className={inputClassName(errors.sireId)}
                  >
                    <option value="">Select sire</option>
                    {birds.filter((bird) => bird.sex === "Male").map((bird) => (
                      <option key={bird.id} value={bird.id}>
                        {bird.name} ({bird.bandNumber})
                      </option>
                    ))}
                  </select>
                }
              />

              <FormField
                label="Dam"
                error={errors.damId}
                input={
                  <select
                    value={form.damId}
                    onChange={(event) => updateField("damId", event.target.value)}
                    className={inputClassName(errors.damId)}
                  >
                    <option value="">Select dam</option>
                    {birds.filter((bird) => bird.sex === "Female").map((bird) => (
                      <option key={bird.id} value={bird.id}>
                        {bird.name} ({bird.bandNumber})
                      </option>
                    ))}
                  </select>
                }
              />

              <div className="sm:col-span-2">
                <FormField
                  label="Goals"
                  input={
                    <textarea
                      value={form.goals}
                      onChange={(event) => updateField("goals", event.target.value)}
                      rows={3}
                      placeholder="Improve shell color and temperament"
                      className={`${inputClassName()} resize-none`}
                    />
                  }
                />
              </div>

              <div className="sm:col-span-2">
                <FormField
                  label="Notes"
                  input={
                    <textarea
                      value={form.notes}
                      onChange={(event) => updateField("notes", event.target.value)}
                      rows={3}
                      placeholder="Optional breeder notes"
                      className={`${inputClassName()} resize-none`}
                    />
                  }
                />
              </div>

              <label className="sm:col-span-2 flex items-center gap-3 rounded-[22px] border border-[color:var(--line)] bg-[#fcfaff] px-4 py-3">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => updateField("active", event.target.checked)}
                  className="h-4 w-4 rounded border-[color:var(--line)] text-[color:var(--accent)]"
                />
                <span className="text-sm font-medium">Active pairing</span>
              </label>

              <div className="sm:col-span-2 flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-[#f8f7fe]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
                >
                  Save Pairing
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

function FormField({
  label,
  input,
  error,
}: {
  label: string;
  input: React.ReactNode;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
        {label}
      </span>
      {input}
      {error ? <p className="mt-2 text-sm text-[#b34b75]">{error}</p> : null}
    </label>
  );
}

function inputClassName(error?: string) {
  return `w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 ${
    error
      ? "border-[#d67aa0] focus:border-[#d67aa0] focus:ring-[#f3d4e1]"
      : "border-[color:var(--line)] focus:border-[color:var(--accent)] focus:ring-[color:var(--accent-soft)]"
  }`;
}
