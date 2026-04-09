"use client";

import { FormEvent, type ReactNode, useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { HATCH_BREED_OPTIONS, deriveIncubationDates, getHatchBreedRule } from "@/lib/hatch-groups";

type HatchGroupRow = {
  id: string;
  name: string;
  pairingId: string | null;
  pairingName: string;
  breedDesignation: string;
  setDate: string;
  lockdownDate: string;
  hatchDate: string;
  eggsSet: number;
  eggsHatched: number;
  producedTraitsSummary: string;
  notes: string;
  createdAt: string;
};

type PairingOption = {
  id: string;
  name: string;
  targetTraits: string[];
};

type BreedOption = {
  value: string;
  label: string;
  incubationDays: number;
  lockdownOffsetDays: number;
};

type HatchGroupsResponse = {
  hatchGroups: HatchGroupRow[];
  pairings: PairingOption[];
  breedOptions?: BreedOption[];
};

type HatchGroupForm = {
  id?: string;
  name: string;
  pairingId: string;
  breedDesignation: string;
  setDate: string;
  lockdownDate: string;
  hatchDate: string;
  eggsSet: string;
  eggsHatched: string;
  notes: string;
};

const emptyForm: HatchGroupForm = {
  name: "",
  pairingId: "",
  breedDesignation: "Chicken",
  setDate: "",
  lockdownDate: "",
  hatchDate: "",
  eggsSet: "",
  eggsHatched: "",
  notes: "",
};

export default function HatchGroupsPage() {
  const [hatchGroups, setHatchGroups] = useState<HatchGroupRow[]>([]);
  const [pairings, setPairings] = useState<PairingOption[]>([]);
  const [breedOptions, setBreedOptions] = useState<BreedOption[]>([...HATCH_BREED_OPTIONS]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<HatchGroupForm>(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof HatchGroupForm, string>>>({});
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    void loadHatchGroups();
  }, []);

  async function loadHatchGroups() {
    try {
      setRequestError("");
      const response = await fetch("/api/hatch-groups", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Failed to load hatch groups.");
      }

      const data = (await response.json()) as HatchGroupsResponse;
      setHatchGroups(data.hatchGroups);
      setPairings(data.pairings);
      setBreedOptions(data.breedOptions?.length ? data.breedOptions : [...HATCH_BREED_OPTIONS]);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Failed to load hatch groups.");
    } finally {
      setIsLoading(false);
    }
  }

  function updateField<K extends keyof HatchGroupForm>(key: K, value: HatchGroupForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setRequestError("");
  }

  function syncFromSetDate(setDate: string, designation: string) {
    const derived = deriveIncubationDates(setDate, designation);
    setForm((current) => ({
      ...current,
      setDate,
      hatchDate: derived.hatchDate,
      lockdownDate: derived.lockdownDate,
    }));
  }

  function syncFromHatchDate(hatchDate: string, designation: string) {
    const rule = getHatchBreedRule(designation);
    const lockdownDate = hatchDate
      ? new Date(new Date(`${hatchDate}T00:00:00`).getTime() - rule.lockdownOffsetDays * 86400000)
          .toISOString()
          .slice(0, 10)
      : "";

    setForm((current) => ({
      ...current,
      hatchDate,
      lockdownDate,
    }));
  }

  function openCreateModal() {
    setIsEditing(false);
    setForm(emptyForm);
    setErrors({});
    setRequestError("");
    setIsOpen(true);
  }

  function openEditModal(group: HatchGroupRow) {
    setIsEditing(true);
    setForm({
      id: group.id,
      name: group.name,
      pairingId: group.pairingId ?? "",
      breedDesignation: group.breedDesignation,
      setDate: group.setDate,
      lockdownDate: group.lockdownDate,
      hatchDate: group.hatchDate,
      eggsSet: String(group.eggsSet),
      eggsHatched: String(group.eggsHatched),
      notes: group.notes,
    });
    setErrors({});
    setRequestError("");
    setIsOpen(true);
  }

  function closeModal() {
    setForm(emptyForm);
    setErrors({});
    setRequestError("");
    setIsOpen(false);
    setIsEditing(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Partial<Record<keyof HatchGroupForm, string>> = {};
    if (!form.name.trim()) nextErrors.name = "Hatch Group Name is required.";
    if (!form.breedDesignation) nextErrors.breedDesignation = "Breed designation is required.";
    if (!form.setDate) nextErrors.setDate = "Set Date is required.";
    if (!form.lockdownDate) nextErrors.lockdownDate = "Lockdown Date is required.";
    if (!form.hatchDate) nextErrors.hatchDate = "Hatch Date is required.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const selectedPairing = pairings.find((pairing) => pairing.id === form.pairingId);
    const method = isEditing ? "PUT" : "POST";

    try {
      setIsSaving(true);
      setRequestError("");

      const response = await fetch("/api/hatch-groups", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id,
          name: form.name.trim(),
          pairingId: form.pairingId,
          breedDesignation: form.breedDesignation,
          setDate: form.setDate,
          lockdownDate: form.lockdownDate,
          hatchDate: form.hatchDate,
          eggsSet: Number(form.eggsSet) || 0,
          eggsHatched: Number(form.eggsHatched) || 0,
          producedTraitsSummary:
            selectedPairing && selectedPairing.targetTraits.length > 0
              ? `Expected traits: ${selectedPairing.targetTraits.join(", ")}`
              : "",
          notes: form.notes.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(isEditing ? "Failed to update hatch group." : "Failed to save hatch group.");
      }

      await loadHatchGroups();
      closeModal();
    } catch (error) {
      setRequestError(
        error instanceof Error
          ? error.message
          : isEditing
            ? "Failed to update hatch group."
            : "Failed to save hatch group.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const rows = hatchGroups.map((group) => ({
    id: group.id,
    name: group.name,
    designation: group.breedDesignation,
    pairing: group.pairingName,
    setDate: formatDate(group.setDate),
    lockdownDate: formatDate(group.lockdownDate),
    hatchDate: formatDate(group.hatchDate),
    eggsSet: String(group.eggsSet),
    eggsHatched: String(group.eggsHatched),
    producedTraits: group.producedTraitsSummary || "-",
    notes: group.notes || "-",
  }));

  return (
    <>
      <div className="space-y-6">
        <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Hatch Groups</h2>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                Track incubation by designation, auto-calculate lockdown and hatch timing, and
                still adjust hatch dates as needed. Pairing is optional for mixed-flock groups.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
            >
              Add Hatch Group
            </button>
          </div>
          {requestError ? <p className="mt-4 text-sm text-[#b34b75]">{requestError}</p> : null}
        </section>

        <DataTable
          title="Hatch Groups"
          description={
            isLoading
              ? "Loading hatch groups..."
              : "Hatch batches organized by designation, hatch timing, and incubation milestones."
          }
          columns={[
            { key: "name", label: "Hatch Group Name" },
            { key: "designation", label: "Designation" },
            { key: "pairing", label: "Pairing" },
            { key: "setDate", label: "Set Date" },
            { key: "lockdownDate", label: "Lockdown Date" },
            { key: "hatchDate", label: "Hatch Date" },
            { key: "eggsSet", label: "Eggs Set" },
            { key: "eggsHatched", label: "Eggs Hatched" },
          ]}
          rows={rows}
          renderActions={(row) => (
            <button
              type="button"
              onClick={() =>
                openEditModal(hatchGroups.find((group) => group.id === row.id) as HatchGroupRow)
              }
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--teal)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--teal)] transition hover:bg-[color:var(--teal-soft)]"
            >
              Edit
            </button>
          )}
          emptyState={{
            title: "No hatch groups yet",
            description:
              "Add your first hatch group to track incubation windows, lockdown, hatch rate, and outcomes.",
            actionLabel: "Add your first hatch group",
            onAction: openCreateModal,
          }}
        />
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#221c3f]/40 px-4 backdrop-blur-sm">
          <div className="soft-shadow max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[30px] border border-[color:var(--line)] bg-white p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight">
                  {isEditing ? "Edit Hatch Group" : "Add Hatch Group"}
                </h3>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  Choose the designation first, then the set date to auto-calculate lockdown and hatch timing. Pairing is optional.
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
                input={
                  <select
                    value={form.pairingId}
                    onChange={(event) => updateField("pairingId", event.target.value)}
                    className={inputClassName()}
                  >
                    <option value="">No specific pairing</option>
                    {pairings.map((pairing) => (
                      <option key={pairing.id} value={pairing.id}>
                        {pairing.name}
                      </option>
                    ))}
                  </select>
                }
              />
              <FormField
                label="Breed Designation"
                error={errors.breedDesignation}
                input={
                  <select
                    value={form.breedDesignation}
                    onChange={(event) => {
                      const breedDesignation = event.target.value;
                      setForm((current) => ({ ...current, breedDesignation }));
                      if (form.setDate) {
                        syncFromSetDate(form.setDate, breedDesignation);
                      }
                    }}
                    className={inputClassName(errors.breedDesignation)}
                  >
                    {breedOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                }
              />
              <FormField
                label="Incubation"
                input={
                  <div className="rounded-2xl border border-[color:var(--line)] bg-[#f8fbfb] px-4 py-3 text-sm text-[color:var(--muted)]">
                    {getHatchBreedRule(form.breedDesignation).incubationDays} day incubation with lockdown{" "}
                    {getHatchBreedRule(form.breedDesignation).lockdownOffsetDays} days before hatch
                  </div>
                }
              />
              <FormField
                label="Set Date"
                error={errors.setDate}
                input={
                  <input
                    type="date"
                    value={form.setDate}
                    onChange={(event) => syncFromSetDate(event.target.value, form.breedDesignation)}
                    className={inputClassName(errors.setDate)}
                  />
                }
              />
              <FormField
                label="Lockdown Date"
                error={errors.lockdownDate}
                input={
                  <input
                    type="date"
                    value={form.lockdownDate}
                    readOnly
                    className={`${inputClassName(errors.lockdownDate)} bg-[#f8fbfb] text-[color:var(--muted)]`}
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
                    onChange={(event) => syncFromHatchDate(event.target.value, form.breedDesignation)}
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
                  disabled={isSaving}
                  className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSaving ? (isEditing ? "Updating..." : "Saving...") : isEditing ? "Update Hatch Group" : "Save Hatch Group"}
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
  input: ReactNode;
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
