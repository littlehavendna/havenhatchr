"use client";

import { FormEvent, useState } from "react";
import { DataTable } from "@/components/data-table";
import {
  chicks,
  customers,
  flocks,
  hatchGroups,
  reservations as starterReservations,
} from "@/lib/mock-data";
import type { Reservation } from "@/lib/types";

type ReservationStatus = Reservation["status"];

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
  const [reservations, setReservations] = useState<Reservation[]>(starterReservations);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "All Statuses">(
    "All Statuses",
  );
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<ReservationForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ReservationForm, string>>>(
    {},
  );

  const filteredReservations = reservations.filter((reservation) => {
    const customerName =
      customers.find((customer) => customer.id === reservation.customerId)?.name.toLowerCase() ??
      "";
    const query = search.toLowerCase();

    const matchesSearch =
      customerName.includes(query) ||
      reservation.requestedBreed.toLowerCase().includes(query) ||
      reservation.requestedVariety.toLowerCase().includes(query) ||
      reservation.requestedColor.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "All Statuses" || reservation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const rows = filteredReservations.map((reservation) => ({
    customer:
      customers.find((customer) => customer.id === reservation.customerId)?.name ?? "Unknown",
    requestedSex: reservation.requestedSex,
    requestedBreed: reservation.requestedBreed,
    requestedVariety: reservation.requestedVariety,
    requestedColor: reservation.requestedColor,
    quantity: String(reservation.quantity),
    status: reservation.status,
    notes: reservation.notes,
  }));

  const matchSuggestions = reservations
    .filter((reservation) => ["Waiting", "Matched"].includes(reservation.status))
    .map((reservation) => {
      const customerName =
        customers.find((customer) => customer.id === reservation.customerId)?.name ?? "Unknown";

      const suggestedChick = chicks.find((chick) => {
        const flock = flocks.find((item) => item.id === chick.flockId);

        if (chick.status !== "Available") return false;

        return (
          flock?.breed.toLowerCase().includes(reservation.requestedBreed.toLowerCase()) ||
          flock?.variety.toLowerCase().includes(reservation.requestedVariety.toLowerCase()) ||
          chick.color.toLowerCase().includes(reservation.requestedColor.toLowerCase())
        );
      });

      const suggestedHatchGroup = suggestedChick
        ? hatchGroups.find((group) => group.id === suggestedChick.hatchGroupId)
        : undefined;

      return {
        id: reservation.id,
        customerName,
        summary: `${reservation.quantity} ${reservation.requestedVariety} ${reservation.requestedBreed} (${reservation.requestedSex})`,
        match: suggestedChick
          ? `${suggestedChick.bandNumber} from ${flocks.find((flock) => flock.id === suggestedChick.flockId)?.name ?? "Unknown flock"}`
          : suggestedHatchGroup?.name ?? "No current match suggestion",
      };
    });

  function updateField<K extends keyof ReservationForm>(
    key: K,
    value: ReservationForm[K],
  ) {
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

    setReservations((current) => [
      {
        id: `reservation_${crypto.randomUUID()}`,
        customerId: form.customerId,
        requestedSex: form.requestedSex.trim() || "No preference",
        requestedBreed: form.requestedBreed.trim(),
        requestedVariety: form.requestedVariety.trim() || "Any",
        requestedColor: form.requestedColor.trim() || "Any",
        quantity: Number(form.quantity),
        status: form.status,
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
              <h2 className="text-lg font-semibold tracking-tight">Reservations</h2>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                Manage chick requests, filter breeder demand, and review simple match suggestions.
              </p>
            </div>
            <button
              type="button"
              onClick={openModal}
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
            >
              Add Reservation
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
        </section>

        <DataTable
          title="Reservations"
          description="Customer demand organized for matching, customer communication, and breeder planning."
          columns={[
            { key: "customer", label: "Customer" },
            { key: "requestedSex", label: "Requested Sex" },
            { key: "requestedBreed", label: "Requested Breed" },
            { key: "requestedVariety", label: "Requested Variety" },
            { key: "requestedColor", label: "Requested Color" },
            { key: "quantity", label: "Quantity" },
            { key: "status", label: "Status" },
            { key: "notes", label: "Notes" },
          ]}
          rows={rows}
        />

        <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
          <h3 className="text-lg font-semibold tracking-tight">Match Suggestions</h3>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Simple placeholder matching based on available chicks and flock details.
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {matchSuggestions.map((suggestion) => (
              <article
                key={suggestion.id}
                className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfaff] p-4"
              >
                <p className="text-base font-semibold tracking-tight">{suggestion.customerName}</p>
                <p className="mt-2 text-sm text-[color:var(--muted)]">{suggestion.summary}</p>
                <p className="mt-3 text-sm font-medium text-[color:var(--teal)]">
                  Suggested matching chick or hatch group: {suggestion.match}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#221c3f]/40 px-4 backdrop-blur-sm">
          <div className="soft-shadow w-full max-w-3xl rounded-[30px] border border-[color:var(--line)] bg-white p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight">Add Reservation</h3>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  Create a new breeder reservation and add it to the table immediately.
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
                      .filter(
                        (option): option is ReservationStatus => option !== "All Statuses",
                      )
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
                      rows={4}
                      placeholder="Optional reservation notes"
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
                  Save Reservation
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
