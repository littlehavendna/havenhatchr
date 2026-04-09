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
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<CustomerForm>(emptyForm);
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
                  {["Name", "Contact", "Location", "Reservations", "Notes", "AI Reply"].map(
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
                      <Link
                        href={`/ai?tool=reply&customerId=${customer.id}&customerName=${encodeURIComponent(
                          customer.name,
                        )}`}
                        className="inline-flex rounded-full border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--accent)] transition hover:bg-[#f8f7fe]"
                      >
                        Draft Reply
                      </Link>
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
                  Create a real customer record in PostgreSQL without changing the current UI
                  workflow.
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
