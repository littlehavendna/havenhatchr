"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, type ReactNode, useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { DNA_SEX_BULK_TIERS, getDnaSexBulkTier, getDnaSexUnitPriceCents } from "@/lib/dna";
import type { BirdSex, ChickDeathReason, ChickStatus } from "@/lib/types";

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
  dnaStatus: "None" | "Pending" | "Completed" | "Cancelled";
  createdAt: string;
  deathRecord: {
    id: string;
    deathDate: string;
    deathReason: ChickDeathReason;
    deathReasonLabel: string;
    notes: string;
  } | null;
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

type DnaConfig = {
  enabled: boolean;
  instructions: string;
  defaultContactName: string;
  defaultContactEmail: string;
  tests: Array<{
    code: string;
    label: string;
    description: string;
    priceCents: number;
  }>;
};

type DnaOrderForm = {
  contactName: string;
  contactEmail: string;
  includeBlueEgg: boolean;
  includeRecessiveWhite: boolean;
  notes: string;
};

type DeathForm = {
  chickId: string;
  bandNumber: string;
  deathDate: string;
  deathReason: ChickDeathReason;
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
  "Deceased",
];

const sexOptions: BirdSex[] = ["Male", "Female", "Unknown"];
const deathReasonOptions: Array<{ value: ChickDeathReason; label: string }> = [
  { value: "FailureToThrive", label: "Failure to thrive" },
  { value: "ShippedWeak", label: "Shipped weak" },
  { value: "SplayLeg", label: "Splay leg" },
  { value: "Injury", label: "Injury" },
  { value: "Predator", label: "Predator" },
  { value: "UnabsorbedYolk", label: "Unabsorbed yolk" },
  { value: "AssistedHatchComplications", label: "Assisted hatch complications" },
  { value: "Unknown", label: "Unknown" },
  { value: "Other", label: "Other" },
];

