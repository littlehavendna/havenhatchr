"use client";

import { FormEvent, useState } from "react";
import { DataTable } from "@/components/data-table";
import { hatchGroups as starterHatchGroups, pairings } from "@/lib/mock-data";
import type { HatchGroup } from "@/lib/types";

type HatchGroupForm = {
  name: string;
  pairingId: string;
  setDate: string;
  hatchDate: string;
  eggsSet: string;
  eggsHatched: string;
  notes: string;
};

const emptyForm: HatchGroupForm = {
  name: "",
  pairingId: "",
  setDate: "",
  hatchDate: "",
  eggsSet: "",
  eggsHatched: "",
  notes: "",
};

export default function HatchGroupsPage() {
  const [hatchGroups, setHatchGroups] = useState<HatchGroup[]>(starterHatchGroups);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<HatchGroupForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof HatchGroupForm, string>>>(
    {},
  );

  const rows = hatchGroups.map((group) => ({
    name: group.name,
    pairing: pairings.find((pairing) => pairing.id === group.pairingId)?.name ?? "-",
    setDate: formatDate(group.setDate),
    hatchDate: formatDate(group.hatchDate),
    eggsSet: String(group.eggsSet),
    eggsHatched: String(group.eggsHatched),
    notes: group.notes,
  }));

  function updateField<K extends keyof HatchGroupForm>(key: K, value: HatchGroupForm[K]) {
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

    const nextErrors: Partial<Record<keyof HatchGroupForm, string>> = {};
    if (!form.name.trim()) nextErrors.name = "Hatch Group Name is required.";
    if (!form.pairingId) nextErrors.pairingId = "Pairing is required.";
    if (!form.setDate) nextErrors.setDate = "Set Date is required.";
    if (!form.hatchDate) nextErrors.hatchDate = "Hatch Date is required.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setHatchGroups((current) => [
      {
        id: `hatch_${crypto.randomUUID()}`,
        name: form.name.trim(),
        pairingId: form.pairingId,
        setDate: form.setDate,
        hatchDate: form.hatchDate,
        eggsSet: Number(form.eggsSet) || 0,
        eggsHatched: Number(form.eggsHatched) || 0,
        notes: form.notes.trim() || "-",
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
              <h2 className="text-lg font-semibold tracking-tight">Hatch Groups</h2>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                Track incubator groups, hatch timing, and outcomes tied to breeder pairings.
              </p>
            </div>
            <button
              type="button"
              onClick={openModal}
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
            >
              Add Hatch Group
            </button>
          </div>
        </section>

        <DataTable
          title="Hatch Groups"
          description="Hatch batches organized for incubator planning, results tracking, and future analytics."
          columns={[
            { key: "name", label: "Hatch Group Name" },
            { key: "pairing", label: "Pairing" },
            { key: "setDate", label: "Set Date" },
            { key: "hatchDate", label: "Hatch Date" },
            { key: "eggsSet", label: "Eggs Set" },
            { key: "eggsHatched", label: "Eggs Hatched" },
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
                <h3 className="text-2xl font-semibold tracking-tight">Add Hatch Group</h3>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  Create a new hatch group and add it to the table immediately.
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
                label="Hatch Group Name"
                error={errors.name}
                input={
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="Late April Olive Egger Hatch"
                    className={inputClassName(errors.name)}
                  />
                }
              />

              <FormField
                label="Pairing"
                error={errors.pairingId}
                input={
                  <select
                    value={form.pairingId}
                    onChange={(event) => updateField("pairingId", event.target.value)}
                    className={inputClassName(errors.pairingId)}
                  >
                    <option value="">Select pairing</option>
                    {pairings.map((pairing) => (
                      <option key={pairing.id} value={pairing.id}>
                        {pairing.name}
                      </option>
                    ))}
                  </select>
                }
              />

              <FormField
                label="Set Date"
                error={errors.setDate}
                input={
                  <input
                    type="date"
                    value={form.setDate}
                    onChange={(event) => updateField("setDate", event.target.value)}
                    className={inputClassName(errors.setDate)}
                  />
                }
              />

              <FormField
                label="Hatch Date"
                error={errors.hatchDate}
                input={
                  <input
                    type="date"
                    value={form.hatchDate}
                    onChange={(event) => updateField("hatchDate", event.target.value)}
                    className={inputClassName(errors.hatchDate)}
                  />
                }
              />

              <FormField
                label="Eggs Set"
                input={
                  <input
                    type="number"
                    min="0"
                    value={form.eggsSet}
                    onChange={(event) => updateField("eggsSet", event.target.value)}
                    placeholder="18"
                    className={inputClassName()}
                  />
                }
              />

              <FormField
                label="Eggs Hatched"
                input={
                  <input
                    type="number"
                    min="0"
                    value={form.eggsHatched}
                    onChange={(event) => updateField("eggsHatched", event.target.value)}
                    placeholder="14"
                    className={inputClassName()}
                  />
                }
              />

              <div className="sm:col-span-2">
                <FormField
                  label="Notes"
                  input={
                    <textarea
                      value={form.notes}
                      onChange={(event) => updateField("notes", event.target.value)}
                      rows={4}
                      placeholder="Optional hatch notes"
                      className={`${inputClassName()} resize-none`}
                    />
                  }
                />
              </div>

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
                  Save Hatch Group
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

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
