"use client";

import { FormEvent, type ReactNode, useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import type { BirdSex, ChickStatus } from "@/lib/types";

type ChickRow = {
  id: string;
  bandNumber: string;
  hatchDate: string;
  flockId: string;
  flockName: string;
  hatchGroupId: string | null;
  hatchGroupName: string;
  status: ChickStatus;
  sex: BirdSex;
  color: string;
  observedTraits: string[];
  notes: string;
  photoUrl: string;
  createdAt: string;
};

type FlockOption = {
  id: string;
  name: string;
};

type HatchGroupOption = {
  id: string;
  name: string;
};

type ChicksResponse = {
  chicks: ChickRow[];
  flocks: FlockOption[];
  hatchGroups: HatchGroupOption[];
};

type FormState = {
  bandNumber: string;
  hatchDate: string;
  flockId: string;
  hatchGroupId: string;
  status: ChickStatus;
  sex: BirdSex;
  color: string;
  observedTraits: string;
  notes: string;
};

const emptyForm: FormState = {
  bandNumber: "",
  hatchDate: "",
  flockId: "",
  hatchGroupId: "",
  status: "Available",
  sex: "Unknown",
  color: "",
  observedTraits: "",
  notes: "",
};

const statusOptions: Array<ChickStatus | "All Statuses"> = [
  "All Statuses",
  "Available",
  "Reserved",
  "Sold",
  "Holdback",
];

const sexOptions: BirdSex[] = ["Male", "Female", "Unknown"];

export default function ChicksPage() {
  const [chicks, setChicks] = useState<ChickRow[]>([]);
  const [flocks, setFlocks] = useState<FlockOption[]>([]);
  const [hatchGroups, setHatchGroups] = useState<HatchGroupOption[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ChickStatus | "All Statuses">(
    "All Statuses",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    void loadChicks();
  }, []);

  async function loadChicks() {
    try {
      setRequestError("");
      const response = await fetch("/api/chicks", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Failed to load chicks.");
      }

      const data = (await response.json()) as ChicksResponse;
      setChicks(data.chicks);
      setFlocks(data.flocks);
      setHatchGroups(data.hatchGroups);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Failed to load chicks.");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredChicks = chicks.filter((chick) => {
    const query = search.toLowerCase();
    const matchesSearch =
      chick.bandNumber.toLowerCase().includes(query) || chick.flockName.toLowerCase().includes(query);
    const matchesStatus = statusFilter === "All Statuses" || chick.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  function openModal() {
    setErrors({});
    setForm(emptyForm);
    setRequestError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setErrors({});
    setForm(emptyForm);
    setRequestError("");
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setRequestError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.bandNumber.trim()) nextErrors.bandNumber = "Band Number is required.";
    if (!form.hatchDate) nextErrors.hatchDate = "Hatch Date is required.";
    if (!form.flockId) nextErrors.flockId = "Flock is required.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      setIsSaving(true);
      setRequestError("");

      const response = await fetch("/api/chicks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bandNumber: form.bandNumber.trim(),
          hatchDate: form.hatchDate,
          flockId: form.flockId,
          hatchGroupId: form.hatchGroupId || undefined,
          status: form.status,
          sex: form.sex,
          color: form.color.trim(),
          observedTraits: splitTraits(form.observedTraits),
          notes: form.notes.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save chick.");
      }

      await loadChicks();
      closeModal();
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Failed to save chick.");
    } finally {
      setIsSaving(false);
    }
  }

  const rows = filteredChicks.map((chick) => ({
    bandNumber: chick.bandNumber,
    hatchDate: formatDate(chick.hatchDate),
    flock: chick.flockName || "Unassigned",
    hatchGroup: chick.hatchGroupName || "-",
    sex: chick.sex,
    color: chick.color || "-",
    observedTraits: chick.observedTraits.join(", ") || "-",
    status: chick.status,
    notes: chick.notes || "-",
  }));

  return (
    <>
      <div className="space-y-6">
        <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Chick Records</h2>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                Search band numbers, narrow by status, and track observed traits, sex, and color
                alongside each hatch record.
              </p>
            </div>
            <button
              type="button"
              onClick={openModal}
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
            >
              Add Chick
            </button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Search
              </span>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by band number or flock"
                className="w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Status
              </span>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as ChickStatus | "All Statuses")
                }
                className="w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {requestError ? <p className="mt-4 text-sm text-[#b34b75]">{requestError}</p> : null}
        </section>

        <DataTable
          title="Chicks"
          description={
            isLoading
              ? "Loading chicks..."
              : rows.length > 0
                ? "Band numbers, hatch dates, genetics clues, and current chick status."
                : "No chicks match the current search or filter."
          }
          columns={[
            { key: "bandNumber", label: "Band Number" },
            { key: "hatchDate", label: "Hatch Date" },
            { key: "flock", label: "Flock" },
            { key: "hatchGroup", label: "Hatch Group" },
            { key: "sex", label: "Sex" },
            { key: "color", label: "Color" },
            { key: "observedTraits", label: "Observed Traits" },
            { key: "status", label: "Status" },
            { key: "notes", label: "Notes" },
          ]}
          rows={rows}
          emptyState={{
            title: search || statusFilter !== "All Statuses" ? "No chicks match these filters" : "No chicks yet",
            description:
              search || statusFilter !== "All Statuses"
                ? "Try clearing your search or status filter to see more chick records."
                : "Add your first chick once you have a hatch to track.",
            actionLabel:
              search || statusFilter !== "All Statuses" ? undefined : "Add your first chick",
            onAction: search || statusFilter !== "All Statuses" ? undefined : openModal,
          }}
        />
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#221c3f]/40 px-4 backdrop-blur-sm">
          <div className="soft-shadow w-full max-w-3xl rounded-[30px] border border-[color:var(--line)] bg-white p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight">Add Chick</h3>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  Create a new chick record and store it in PostgreSQL immediately.
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
                label="Band Number"
                error={errors.bandNumber}
                required
                input={
                  <input
                    type="text"
                    value={form.bandNumber}
                    onChange={(event) => updateField("bandNumber", event.target.value)}
                    placeholder="CH-2045"
                    className={inputClassName(errors.bandNumber)}
                  />
                }
              />
              <FormField
                label="Hatch Date"
                error={errors.hatchDate}
                required
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
                label="Flock"
                error={errors.flockId}
                input={
                  <select
                    value={form.flockId}
                    onChange={(event) => updateField("flockId", event.target.value)}
                    className={inputClassName(errors.flockId)}
                  >
                    <option value="">Select flock</option>
                    {flocks.map((flock) => (
                      <option key={flock.id} value={flock.id}>
                        {flock.name}
                      </option>
                    ))}
                  </select>
                }
              />
              <FormField
                label="Hatch Group"
                input={
                  <select
                    value={form.hatchGroupId}
                    onChange={(event) => updateField("hatchGroupId", event.target.value)}
                    className={inputClassName()}
                  >
                    <option value="">Optional hatch group</option>
                    {hatchGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                }
              />
              <FormField
                label="Status"
                input={
                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateField("status", event.target.value as ChickStatus)
                    }
                    className={inputClassName()}
                  >
                    {statusOptions
                      .filter((option): option is ChickStatus => option !== "All Statuses")
                      .map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                  </select>
                }
              />
              <FormField
                label="Sex"
                input={
                  <select
                    value={form.sex}
                    onChange={(event) => updateField("sex", event.target.value as BirdSex)}
                    className={inputClassName()}
                  >
                    {sexOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                }
              />
              <FormField
                label="Color"
                input={
                  <input
                    type="text"
                    value={form.color}
                    onChange={(event) => updateField("color", event.target.value)}
                    placeholder="Blue Copper"
                    className={inputClassName()}
                  />
                }
              />
              <div className="sm:col-span-2">
                <FormField
                  label="Observed Traits"
                  input={
                    <input
                      type="text"
                      value={form.observedTraits}
                      onChange={(event) => updateField("observedTraits", event.target.value)}
                      placeholder="Blue Copper, Dark Legs"
                      className={inputClassName()}
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
                      placeholder="Optional hatch or reservation notes"
                      rows={4}
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
                  {isSaving ? "Saving..." : "Save Chick"}
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
  required,
}: {
  label: string;
  input: ReactNode;
  error?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
        {label} {required ? "*" : ""}
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

function splitTraits(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
