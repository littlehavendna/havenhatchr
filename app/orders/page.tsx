"use client";

import { FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/data-table";

type OrderStatus = "Pending" | "Scheduled" | "Completed" | "Cancelled";

type OrderRow = {
  id: string;
  customerId: string;
  customer: string;
  chickCount: number;
  assignedChicks: Array<{
    id: string;
    bandNumber: string;
    flockName: string;
    status: string;
  }>;
  status: string;
  pickupDate: string;
  total: number;
  notes: string;
  createdAt: string;
};

type CustomerOption = {
  id: string;
  name: string;
};

type ChickOption = {
  id: string;
  bandNumber: string;
  flockName: string;
  status: string;
  color: string;
  sex: string;
};

type OrdersResponse = {
  orders: OrderRow[];
  customers: CustomerOption[];
  chicks: ChickOption[];
};

type OrderForm = {
  customerId: string;
  status: OrderStatus;
  pickupDate: string;
  total: string;
  notes: string;
  chickIds: string[];
};

const statusOptions: OrderStatus[] = ["Pending", "Scheduled", "Completed", "Cancelled"];

const emptyForm: OrderForm = {
  customerId: "",
  status: "Pending",
  pickupDate: "",
  total: "",
  notes: "",
  chickIds: [],
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [chicks, setChicks] = useState<ChickOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<OrderForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof OrderForm, string>>>({});
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    void loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setRequestError("");
      const response = await fetch("/api/orders", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Failed to load orders.");
      }

      const data = (await response.json()) as OrdersResponse;
      setOrders(data.orders);
      setCustomers(data.customers);
      setChicks(data.chicks);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Failed to load orders.");
    } finally {
      setIsLoading(false);
    }
  }

  function updateField<K extends keyof OrderForm>(key: K, value: OrderForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setRequestError("");
  }

  function toggleChick(chickId: string) {
    setForm((current) => ({
      ...current,
      chickIds: current.chickIds.includes(chickId)
        ? current.chickIds.filter((id) => id !== chickId)
        : [...current.chickIds, chickId],
    }));
    setErrors((current) => ({ ...current, chickIds: undefined }));
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

    const nextErrors: Partial<Record<keyof OrderForm, string>> = {};
    if (!form.customerId) nextErrors.customerId = "Customer is required.";
    if (!form.pickupDate) nextErrors.pickupDate = "Pickup Date is required.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      setIsSaving(true);
      setRequestError("");

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: form.customerId,
          status: form.status,
          pickupDate: form.pickupDate,
          total: Number(form.total) || 0,
          notes: form.notes.trim(),
          chickIds: form.chickIds,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save order.");
      }

      await loadOrders();
      closePanel();
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Failed to save order.");
    } finally {
      setIsSaving(false);
    }
  }

  const availableChicks = useMemo(
    () => chicks.filter((chick) => ["Available", "Reserved"].includes(chick.status)),
    [chicks],
  );

  const rows = orders.map((order) => ({
    customer: order.customer,
    chickCount: String(order.chickCount),
    assignedChicks:
      order.assignedChicks.length > 0
        ? order.assignedChicks
            .map((chick) => `${chick.bandNumber} (${chick.flockName})`)
            .join(", ")
        : "-",
    status: toTitleCase(order.status),
    pickupDate: formatDate(order.pickupDate),
    total: formatCurrency(order.total),
    notes: order.notes || "-",
  }));

  return (
    <>
      <div className="space-y-6">
        <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Orders</h2>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                Order records shaped for fulfillment, pickup scheduling, customer management, and
                real chick assignment through PostgreSQL.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
            >
              Add Order
            </button>
          </div>
          {requestError ? <p className="mt-4 text-sm text-[#b34b75]">{requestError}</p> : null}
        </section>

        <DataTable
          title="Orders"
          description={
            isLoading
              ? "Loading orders..."
              : "Orders backed by Prisma with live customer records and assigned chicks."
          }
          columns={[
            { key: "customer", label: "Customer" },
            { key: "chickCount", label: "Chick Count" },
            { key: "assignedChicks", label: "Assigned Chicks" },
            { key: "status", label: "Status" },
            { key: "pickupDate", label: "Pickup Date" },
            { key: "total", label: "Total" },
            { key: "notes", label: "Notes" },
          ]}
          rows={rows}
        />
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#221c3f]/35 backdrop-blur-sm">
          <button type="button" aria-label="Close order panel" onClick={closePanel} className="flex-1" />
          <aside className="soft-shadow h-full w-full max-w-xl border-l border-[color:var(--line)] bg-white px-6 py-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                  New Order
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Add Order</h2>
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

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Status"
                  input={
                    <select
                      value={form.status}
                      onChange={(event) => updateField("status", event.target.value as OrderStatus)}
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
                <FormField
                  label="Pickup Date"
                  error={errors.pickupDate}
                  input={
                    <input
                      type="date"
                      value={form.pickupDate}
                      onChange={(event) => updateField("pickupDate", event.target.value)}
                      className={inputClassName(errors.pickupDate)}
                    />
                  }
                />
              </div>

              <FormField
                label="Total"
                input={
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.total}
                    onChange={(event) => updateField("total", event.target.value)}
                    placeholder="125.00"
                    className={inputClassName()}
                  />
                }
              />

              <div>
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  Assign Chicks
                </span>
                <div className="max-h-64 space-y-3 overflow-y-auto rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
                  {availableChicks.length === 0 ? (
                    <p className="text-sm text-[color:var(--muted)]">
                      No available or reserved chicks are ready to assign.
                    </p>
                  ) : (
                    availableChicks.map((chick) => (
                      <label
                        key={chick.id}
                        className="flex items-start gap-3 rounded-[18px] border border-[color:var(--line)] bg-white px-4 py-3"
                      >
                        <input
                          type="checkbox"
                          checked={form.chickIds.includes(chick.id)}
                          onChange={() => toggleChick(chick.id)}
                          className="mt-1 h-4 w-4 rounded border-[color:var(--line)] text-[color:var(--accent)]"
                        />
                        <span className="text-sm leading-6 text-foreground">
                          <span className="block font-medium">
                            {chick.bandNumber} · {chick.flockName}
                          </span>
                          <span className="block text-[color:var(--muted)]">
                            {chick.color || "Color not logged"} · {chick.sex} · {chick.status}
                          </span>
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <FormField
                label="Notes"
                input={
                  <textarea
                    value={form.notes}
                    onChange={(event) => updateField("notes", event.target.value)}
                    rows={5}
                    placeholder="Optional fulfillment or pickup notes"
                    className={`${inputClassName()} resize-none`}
                  />
                }
              />

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? "Saving..." : "Save Order"}
              </button>
            </form>
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

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function inputClassName(error?: string) {
  return `w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 ${
    error
      ? "border-[#d67aa0] focus:border-[#d67aa0] focus:ring-[#f3d4e1]"
      : "border-[color:var(--line)] focus:border-[color:var(--accent)] focus:ring-[color:var(--accent-soft)]"
  }`;
}

function toTitleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
