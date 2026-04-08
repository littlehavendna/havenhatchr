"use client";

import { FormEvent, type ReactNode, useState } from "react";
import { traits as starterTraits } from "@/lib/mock-data";
import type { Trait } from "@/lib/types";

type TraitForm = {
  name: string;
  category: string;
  description: string;
};

const emptyForm: TraitForm = {
  name: "",
  category: "",
  description: "",
};

export default function TraitsPage() {
  const [traits, setTraits] = useState<Trait[]>(starterTraits);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<TraitForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof TraitForm, string>>>({});

  const categories = Array.from(new Set(traits.map((trait) => trait.category)));

  function updateField<K extends keyof TraitForm>(key: K, value: TraitForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function closePanel() {
    setIsOpen(false);
    setForm(emptyForm);
    setErrors({});
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Partial<Record<keyof TraitForm, string>> = {};
    if (!form.name.trim()) nextErrors.name = "Trait Name is required.";
    if (!form.category.trim()) nextErrors.category = "Category is required.";
    if (!form.description.trim()) nextErrors.description = "Description is required.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setTraits((current) => [
      {
        id: `trait_${crypto.randomUUID()}`,
        name: form.name.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
      },
      ...current,
    ]);

    closePanel();
  }

  return (
    <>
      <div className="space-y-6">
        <section className="soft-shadow rounded-[32px] border border-[color:var(--line)] bg-white/90 p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Genetics Vocabulary
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">Traits</h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
                Keep one breeder-facing trait library for bird profiles, genetics filters,
                project goals, and hatch outcome notes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
            >
              Add Trait
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <StatPill label="Tracked Traits" value={String(traits.length)} />
            <StatPill label="Categories" value={String(categories.length)} />
            <StatPill label="Newest Focus" value={traits[0]?.category ?? "Unassigned"} />
          </div>
        </section>

        <section className="soft-shadow overflow-hidden rounded-[32px] border border-[color:var(--line)] bg-[color:var(--panel-strong)]">
          <div className="border-b border-[color:var(--line)] px-6 py-5">
            <h2 className="text-lg font-semibold tracking-tight">Trait Library</h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Shared definitions for breeder notes, project planning, and genetics tracking.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-[#f5f3fd]">
                <tr>
                  {["Trait Name", "Category", "Description"].map((label) => (
                    <th
                      key={label}
                      className="px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {traits.map((trait) => (
                  <tr
                    key={trait.id}
                    className="border-t border-[color:var(--line)] transition hover:bg-[#faf8ff]"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">
                      {trait.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      <span className="rounded-full bg-[#ece7fb] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
                        {trait.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm leading-7 text-[color:var(--muted)]">
                      {trait.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#221c3f]/35 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close trait panel"
            onClick={closePanel}
            className="flex-1"
          />
          <aside className="soft-shadow h-full w-full max-w-xl border-l border-[color:var(--line)] bg-white px-6 py-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                  New Trait
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Add Trait</h2>
              </div>
              <button
                type="button"
                onClick={closePanel}
                className="rounded-2xl border border-[color:var(--line)] px-3 py-2 text-sm text-[color:var(--muted)] transition hover:bg-[#f8f7fe]"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <FormField
                label="Trait Name"
                error={errors.name}
                input={
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    placeholder="Olive Shell Depth"
                    className={inputClassName(errors.name)}
                  />
                }
              />
              <FormField
                label="Category"
                error={errors.category}
                input={
                  <input
                    type="text"
                    value={form.category}
                    onChange={(event) => updateField("category", event.target.value)}
                    placeholder="Shell Color"
                    className={inputClassName(errors.category)}
                  />
                }
              />
              <FormField
                label="Description"
                error={errors.description}
                input={
                  <textarea
                    value={form.description}
                    onChange={(event) => updateField("description", event.target.value)}
                    rows={6}
                    placeholder="Describe how breeders track, select, or use this trait."
                    className={`${inputClassName(errors.description)} resize-none`}
                  />
                }
              />

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
              >
                Save Trait
              </button>
            </form>
          </aside>
        </div>
      ) : null}
    </>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold tracking-tight">{value}</p>
    </div>
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
