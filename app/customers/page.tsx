"use client";

import Link from "next/link";
import { FormEvent, type ReactNode, useEffect, useState } from "react";

type CustomerRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  notes: string;
  status: string;
  createdAt: string;
  reservationCount: number;
  reservations: ReservationRow[];
};

type ReservationStatus = "Waiting" | "Matched" | "Completed" | "Cancelled";

type ReservationRow = {
  id: string;
  customerId: string;
  requestedSex: string;
  requestedBreed: string;
  requestedVariety: string;
  requestedColor: string;
  quantity: number;
  status: ReservationStatus;
  notes: string;
  createdAt: string;
};

type CustomerForm = {
  name: string;
  email: string;
  phone: string;
  location: string;
  notes: string;
  status: string;
};

const emptyForm: CustomerForm = {
  name: "",
  email: "",
  phone: "",
  location: "",
  notes: "",
  status: "Active",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isManagingList, setIsManagingList] = useState(false);
  const [isSavingList, setIsSavingList] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [form, setForm] = useState<CustomerForm>(emptyForm);
  const [listForm, setListForm] = useState({
    requestedSex: "",
    requestedBreed: "",
    requestedVariety: "",
    requestedColor: "",
    quantity: "1",
    status: "Waiting" as ReservationStatus,
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerForm, string>>>({});
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    void loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      setRequestError("");
      const response = await fetch("/api/customers", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Failed to load customers.");
      }

      const data = (await response.json()) as { customers: CustomerRow[] };
      setCustomers(data.customers);
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : "Failed to load customers.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function updateField<K extends keyof CustomerForm>(key: K, value: CustomerForm[K]) {
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

  function openListManager(customerId: string) {
    setSelectedCustomerId(customerId);
    setListForm({
      requestedSex: "",
      requestedBreed: "",
      requestedVariety: "",
      requestedColor: "",
      quantity: "1",
      status: "Waiting",
      notes: "",
    });
    setRequestError("");
    setIsManagingList(true);
  }

  function closeListManager() {
    setSelectedCustomerId("");
    setRequestError("");
    setIsManagingList(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Partial<Record<keyof CustomerForm, string>> = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      setIsSaving(true);
      setRequestError("");

      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          location: form.location.trim(),
          notes: form.notes.trim(),
          status: form.status.trim() || "Active",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save customer.");
      }

      await loadCustomers();
      closeModal();
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Failed to save customer.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddToList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedCustomerId) {
      return;
    }

    if (!listForm.requestedBreed.trim()) {
      setRequestError("Requested breed is required to add to a customer list.");
      return;
    }

    try {
      setIsSavingList(true);
      setRequestError("");

      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          requestedSex: listForm.requestedSex.trim(),
          requestedBreed: listForm.requestedBreed.trim(),
          requestedVariety: listForm.requestedVariety.trim(),
          requestedColor: listForm.requestedColor.trim(),
          quantity: Number(listForm.quantity) || 1,
          status: listForm.status,
          notes: listForm.notes.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add item to customer list.");
      }

      await loadCustomers();
      setListForm({
        requestedSex: "",
        requestedBreed: "",
        requestedVariety: "",
        requestedColor: "",
        quantity: "1",
        status: "Waiting",
        notes: "",
      });
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : "Failed to add item to customer list.",
      );
    } finally {
      setIsSavingList(false);
    }
  }

  async function updateReservationItem(
    reservation: ReservationRow,
    updates: Partial<ReservationRow>,
  ) {
    try {
      setIsSavingList(true);
      setRequestError("");

      const response = await fetch(`/api/reservations/${reservation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestedSex: updates.requestedSex ?? reservation.requestedSex,
          requestedBreed: updates.requestedBreed ?? reservation.requestedBreed,
          requestedVariety: updates.requestedVariety ?? reservation.requestedVariety,
          requestedColor: updates.requestedColor ?? reservation.requestedColor,
          quantity: updates.quantity ?? reservation.quantity,
          status: updates.status ?? reservation.status,
          notes: updates.notes ?? reservation.notes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update customer list item.");
      }

      await loadCustomers();
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : "Failed to update customer list item.",
      );
    } finally {
      setIsSavingList(false);
    }
  }

  async function removeReservationItem(reservationId: string) {
    try {
      setIsSavingList(true);
      setRequestError("");

      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove customer list item.");
      }

      await loadCustomers();
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : "Failed to remove customer list item.",
      );
    } finally {
      setIsSavingList(false);
    }
  }

  const selectedCustomer =
    customers.find((customer) => customer.id === selectedCustomerId) ?? null;

  return (
    <>
      <div className="space-y-6">
        <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Customers</h2>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                CRM-ready customer records mapped for reservations, notes, waitlists, and AI
                reply drafting.
              </p>
            </div>
            <button
              type="button"
              onClick={openModal}
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
            >
              Add Customer
            </button>
          </div>
        </section>

        <section className="soft-shadow overflow-hidden rounded-[28px] border border-[color:var(--line)] bg-[color:var(--panel-strong)]">
          <div className="border-b border-[color:var(--line)] px-5 py-5 sm:px-6">
            <h2 className="text-lg font-semibold tracking-tight">Customer Directory</h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Reservation-linked customer records now loading from PostgreSQL through Prisma.
            </p>
          </div>

          {requestError ? (
            <div className="border-b border-[color:var(--line)] bg-[#fff4f8] px-5 py-3 text-sm text-[#b34b75] sm:px-6">
              {requestError}
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-[#f5f3fd]">
                <tr>
                  {["Name", "Contact", "Location", "Reservations", "Notes", "Actions"].map(
                    (label) => (
                      <th
                        key={label}
                        className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)] sm:px-6"
                      >
                        {label}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-t border-[color:var(--line)] transition hover:bg-[#f8f7fe]"
                  >
                    <td className="px-5 py-4 text-sm font-semibold text-foreground sm:px-6">
                      {customer.name}
                    </td>
                    <td className="px-5 py-4 text-sm text-foreground sm:px-6">
                      <div>
                        <p>{customer.email || "-"}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[color:var(--muted)]">
                          {customer.phone || "-"}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-foreground sm:px-6">
                      {customer.location || "-"}
                    </td>
                    <td className="px-5 py-4 text-sm text-foreground sm:px-6">
                      {customer.reservationCount}
                    </td>
                    <td className="px-5 py-4 text-sm leading-7 text-[color:var(--muted)] sm:px-6">
                      {customer.notes}
                    </td>
                    <td className="px-5 py-4 text-sm text-foreground sm:px-6">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openListManager(customer.id)}
                          className="inline-flex rounded-full border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-[#f8f7fe]"
                        >
                          Manage List
                        </button>
                        <Link
                          href={`/ai?tool=reply&customerId=${customer.id}&customerName=${encodeURIComponent(
                            customer.name,
                          )}`}
                          className="inline-flex rounded-full border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--accent)] transition hover:bg-[#f8f7fe]"
                        >
                          Draft Reply
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && customers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 sm:px-6"
                    >
                      <div className="mx-auto max-w-xl text-center">
                        <p className="text-base font-semibold tracking-tight text-foreground">
                          No customers yet
                        </p>
                        <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                          Add your first customer when you are ready to track reservations,
                          follow-ups, and breeder orders.
                        </p>
                        <button
                          type="button"
                          onClick={openModal}
                          className="mt-5 inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
                        >
                          Add your first customer
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : null}
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-8 text-center text-sm text-[color:var(--muted)] sm:px-6"
                    >
                      Loading customers...
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
                <h3 className="text-2xl font-semibold tracking-tight">Add Customer</h3>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  Create a customer record and keep reservations, follow-ups, and orders organized.
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
                    placeholder="Jordan Avery"
                    className={inputClassName(errors.name)}
                  />
                }
              />
              <FormField
                label="Email"
                error={errors.email}
                input={
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    placeholder="jordan@example.com"
                    className={inputClassName(errors.email)}
                  />
                }
              />
              <FormField
                label="Phone"
                input={
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    placeholder="(555) 321-9088"
                    className={inputClassName()}
                  />
                }
              />
              <FormField
                label="Location"
                input={
                  <input
                    type="text"
                    value={form.location}
                    onChange={(event) => updateField("location", event.target.value)}
                    placeholder="Raleigh, NC"
                    className={inputClassName()}
                  />
                }
              />
              <FormField
                label="Status"
                input={
                  <select
                    value={form.status}
                    onChange={(event) => updateField("status", event.target.value)}
                    className={inputClassName()}
                  >
                    <option value="Active">Active</option>
                    <option value="Lead">Lead</option>
                    <option value="Archived">Archived</option>
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
                      placeholder="Reservation preferences, pickup timing, or contact notes"
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
                  {isSaving ? "Saving..." : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isManagingList && selectedCustomer ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#221c3f]/35 backdrop-blur-sm">
          <button type="button" onClick={closeListManager} className="flex-1" />
          <aside className="soft-shadow h-full w-full max-w-2xl overflow-y-auto border-l border-[color:var(--line)] bg-white px-6 py-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                  Customer List
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                  {selectedCustomer.name}
                </h3>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  Add requests, subtract quantity, update status, or remove items from this customer&apos;s list.
                </p>
              </div>
              <button
                type="button"
                onClick={closeListManager}
                className="rounded-2xl border border-[color:var(--line)] px-3 py-2 text-sm text-[color:var(--muted)] transition hover:bg-[#f8f7fe]"
              >
                Close
              </button>
            </div>

            {requestError ? <p className="mt-4 text-sm text-[#b34b75]">{requestError}</p> : null}

            <section className="mt-8">
              <h4 className="text-base font-semibold tracking-tight">Current List</h4>
              <div className="mt-4 space-y-3">
                {selectedCustomer.reservations.length > 0 ? (
                  selectedCustomer.reservations.map((reservation) => (
                    <article
                      key={reservation.id}
                      className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-4"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-base font-semibold text-foreground">
                            {[
                              reservation.requestedBreed,
                              reservation.requestedVariety || null,
                              reservation.requestedColor || null,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                          <p className="mt-1 text-sm text-[color:var(--muted)]">
                            {reservation.requestedSex || "No sex preference"} · {reservation.status}
                          </p>
                          {reservation.notes ? (
                            <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                              {reservation.notes}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={isSavingList || reservation.quantity <= 1}
                            onClick={() =>
                              updateReservationItem(reservation, {
                                quantity: Math.max(1, reservation.quantity - 1),
                              })
                            }
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--line)] bg-white text-lg font-semibold text-foreground transition hover:bg-[#f8f7fe] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            -
                          </button>
                          <div className="inline-flex min-w-14 items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-foreground">
                            {reservation.quantity}
                          </div>
                          <button
                            type="button"
                            disabled={isSavingList}
                            onClick={() =>
                              updateReservationItem(reservation, {
                                quantity: reservation.quantity + 1,
                              })
                            }
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--line)] bg-white text-lg font-semibold text-foreground transition hover:bg-[#f8f7fe] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            +
                          </button>
                          <select
                            value={reservation.status}
                            disabled={isSavingList}
                            onChange={(event) =>
                              updateReservationItem(reservation, {
                                status: event.target.value as ReservationStatus,
                              })
                            }
                            className="rounded-full border border-[color:var(--line)] bg-white px-4 py-2 text-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
                          >
                            <option value="Waiting">Waiting</option>
                            <option value="Matched">Matched</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <button
                            type="button"
                            disabled={isSavingList}
                            onClick={() => removeReservationItem(reservation.id)}
                            className="inline-flex items-center justify-center rounded-full border border-[#e7c2d1] bg-white px-4 py-2 text-sm font-semibold text-[#b34b75] transition hover:bg-[#fff4f8] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-[color:var(--line)] bg-[#fcfbff] p-4 text-sm text-[color:var(--muted)]">
                    This customer does not have anything on their list yet.
                  </div>
                )}
              </div>
            </section>

            <section className="mt-8">
              <h4 className="text-base font-semibold tracking-tight">Add To List</h4>
              <form onSubmit={handleAddToList} className="mt-4 grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Requested Breed"
                  input={
                    <input
                      type="text"
                      value={listForm.requestedBreed}
                      onChange={(event) =>
                        setListForm((current) => ({
                          ...current,
                          requestedBreed: event.target.value,
                        }))
                      }
                      placeholder="Marans"
                      className={inputClassName()}
                    />
                  }
                />
                <FormField
                  label="Requested Variety"
                  input={
                    <input
                      type="text"
                      value={listForm.requestedVariety}
                      onChange={(event) =>
                        setListForm((current) => ({
                          ...current,
                          requestedVariety: event.target.value,
                        }))
                      }
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
                      value={listForm.requestedColor}
                      onChange={(event) =>
                        setListForm((current) => ({
                          ...current,
                          requestedColor: event.target.value,
                        }))
                      }
                      placeholder="Dark"
                      className={inputClassName()}
                    />
                  }
                />
                <FormField
                  label="Requested Sex"
                  input={
                    <input
                      type="text"
                      value={listForm.requestedSex}
                      onChange={(event) =>
                        setListForm((current) => ({
                          ...current,
                          requestedSex: event.target.value,
                        }))
                      }
                      placeholder="Female or Straight Run"
                      className={inputClassName()}
                    />
                  }
                />
                <FormField
                  label="Quantity"
                  input={
                    <input
                      type="number"
                      min="1"
                      value={listForm.quantity}
                      onChange={(event) =>
                        setListForm((current) => ({
                          ...current,
                          quantity: event.target.value,
                        }))
                      }
                      className={inputClassName()}
                    />
                  }
                />
                <FormField
                  label="Status"
                  input={
                    <select
                      value={listForm.status}
                      onChange={(event) =>
                        setListForm((current) => ({
                          ...current,
                          status: event.target.value as ReservationStatus,
                        }))
                      }
                      className={inputClassName()}
                    >
                      <option value="Waiting">Waiting</option>
                      <option value="Matched">Matched</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  }
                />
                <div className="sm:col-span-2">
                  <FormField
                    label="Notes"
                    input={
                      <textarea
                        value={listForm.notes}
                        onChange={(event) =>
                          setListForm((current) => ({
                            ...current,
                            notes: event.target.value,
                          }))
                        }
                        rows={4}
                        placeholder="Optional timing, pickup, or preference notes"
                        className={`${inputClassName()} resize-none`}
                      />
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={isSavingList}
                    className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSavingList ? "Saving..." : "Add To Customer List"}
                  </button>
                </div>
              </form>
            </section>
          </aside>
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
