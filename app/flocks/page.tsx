"use client";

import { FormEvent, type ReactNode, useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";

type FlockRow = {
  id: string;
  name: string;
  breed: string;
  variety: string;
  notes: string;
  active: boolean;
  createdAt: string;
};

type FlockForm = {
  name: string;
  breed: string;
  variety: string;
  notes: string;
  active: boolean;
};

const emptyForm: FlockForm = {
  name: "",
  breed: "",
  variety: "",
  notes: "",
  active: true,
};

export default function FlocksPage() {
  const [flocks, setFlocks] = useState<FlockRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<FlockForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FlockForm, string>>>({});
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    void loadFlocks();
  }, []);

  async function loadFlocks() {
    try {
      setRequestError("");
      const response = await fetch("/api/flocks", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Failed to load flocks.");
      }

      const data = (await response.json()) as { flocks: FlockRow[] };
      setFlocks(data.flocks);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Failed to load flocks.");
    } finally {
      setIsLoading(false);
    }
  }

  function updateField<K extends keyof FlockForm>(key: K, value: FlockForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setRequestError("");
  }

  function openModal() {
    setForm(emptyForm);
    setErrors({});
    setRequestError("");
    setIsOpen(true);
  }

  function closeModal() {
    setForm(emptyForm);
    setErrors({});
    setRequestError("");
    setIsOpen(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Partial<Record<keyof FlockForm, string>> = {};
    if (!form.name.trim()) nextErrors.name = "Flock Name is required.";
    if (!form.breed.trim()) nextErrors.breed = "Breed is required.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      setIsSaving(true);
      setRequestError("");

      const response = await fetch("/api/flocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          breed: form.breed.trim(),
          variety: form.variety.trim(),
          notes: form.notes.trim(),
          active: form.active,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save flock.");
      }

      await loadFlocks();
      closeModal();
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Failed to save flock.");
    } finally {
      setIsSaving(false);
    }
  }

  const rows = flocks.map((flock) => ({
    flockName: flock.name,
    breed: `${flock.breed} ${flock.variety}`.trim(),
    pairing: flock.active ? "Active" : "Inactive",
    notes: flock.notes,
  }));

  return (
    <>
      <div className="space-y-6">
        <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Flocks</h2>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                Breeding groups organized for pairing outcomes, hatch analysis, and genetics
                workflows, now backed by PostgreSQL.
              </p>
            </div>
            <button
              type="button"
              onClick={openModal}
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
            >
              Add Flock
            </button>
          </div>
          {requestError ? (
            <p className="mt-4 text-sm text-[#b34b75]">{requestError}</p>
          ) : null}
        </section>

        <DataTable
          title="Flocks"
          description={
            isLoading
              ? "Loading flocks..."
              : "Breeding groups organized for pairing, hatch analysis, and genetics workflows."
          }
          columns={[
            { key: "flockName", label: "Flock Name" },
            { key: "breed", label: "Breed" },
            { key: "pairing", label: "Pairing" },
            { key: "notes", label: "Notes" },
          ]}
          rows={rows}
          emptyState={{
            title: "No flocks yet",
            description:
              "Create your first flock to organize breeders, chicks, and hatch planning.",
            actionLabel: "Create your first flock",
            onAction: openModal,
          }}
        />
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#221c3f]/40 px-4 backdrop-blur-sm">
          <div className="soft-shadow w-full max-w-3xl rounded-[30px] border border-[color:var(--line)] bg-white p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight">Add Flock</h3>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  Create a flock record in the real database and keep the existing breeder
                  workflow intact.
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
                label="Flock Name"
                error={errors.name}
                input={
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="Blue Meadow"
                    className={inputClassName(errors.name)}
                  />
                }
              />
              <FormField
                label="Breed"
                error={errors.breed}
                input={
                  <input
                    type="text"
                    value={form.breed}
                    onChange={(event) => updateField("breed", event.target.value)}
                    placeholder="Marans"
                    className={inputClassName(errors.breed)}
                  />
                }
              />
              <FormField
                label="Variety"
                input={
                  <input
                    type="text"
                    value={form.variety}
                    onChange={(event) => updateField("variety", event.target.value)}
                    placeholder="Blue Copper"
                    className={inputClassName()}
                  />
                }
              />
              <label className="flex items-center gap-3 rounded-[22px] border border-[color:var(--line)] bg-[#fcfaff] px-4 py-3 sm:mt-7">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => updateField("active", event.target.checked)}
                  className="h-4 w-4 rounded border-[color:var(--line)] text-[color:var(--accent)]"
                />
                <span className="text-sm font-medium">Active flock</span>
              </label>
              <div className="sm:col-span-2">
                <FormField
                  label="Notes"
                  input={
                    <textarea
                      value={form.notes}
                      onChange={(event) => updateField("notes", event.target.value)}
                      rows={4}
                      placeholder="Breeder planning notes"
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
                  {isSaving ? "Saving..." : "Save Flock"}
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
