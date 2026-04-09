"use client";

import { FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";

type ReservationStatus = "Waiting" | "Matched" | "Completed" | "Cancelled";

type ReservationRow = {
  id: string;
  customerId: string;
  customerName: string;
  requestedSex: string;
  requestedBreed: string;
  requestedVariety: string;
  requestedColor: string;
  quantity: number;
  status: ReservationStatus;
  notes: string;
  createdAt: string;
};

type CustomerOption = {
  id: string;
  name: string;
};

type HatchGroupOption = {
  id: string;
  name: string;
  pairingName: string;
  breed: string;
  variety: string;
  producedTraitsSummary: string;
  availableChickCount: number;
};

type ChickOption = {
  id: string;
  bandNumber: string;
  flockId: string;
  flockName: string;
  breed: string;
  variety: string;
  hatchGroupId: string | null;
  hatchGroupName: string | null;
  sex: string;
  color: string;
  status: string;
};

type ReservationsResponse = {
  reservations: ReservationRow[];
  customers: CustomerOption[];
  hatchGroups: HatchGroupOption[];
  chicks: ChickOption[];
};

type ReservationForm = {
  customerId: string;
  requestedSex: string;
  requestedBreed: string;
  requestedVariety: string;
  requestedColor: string;
  quantity: string;
  status: ReservationStatus;
  notes: string;
};

type MatchSuggestion = {
  id: string;
  customerName: string;
  summary: string;
  suggestion: string;
  source: string;
};

const statusOptions: Array<ReservationStatus | "All Statuses"> = [
  "All Statuses",
  "Waiting",
  "Matched",
  "Completed",
  "Cancelled",
];

const emptyForm: ReservationForm = {
  customerId: "",
  requestedSex: "",
  requestedBreed: "",
  requestedVariety: "",
  requestedColor: "",
  quantity: "1",
  status: "Waiting",
  notes: "",
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [hatchGroups, setHatchGroups] = useState<HatchGroupOption[]>([]);
  const [chicks, setChicks] = useState<ChickOption[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "All Statuses">(
    "All Statuses",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<ReservationForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ReservationForm, string>>>({});
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    void loadReservations();
  }, []);

  async function loadReservations() {
    try {
      setRequestError("");
      const response = await fetch("/api/reservations", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Failed to load reservations.");
      }

      const data = (await response.json()) as ReservationsResponse;
      setReservations(data.reservations);
      setCustomers(data.customers);
      setHatchGroups(data.hatchGroups);
      setChicks(data.chicks);
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : "Failed to load reservations.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const filteredReservations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reservations.filter((reservation) => {
      const matchesSearch =
        !query ||
        reservation.customerName.toLowerCase().includes(query) ||
        reservation.requestedBreed.toLowerCase().includes(query) ||
        reservation.requestedVariety.toLowerCase().includes(query) ||
        reservation.requestedColor.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "All Statuses" || reservation.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reservations, search, statusFilter]);

  const matchSuggestions = useMemo<MatchSuggestion[]>(() => {
    return reservations
      .filter((reservation) => ["Waiting", "Matched"].includes(reservation.status))
      .map((reservation) => {
        const suggestedChick = [...chicks]
          .filter((chick) => chick.status === "Available")
          .map((chick) => ({
            chick,
            score: scoreChickMatch(reservation, chick),
          }))
          .filter((candidate) => candidate.score > 0)
          .sort((left, right) => right.score - left.score)[0]?.chick;

        if (suggestedChick) {
          return {
            id: reservation.id,
            customerName: reservation.customerName,
            summary: buildReservationSummary(reservation),
            suggestion: buildChickSuggestion(suggestedChick),
            source: "Available Chick",
          };
        }

        const suggestedHatchGroup = [...hatchGroups]
          .map((group) => ({
            group,
            score: scoreHatchGroupMatch(reservation, group),
          }))
          .filter((candidate) => candidate.score > 0)
          .sort((left, right) => right.score - left.score)[0]?.group;

        return {
          id: reservation.id,
          customerName: reservation.customerName,
          summary: buildReservationSummary(reservation),
          suggestion: suggestedHatchGroup
            ? buildHatchGroupSuggestion(suggestedHatchGroup)
            : "No current match suggestion",
          source: suggestedHatchGroup ? "Hatch Group" : "Backlog",
        };
      });
  }, [chicks, hatchGroups, reservations]);

  function updateField<K extends keyof ReservationForm>(key: K, value: ReservationForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setRequestError("");
  }

  function closePanel() {
    setIsOpen(false);
    setForm(emptyForm);
    setErrors({});
    setRequestError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Partial<Record<keyof ReservationForm, string>> = {};
    if (!form.customerId) nextErrors.customerId = "Customer is required.";
    if (!form.requestedBreed.trim()) nextErrors.requestedBreed = "Requested Breed is required.";
    if (!form.quantity || Number(form.quantity) <= 0) {
      nextErrors.quantity = "Quantity must be at least 1.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      setIsSaving(true);
      setRequestError("");

      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: form.customerId,
          requestedSex: form.requestedSex.trim(),
          requestedBreed: form.requestedBreed.trim(),
          requestedVariety: form.requestedVariety.trim(),
          requestedColor: form.requestedColor.trim(),
          quantity: Number(form.quantity),
          status: form.status,
          notes: form.notes.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save reservation.");
      }

      await loadReservations();
      closePanel();
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : "Failed to save reservation.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="space-y-6">
        <section className="soft-shadow rounded-[32px] border border-[color:var(--line)] bg-white/90 p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Demand Tracking
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">Reservations</h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
                Keep breeder demand organized with searchable requests, clean status tracking, and
                quick match suggestions from available chicks and current hatches.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
            >
              Add Reservation
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <MetricCard
              label="Open Requests"
              value={String(
                reservations.filter((reservation) =>
                  ["Waiting", "Matched"].includes(reservation.status),
                ).length,
              )}
            />
            <MetricCard
              label="Customers Waiting"
              value={String(
                new Set(
                  reservations
                    .filter((reservation) => reservation.status === "Waiting")
                    .map((reservation) => reservation.customerId),
                ).size,
              )}
            />
            <MetricCard
              label="Suggested Matches"
              value={String(matchSuggestions.filter((item) => item.source !== "Backlog").length)}
            />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Search
              </span>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Customer, breed, variety, or color"
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
                  setStatusFilter(event.target.value as ReservationStatus | "All Statuses")
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

        <section className="soft-shadow overflow-hidden rounded-[32px] border border-[color:var(--line)] bg-[color:var(--panel-strong)]">
          <div className="border-b border-[color:var(--line)] px-6 py-5">
            <h2 className="text-lg font-semibold tracking-tight">Reservation Queue</h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Customer demand organized for breeder planning, matching, and follow-up.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-[#f5f3fd]">
                <tr>
                  {[
                    "Customer",
                    "Requested Sex",
                    "Requested Breed",
                    "Requested Variety",
                    "Requested Color",
                    "Quantity",
                    "Status",
                    "Notes",
                  ].map((label) => (
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
                {filteredReservations.map((reservation) => (
                  <tr
                    key={reservation.id}
                    className="border-t border-[color:var(--line)] transition hover:bg-[#faf8ff]"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">
                      {reservation.customerName}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {reservation.requestedSex || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {reservation.requestedBreed}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {reservation.requestedVariety || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {reservation.requestedColor || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{reservation.quantity}</td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      <span className={statusBadgeClassName(reservation.status)}>
                        {reservation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm leading-7 text-[color:var(--muted)]">
                      {reservation.notes || "-"}
                    </td>
                  </tr>
                ))}
                {filteredReservations.length === 0 && !isLoading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-10"
                    >
                      <div className="mx-auto max-w-xl text-center">
                        <p className="text-base font-semibold tracking-tight text-foreground">
                          {search || statusFilter !== "All Statuses"
                            ? "No reservations match these filters"
                            : "No reservations yet"}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                          {search || statusFilter !== "All Statuses"
                            ? "Try adjusting the search or status filter to see more requests."
                            : "Capture your first reservation to track real demand against upcoming hatches."}
                        </p>
                        {!search && statusFilter === "All Statuses" ? (
                          <button
                            type="button"
                            onClick={() => setIsOpen(true)}
                            className="mt-5 inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
                          >
                            Add your first reservation
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ) : null}
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-sm text-[color:var(--muted)]"
                    >
                      Loading reservations...
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="soft-shadow rounded-[32px] border border-[color:var(--line)] bg-white/90 p-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Match Suggestions
            </p>
            <h2 className="text-xl font-semibold tracking-tight">
              Quick matches from current availability
            </h2>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {matchSuggestions.length > 0 ? matchSuggestions.map((suggestion) => (
              <article
                key={suggestion.id}
                className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-base font-semibold tracking-tight">{suggestion.customerName}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--teal)]">
                    {suggestion.source}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                  {suggestion.summary}
                </p>
                <div className="mt-4 rounded-[18px] bg-[#edf7f8] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                    Suggested matching chick or hatch group
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {suggestion.suggestion}
                  </p>
                </div>
              </article>
            )) : (
              <div className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-5 text-sm leading-7 text-[color:var(--muted)] lg:col-span-2 xl:col-span-3">
                Match suggestions will appear here once you have reservations and available chicks
                or hatch groups to compare.
              </div>
            )}
          </div>
        </section>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#221c3f]/35 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close reservation panel"
            onClick={closePanel}
            className="flex-1"
          />
          <aside className="soft-shadow h-full w-full max-w-xl border-l border-[color:var(--line)] bg-white px-6 py-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                  New Reservation
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Add Reservation</h2>
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
                label="Customer"
                error={errors.customerId}
                input={
                  <select
                    value={form.customerId}
                    onChange={(event) => updateField("customerId", event.target.value)}
                    className={inputClassName(errors.customerId)}
                  >
                    <option value="">Select customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                }
              />
              <FormField
                label="Requested Sex"
                input={
                  <input
                    type="text"
                    value={form.requestedSex}
                    onChange={(event) => updateField("requestedSex", event.target.value)}
                    placeholder="Female or Straight Run"
                    className={inputClassName()}
                  />
                }
              />
              <FormField
                label="Requested Breed"
                error={errors.requestedBreed}
                input={
                  <input
                    type="text"
                    value={form.requestedBreed}
                    onChange={(event) => updateField("requestedBreed", event.target.value)}
                    placeholder="Marans"
                    className={inputClassName(errors.requestedBreed)}
                  />
                }
              />
              <FormField
                label="Requested Variety"
                input={
                  <input
                    type="text"
                    value={form.requestedVariety}
                    onChange={(event) => updateField("requestedVariety", event.target.value)}
                    placeholder="Blue Copper"
                    className={inputClassName()}
                  />
                }
              />
              <FormField
                label="Requested Color"
                input={
                  <input
                    type="text"
                    value={form.requestedColor}
                    onChange={(event) => updateField("requestedColor", event.target.value)}
                    placeholder="Dark"
                    className={inputClassName()}
                  />
                }
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Quantity"
                  error={errors.quantity}
                  input={
                    <input
                      type="number"
                      min="1"
                      value={form.quantity}
                      onChange={(event) => updateField("quantity", event.target.value)}
                      className={inputClassName(errors.quantity)}
                    />
                  }
                />
                <FormField
                  label="Status"
                  input={
                    <select
                      value={form.status}
                      onChange={(event) =>
                        updateField("status", event.target.value as ReservationStatus)
                      }
                      className={inputClassName()}
                    >
                      {statusOptions
                        .filter((option): option is ReservationStatus => option !== "All Statuses")
                        .map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                    </select>
                  }
                />
              </div>
              <FormField
                label="Notes"
                input={
                  <textarea
                    value={form.notes}
                    onChange={(event) => updateField("notes", event.target.value)}
                    rows={6}
                    placeholder="Optional breeder notes, timing requests, or customer preferences"
                    className={`${inputClassName()} resize-none`}
                  />
                }
              />

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? "Saving..." : "Save Reservation"}
              </button>
            </form>
          </aside>
        </div>
      ) : null}
    </>
  );
}

function buildReservationSummary(reservation: ReservationRow) {
  const parts = [
    `${reservation.quantity} ${reservation.requestedBreed}`,
    reservation.requestedVariety ? reservation.requestedVariety : null,
    reservation.requestedSex ? `for ${reservation.requestedSex}` : null,
    reservation.requestedColor ? `color preference ${reservation.requestedColor}` : null,
  ].filter(Boolean);

  return parts.join(", ");
}

function buildChickSuggestion(chick: ChickOption) {
  const identity = chick.bandNumber || "Unbanded chick";
  const details = [chick.color || null, chick.sex || null].filter(Boolean).join(" · ");

  return `${identity}${details ? ` · ${details}` : ""} from ${chick.flockName}`;
}

function buildHatchGroupSuggestion(group: HatchGroupOption) {
  const context = [group.breed || null, group.variety || null].filter(Boolean).join(" · ");
  const availabilityLabel =
    group.availableChickCount > 0 ? `${group.availableChickCount} chicks available` : "upcoming";

  return `${group.name}${context ? ` · ${context}` : ""} (${availabilityLabel})`;
}

function scoreChickMatch(reservation: ReservationRow, chick: ChickOption) {
  let score = 0;

  if (matchesRequestValue(reservation.requestedBreed, chick.breed)) {
    score += 5;
  }

  if (matchesRequestValue(reservation.requestedVariety, chick.variety)) {
    score += 4;
  }

  if (matchesRequestValue(reservation.requestedColor, chick.color)) {
    score += 3;
  }

  if (matchesSexPreference(reservation.requestedSex, chick.sex)) {
    score += 2;
  }

  return score;
}

function scoreHatchGroupMatch(reservation: ReservationRow, group: HatchGroupOption) {
  let score = 0;

  if (matchesRequestValue(reservation.requestedBreed, group.breed)) {
    score += 5;
  }

  if (matchesRequestValue(reservation.requestedVariety, group.variety)) {
    score += 4;
  }

  if (
    matchesRequestValue(reservation.requestedColor, group.producedTraitsSummary) ||
    matchesRequestValue(reservation.requestedColor, group.name)
  ) {
    score += 2;
  }

  if (group.availableChickCount > 0) {
    score += 1;
  }

  return score;
}

function matchesRequestValue(requested: string, actual: string) {
  const requestedValue = requested.trim().toLowerCase();
  const actualValue = actual.trim().toLowerCase();

  if (!requestedValue || !actualValue) {
    return false;
  }

  return actualValue.includes(requestedValue) || requestedValue.includes(actualValue);
}

function matchesSexPreference(requestedSex: string, chickSex: string) {
  const requested = requestedSex.trim().toLowerCase();
  const actual = chickSex.trim().toLowerCase();

  if (!requested) {
    return false;
  }

  if (requested.includes("no preference") || requested.includes("straight run")) {
    return true;
  }

  if (!actual) {
    return false;
  }

  return actual.includes(requested) || requested.includes(actual);
}

function MetricCard({ label, value }: { label: string; value: string }) {
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

function statusBadgeClassName(status: ReservationStatus) {
  if (status === "Completed") {
    return "rounded-full bg-[#edf7f8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--teal)]";
  }

  if (status === "Cancelled") {
    return "rounded-full bg-[#f9e7ef] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#b34b75]";
  }

  return "rounded-full bg-[#ece7fb] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]";
}