export default function ChicksPage() {
  const router = useRouter();
  const [chicks, setChicks] = useState<ChickRow[]>([]);
  const [flocks, setFlocks] = useState<FlockOption[]>([]);
  const [hatchGroups, setHatchGroups] = useState<HatchGroupOption[]>([]);
  const [dnaConfig, setDnaConfig] = useState<DnaConfig | null>(null);
  const [selectedDnaChickIds, setSelectedDnaChickIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ChickStatus | "All Statuses">(
    "All Statuses",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [dnaOrderForm, setDnaOrderForm] = useState<DnaOrderForm>({
    contactName: "",
    contactEmail: "",
    includeBlueEgg: false,
    includeRecessiveWhite: false,
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [requestError, setRequestError] = useState("");
  const [isDnaModalOpen, setIsDnaModalOpen] = useState(false);
  const [isCreatingDnaCheckout, setIsCreatingDnaCheckout] = useState(false);
  const [isDeathModalOpen, setIsDeathModalOpen] = useState(false);
  const [isLoggingDeath, setIsLoggingDeath] = useState(false);
  const [deathForm, setDeathForm] = useState<DeathForm>({
    chickId: "",
    bandNumber: "",
    deathDate: new Date().toISOString().slice(0, 10),
    deathReason: "Unknown",
    notes: "",
  });

  useEffect(() => {
    void loadChicks();
    void loadDnaConfig();
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
      setSelectedDnaChickIds((current) =>
        current.filter((chickId) => data.chicks.some((chick) => chick.id === chickId)),
      );
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Failed to load chicks.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadDnaConfig() {
    try {
      const response = await fetch("/api/dna-tests", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Failed to load DNA settings.");
      }

      const data = (await response.json()) as DnaConfig;
      setDnaConfig(data);
      setDnaOrderForm((current) => ({
        ...current,
        contactName: current.contactName || data.defaultContactName,
        contactEmail: current.contactEmail || data.defaultContactEmail,
      }));
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Failed to load DNA settings.");
    }
  }

  const filteredChicks = chicks.filter((chick) => {
    const query = search.toLowerCase();
    const matchesSearch =
      chick.bandNumber.toLowerCase().includes(query) || chick.flockName.toLowerCase().includes(query);
    const matchesStatus = statusFilter === "All Statuses" || chick.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const selectedDnaChicks = chicks.filter((chick) => selectedDnaChickIds.includes(chick.id));
  const dnaSexTest = dnaConfig?.tests.find((test) => test.code === "chicken_sex");
  const blueGeneTest = dnaConfig?.tests.find((test) => test.code === "chicken_blue_egg");
  const recessiveWhiteTest = dnaConfig?.tests.find((test) => test.code === "chicken_recessive_white");
  const dnaSexBulkTier = getDnaSexBulkTier(selectedDnaChickIds.length);
  const dnaSexUnitPrice = getDnaSexUnitPriceCents(selectedDnaChickIds.length);

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

  function toggleDnaSelection(chickId: string) {
    setSelectedDnaChickIds((current) =>
      current.includes(chickId)
        ? current.filter((id) => id !== chickId)
        : [...current, chickId],
    );
  }

  function openDnaModal() {
    if (selectedDnaChickIds.length === 0) {
      setRequestError("Select at least one chick before starting a DNA order.");
      return;
    }

    setDnaOrderForm((current) => ({
      ...current,
      contactName: current.contactName || dnaConfig?.defaultContactName || "",
      contactEmail: current.contactEmail || dnaConfig?.defaultContactEmail || "",
    }));
    setRequestError("");
    setIsDnaModalOpen(true);
  }

  function closeDnaModal() {
    setIsDnaModalOpen(false);
  }

  function openDeathModal(chick: ChickRow) {
    setDeathForm({
      chickId: chick.id,
      bandNumber: chick.bandNumber,
      deathDate: new Date().toISOString().slice(0, 10),
      deathReason: "Unknown",
      notes: "",
    });
    setRequestError("");
    setIsDeathModalOpen(true);
  }

  function closeDeathModal() {
    setIsDeathModalOpen(false);
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

  async function handleDnaRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      if (!dnaOrderForm.contactName.trim()) {
        throw new Error("Contact name is required.");
      }

      if (!dnaOrderForm.contactEmail.trim()) {
        throw new Error("Contact email is required.");
      }

      setIsCreatingDnaCheckout(true);
      setRequestError("");

      const response = await fetch("/api/dna-tests/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chickIds: selectedDnaChickIds,
          contactName: dnaOrderForm.contactName.trim(),
          contactEmail: dnaOrderForm.contactEmail.trim(),
          includeBlueEgg: dnaOrderForm.includeBlueEgg,
          includeRecessiveWhite: dnaOrderForm.includeRecessiveWhite,
          notes: dnaOrderForm.notes.trim(),
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        clientSecret?: string | null;
        error?: string;
        order?: {
          id: string;
        };
      };
      if (!response.ok) {
        throw new Error(payload.error || "Unable to request DNA test.");
      }

      closeDnaModal();
      if (payload.order?.id) {
        router.push(`/chicks/dna-checkout?orderId=${payload.order.id}`);
      }
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Unable to start DNA checkout.");
    } finally {
      setIsCreatingDnaCheckout(false);
    }
  }

  async function handleDeathSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsLoggingDeath(true);
      setRequestError("");

      const response = await fetch("/api/chicks/deaths", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chickId: deathForm.chickId,
          deathDate: deathForm.deathDate,
          deathReason: deathForm.deathReason,
          notes: deathForm.notes.trim(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Unable to log chick death.");
      }

      await loadChicks();
      closeDeathModal();
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Unable to log chick death.");
    } finally {
      setIsLoggingDeath(false);
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
    dnaStatus: chick.dnaStatus,
    deathReason: chick.deathRecord?.deathReasonLabel ?? "-",
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

        <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-[color:var(--panel-strong)] p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                DNA Orders
              </p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight">Select which chicks to DNA test</h3>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                Use the checkboxes in the chick list, then start one DNA order for a single bird or a batch.
              </p>
            </div>
            <button
              type="button"
              onClick={openDnaModal}
              disabled={!dnaConfig?.enabled || selectedDnaChickIds.length === 0}
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Start DNA Order ({selectedDnaChickIds.length})
            </button>
          </div>
          {!dnaConfig?.enabled ? (
            <p className="mt-4 text-sm text-[#9b4768]">
              DNA ordering is temporarily disabled in admin settings.
            </p>
          ) : null}
          {selectedDnaChicks.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedDnaChicks.map((chick) => (
                <span
                  key={chick.id}
                  className="rounded-full border border-[color:var(--line)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]"
                >
                  Sample #{selectedDnaChickIds.indexOf(chick.id) + 1} {chick.bandNumber}
                </span>
              ))}
            </div>
          ) : null}
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
            { key: "dnaStatus", label: "DNA Status" },
            { key: "deathReason", label: "Death Reason" },
            { key: "notes", label: "Notes" },
          ]}
          rows={rows}
          leadingLabel="DNA"
          renderCell={(row, column) => {
            if (column.key !== "bandNumber") {
              return row[column.key];
            }

            const chick = filteredChicks.find((entry) => entry.bandNumber === row.bandNumber);
            if (!chick) {
              return row.bandNumber;
            }

            return (
              <Link
                href={`/chicks/${chick.id}`}
                className="font-semibold text-[color:var(--accent)] underline-offset-4 transition hover:underline"
              >
                {row.bandNumber}
              </Link>
            );
          }}
          renderLeading={(row) => {
            const chick = filteredChicks.find((entry) => entry.bandNumber === row.bandNumber);
            if (!chick) return null;

            const isSelected = selectedDnaChickIds.includes(chick.id);
            return (
              <div className="flex flex-col items-start gap-2">
                <label className="inline-flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleDnaSelection(chick.id)}
                    disabled={!dnaConfig?.enabled}
                    aria-label={`Select ${chick.bandNumber} for DNA testing`}
                    className="h-4 w-4 rounded border-[color:var(--line)] text-[color:var(--accent)] focus:ring-[color:var(--accent-soft)]"
                  />
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                    {isSelected ? `Sample ${selectedDnaChickIds.indexOf(chick.id) + 1}` : "Select"}
                  </span>
                </label>
                <Link
                  href={`/chicks/${chick.id}`}
                  className="inline-flex rounded-full border border-[color:var(--line)] bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)] transition hover:bg-[#f8f7fe]"
                >
                  Edit Chick
                </Link>
              </div>
            );
          }}
          renderActions={(row) => {
            const chick = filteredChicks.find((entry) => entry.bandNumber === row.bandNumber);
            if (!chick) return null;

            return (
              <div className="flex gap-2">
                {chick.status !== "Deceased" ? (
                  <button
                    type="button"
                    onClick={() => openDeathModal(chick)}
                    className="inline-flex rounded-full border border-[#d9c9d2] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8d5d72] transition hover:bg-[#fff7f8]"
                  >
                    Log Loss
                  </button>
                ) : null}
                <Link
                  href={`/chicks/${chick.id}`}
                  className="inline-flex rounded-full border border-[color:var(--line)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)] transition hover:bg-[#f8f7fe]"
                >
                  Edit Chick
                </Link>
              </div>
            );
          }}
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
                      .filter((option) => option !== "Deceased")
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

      {isDnaModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#221c3f]/40 px-4 backdrop-blur-sm">
          <div className="soft-shadow w-full max-w-2xl rounded-[30px] border border-[color:var(--line)] bg-white p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight">Start DNA Order</h3>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  Little Haven DNA will receive the paid order automatically after checkout and email the customer from their lab portal.
                </p>
              </div>
              <button
                type="button"
                onClick={closeDnaModal}
                className="rounded-2xl border border-[color:var(--line)] px-3 py-2 text-sm text-[color:var(--muted)] transition hover:bg-[#f8f7fe]"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleDnaRequest} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Contact Name"
                  input={
                    <input
                      type="text"
                      value={dnaOrderForm.contactName}
                      onChange={(event) =>
                        setDnaOrderForm((current) => ({
                          ...current,
                          contactName: event.target.value,
                        }))
                      }
                      className={inputClassName()}
                    />
                  }
                />
                <FormField
                  label="Contact Email"
                  input={
                    <input
                      type="email"
                      value={dnaOrderForm.contactEmail}
                      onChange={(event) =>
                        setDnaOrderForm((current) => ({
                          ...current,
                          contactEmail: event.target.value,
                        }))
                      }
                      className={inputClassName()}
                    />
                  }
                />
              </div>
              <div className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  Selected Samples
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {selectedDnaChicks.map((chick) => (
                    <div
                      key={chick.id}
                      className="rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm"
                    >
                      <p className="font-semibold">
                        Sample #{selectedDnaChickIds.indexOf(chick.id) + 1} · {chick.bandNumber}
                      </p>
                      <p className="mt-1 text-[color:var(--muted)]">{chick.flockName}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  Tests
                </p>
                <div className="mt-3 space-y-3">
                  <label className="flex items-start gap-3 rounded-2xl border border-[color:var(--line)] bg-white px-4 py-4">
                    <input type="checkbox" checked readOnly className="mt-1 h-4 w-4 rounded border-[color:var(--line)] text-[color:var(--accent)]" />
                    <span>
                      <span className="block font-semibold">
                        DNA Sexing
                        {dnaSexTest ? ` · ${formatPrice(dnaSexUnitPrice)}/sample` : ""}
                      </span>
                      <span className="mt-1 block text-sm text-[color:var(--muted)]">
                        Included for every selected chick.
                        {dnaSexBulkTier
                          ? ` ${dnaSexBulkTier.label} is active for this order.`
                          : " Bulk pricing starts at 50 samples."}
                      </span>
                      <span className="mt-2 block text-xs text-[color:var(--muted)]">
                        {DNA_SEX_BULK_TIERS.map((tier) => `${tier.label}: ${formatPrice(tier.unitPriceCents)}/sample`).join(" · ")}
                      </span>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 rounded-2xl border border-[color:var(--line)] bg-white px-4 py-4">
                    <input
                      type="checkbox"
                      checked={dnaOrderForm.includeBlueEgg}
                      onChange={(event) =>
                        setDnaOrderForm((current) => ({
                          ...current,
                          includeBlueEgg: event.target.checked,
                        }))
                      }
                      className="mt-1 h-4 w-4 rounded border-[color:var(--line)] text-[color:var(--accent)]"
                    />
                    <span>
                      <span className="block font-semibold">
                        Add Blue Gene testing
                        {blueGeneTest ? ` · ${formatPrice(blueGeneTest.priceCents)}/sample` : ""}
                      </span>
                      <span className="mt-1 block text-sm text-[color:var(--muted)]">
                        Applies to every selected chick in this order.
                      </span>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 rounded-2xl border border-[color:var(--line)] bg-white px-4 py-4">
                    <input
                      type="checkbox"
                      checked={dnaOrderForm.includeRecessiveWhite}
                      onChange={(event) =>
                        setDnaOrderForm((current) => ({
                          ...current,
                          includeRecessiveWhite: event.target.checked,
                        }))
                      }
                      className="mt-1 h-4 w-4 rounded border-[color:var(--line)] text-[color:var(--accent)]"
                    />
                    <span>
                      <span className="block font-semibold">
                        Add Recessive White testing
                        {recessiveWhiteTest ? ` · ${formatPrice(recessiveWhiteTest.priceCents)}/sample` : ""}
                      </span>
                      <span className="mt-1 block text-sm text-[color:var(--muted)]">
                        Applies to every selected chick in this order.
                      </span>
                    </span>
                  </label>
                </div>
              </div>
              <FormField
                label="Optional notes for the lab"
                input={
                  <textarea
                    value={dnaOrderForm.notes}
                    onChange={(event) =>
                      setDnaOrderForm((current) => ({ ...current, notes: event.target.value }))
                    }
                    rows={4}
                    placeholder="Optional notes for the lab or customer-facing context"
                    className={`${inputClassName()} resize-none`}
                  />
                }
              />
              <button
                type="submit"
                disabled={isCreatingDnaCheckout}
                className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isCreatingDnaCheckout ? "Preparing Checkout..." : "Continue to Payment"}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {isDeathModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#221c3f]/40 px-4 backdrop-blur-sm">
          <div className="soft-shadow w-full max-w-xl rounded-[30px] border border-[color:var(--line)] bg-white p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight">Log Chick Loss</h3>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  Record the loss respectfully and keep the hatch reporting accurate.
                </p>
              </div>
              <button
                type="button"
                onClick={closeDeathModal}
                className="rounded-2xl border border-[color:var(--line)] px-3 py-2 text-sm text-[color:var(--muted)] transition hover:bg-[#f8f7fe]"
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleDeathSubmit} className="mt-6 space-y-4">
              <FormField
                label="Band Number"
                input={<input type="text" value={deathForm.bandNumber} readOnly className={`${inputClassName()} bg-[#f7f5ff] text-[color:var(--muted)]`} />}
              />
              <FormField
                label="Death Date"
                input={<input type="date" value={deathForm.deathDate} onChange={(event) => setDeathForm((current) => ({ ...current, deathDate: event.target.value }))} className={inputClassName()} />}
              />
              <FormField
                label="Reason"
                input={
                  <select value={deathForm.deathReason} onChange={(event) => setDeathForm((current) => ({ ...current, deathReason: event.target.value as ChickDeathReason }))} className={inputClassName()}>
                    {deathReasonOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                }
              />
              <FormField
                label="Notes"
                input={<textarea value={deathForm.notes} onChange={(event) => setDeathForm((current) => ({ ...current, notes: event.target.value }))} rows={4} className={`${inputClassName()} resize-none`} />}
              />
              <button
                type="submit"
                disabled={isLoggingDeath}
                className="inline-flex w-full items-center justify-center rounded-full bg-[#8d5d72] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#74485b] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoggingDeath ? "Saving..." : "Save Death Record"}
              </button>
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

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value / 100);
}

function splitTraits(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
