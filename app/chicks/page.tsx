"use client";

import { FormEvent, useState } from "react";
import { DataTable } from "@/components/data-table";
import { chicks as starterChicksData, flocks, hatchGroups } from "@/lib/mock-data";
import type { Chick, ChickStatus } from "@/lib/types";

type FormState = {
  bandNumber: string;
  hatchDate: string;
  flock: string;
  status: ChickStatus;
  notes: string;
};

const emptyForm: FormState = {
  bandNumber: "",
  hatchDate: "",
  flock: "",
  status: "Available",
  notes: "",
};

const statusOptions: Array<ChickStatus | "All Statuses"> = [
  "All Statuses",
  "Available",
  "Reserved",
  "Sold",
  "Holdback",
];

export default function ChicksPage() {
  const [chicks, setChicks] = useState<Chick[]>(starterChicksData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ChickStatus | "All Statuses">(
    "All Statuses",
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>(
    {},
  );

  const filteredChicks = chicks.filter((chick) => {
    const flockName =
      flocks.find((flock) => flock.id === chick.flockId)?.name.toLowerCase() ?? "";

    const matchesSearch =
      chick.bandNumber.toLowerCase().includes(search.toLowerCase()) ||
      flockName.includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All Statuses" || chick.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  function openModal() {
    setErrors({});
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setErrors({});
    setForm(emptyForm);
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Partial<Record<keyof FormState, string>> = {};

    if (!form.bandNumber.trim()) {
      nextErrors.bandNumber = "Band Number is required.";
    }

    if (!form.hatchDate) {
      nextErrors.hatchDate = "Hatch Date is required.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setChicks((current) => [
      {
        id: `chick_${crypto.randomUUID()}`,
        createdAt: new Date().toISOString(),
        flockId:
          flocks.find((flock) => flock.name === form.flock.trim())?.id ?? "flock_custom",
        hatchGroupId: "manual",
        bandNumber: form.bandNumber.trim(),
        hatchDate: form.hatchDate,
        status: form.status,
        sex: "Unknown",
        color: "Unspecified",
        notes: form.notes.trim() || "-",
        photoUrl: "",
      },
      ...current,
    ]);
    closeModal();
  }

  const rows = filteredChicks.map((chick) => ({
    bandNumber: chick.bandNumber,
    hatchDate: formatDate(chick.hatchDate),
    flock: flocks.find((flock) => flock.id === chick.flockId)?.name ?? "Unassigned",
    hatchGroup:
      hatchGroups.find((group) => group.id === chick.hatchGroupId)?.name ?? "-",
    status: chick.status,
    notes: chick.notes,
  }));

  return (
    <>
      <div className="space-y-6">
        <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Chick Records</h2>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                Search band numbers, narrow by status, and add new chicks to the
                current hatch list.
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
        </section>

        <DataTable
          title="Chicks"
          description={
            rows.length > 0
              ? "Band numbers, hatch dates, and current chick status."
              : "No chicks match the current search or filter."
          }
          columns={[
            { key: "bandNumber", label: "Band Number" },
            { key: "hatchDate", label: "Hatch Date" },
            { key: "flock", label: "Flock" },
            { key: "hatchGroup", label: "Hatch Group" },
            { key: "status", label: "Status" },
            { key: "notes", label: "Notes" },
          ]}
          rows={rows}
        />
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#221c3f]/40 px-4 backdrop-blur-sm">
          <div className="soft-shadow w-full max-w-2xl rounded-[30px] border border-[color:var(--line)] bg-white p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight">Add Chick</h3>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  Create a new chick record and add it to the table immediately.
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
                input={
                  <input
                    type="text"
                    value={form.flock}
                    onChange={(event) => updateField("flock", event.target.value)}
                    placeholder="Blue Meadow"
                    className={inputClassName()}
                  />
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
                  className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
                >
                  Save Chick
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
  input: React.ReactNode;
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
