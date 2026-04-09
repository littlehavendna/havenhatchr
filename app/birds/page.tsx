"use client";

import { FormEvent, type ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { BirdSex, BirdStatus } from "@/lib/types";

type BirdRow = {
  id: string;
  name: string;
  bandNumber: string;
  sex: BirdSex;
  breed: string;
  variety: string;
  color: string;
  genetics: string;
  flockId: string;
  flockName: string;
  status: BirdStatus;
  notes: string;
  photoUrl: string;
  visualTraits: string[];
  carriedTraits: string[];
  genotypeNotes: string;
  projectTags: string[];
  createdAt: string;
};

type FlockOption = {
  id: string;
  name: string;
  breed: string;
  variety: string;
};

type BirdsResponse = {
  birds: BirdRow[];
  flocks: FlockOption[];
};

type BirdForm = {
  name: string;
  bandNumber: string;
  sex: BirdSex;
  breed: string;
  variety: string;
  color: string;
  flockId: string;
  status: BirdStatus;
  notes: string;
};

const sexOptions: BirdSex[] = ["Male", "Female", "Unknown"];
const statusOptions: BirdStatus[] = ["Active", "Holdback", "Retired", "Sold"];

const emptyForm: BirdForm = {
  name: "",
  bandNumber: "",
  sex: "Unknown",
  breed: "",
  variety: "",
  color: "",
  flockId: "",
  status: "Active",
  notes: "",
};

export default function BirdsPage() {
  const router = useRouter();
  const [birds, setBirds] = useState<BirdRow[]>([]);
  const [flocks, setFlocks] = useState<FlockOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<BirdForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof BirdForm, string>>>({});
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    void loadBirds();
  }, []);

  async function loadBirds() {
    try {
      setRequestError("");
      const response = await fetch("/api/birds", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Failed to load birds.");
      }

      const data = (await response.json()) as BirdsResponse;
      setBirds(data.birds);
      setFlocks(data.flocks);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Failed to load birds.");
    } finally {
      setIsLoading(false);
    }
  }

  function updateField<K extends keyof BirdForm>(key: K, value: BirdForm[K]) {
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

    const nextErrors: Partial<Record<keyof BirdForm, string>> = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.bandNumber.trim()) nextErrors.bandNumber = "Band Number is required.";
    if (!form.flockId) nextErrors.flockId = "Flock is required.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const selectedFlock = flocks.find((flock) => flock.id === form.flockId);

    try {
      setIsSaving(true);
      setRequestError("");

      const response = await fetch("/api/birds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          bandNumber: form.bandNumber.trim(),
          sex: form.sex,
          breed: form.breed.trim() || selectedFlock?.breed || "",
          variety: form.variety.trim() || selectedFlock?.variety || "",
          color: form.color.trim(),
          flockId: form.flockId,
          status: form.status,
          notes: form.notes.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save bird.");
      }

      await loadBirds();
      closeModal();
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Failed to save bird.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="space-y-6">
        <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Birds</h2>
              <p className="mt-1 max-w-2xl text-sm text-[color:var(--muted)]">
                Keep each breeder bird in a single record with flock placement, status, and
                profile links into pairings, hatch groups, notes, and offspring.
              </p>
            </div>
            <button
              type="button"
              onClick={openModal}
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
            >
              Add Bird
            </button>
          </div>
          {requestError ? <p className="mt-4 text-sm text-[#b34b75]">{requestError}</p> : null}
        </section>

        <section className="soft-shadow overflow-hidden rounded-[28px] border border-[color:var(--line)] bg-[color:var(--panel-strong)]">
          <div className="border-b border-[color:var(--line)] px-5 py-5 sm:px-6">
            <h2 className="text-lg font-semibold tracking-tight">Bird Directory</h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Click a bird to open its profile hub.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-[#f5f3fd]">
                <tr>
                  {[
                    "Name",
                    "Band Number",
                    "Sex",
                    "Breed",
                    "Variety",
                    "Color",
                    "Flock",
                    "Status",
                  ].map((label) => (
                    <th
                      key={label}
                      className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)] sm:px-6"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {birds.map((bird) => (
                  <tr
                    key={bird.id}
                    role="link"
                    tabIndex={0}
                    onClick={() => router.push(`/birds/${bird.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        router.push(`/birds/${bird.id}`);
                      }
                    }}
                    className="cursor-pointer border-t border-[color:var(--line)] transition hover:bg-[#f8f7fe] focus:bg-[#f8f7fe] focus:outline-none"
                  >
                    <td className="px-5 py-4 text-sm font-semibold text-foreground sm:px-6">
                      {bird.name}
                    </td>
                    <td className="px-5 py-4 text-sm text-foreground sm:px-6">
                      {bird.bandNumber}
                    </td>
                    <td className="px-5 py-4 text-sm text-foreground sm:px-6">{bird.sex}</td>
                    <td className="px-5 py-4 text-sm text-foreground sm:px-6">
                      {bird.breed || "-"}
                    </td>
                    <td className="px-5 py-4 text-sm text-foreground sm:px-6">
                      {bird.variety || "-"}
                    </td>
                    <td className="px-5 py-4 text-sm text-foreground sm:px-6">
                      {bird.color || "-"}
                    </td>
                    <td className="px-5 py-4 text-sm text-foreground sm:px-6">
                      {bird.flockName || "Unassigned"}
                    </td>
                    <td className="px-5 py-4 text-sm text-foreground sm:px-6">
                      <span className="rounded-full bg-[#ece7fb] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
                        {bird.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!isLoading && birds.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-8 text-center text-sm text-[color:var(--muted)] sm:px-6"
                    >
                      No birds found yet.
                    </td>
                  </tr>
                ) : null}
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-8 text-center text-sm text-[color:var(--muted)] sm:px-6"
                    >
                      Loading birds...
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#221c3f]/40 px-4 backdrop-blur-sm">
          <div className="soft-shadow w-full max-w-3xl rounded-[30px] border border-[color:var(--line)] bg-white p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight">Add Bird</h3>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  Add a breeder bird record and make it available in the directory immediately.
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
                label="Name"
                error={errors.name}
                input={
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="Atlas"
                    className={inputClassName(errors.name)}
                  />
                }
              />
              <FormField
                label="Band Number"
                error={errors.bandNumber}
                input={
                  <input
                    type="text"
                    value={form.bandNumber}
                    onChange={(event) => updateField("bandNumber", event.target.value)}
                    placeholder="B-401"
                    className={inputClassName(errors.bandNumber)}
                  />
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
                label="Breed"
                input={
                  <input
                    type="text"
                    value={form.breed}
                    onChange={(event) => updateField("breed", event.target.value)}
                    placeholder="Marans"
                    className={inputClassName()}
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
              <FormField
                label="Status"
                input={
                  <select
                    value={form.status}
                    onChange={(event) => updateField("status", event.target.value as BirdStatus)}
                    className={inputClassName()}
                  >
                    {statusOptions.map((option) => (
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
                      rows={4}
                      placeholder="Add breeder notes"
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
                  {isSaving ? "Saving..." : "Save Bird"}
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
