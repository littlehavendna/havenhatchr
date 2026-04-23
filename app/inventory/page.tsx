"use client";

import { FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { StatCard } from "@/components/stat-card";

type InventoryCategory = "Feed" | "Bedding" | "Medical" | "Other";
type MovementType = "StockIn" | "Usage" | "Adjustment";

type InventoryItem = {
  id: string;
  name: string;
  category: InventoryCategory;
  currentQuantity: number;
  unit: string;
  lowStockThreshold: number | null;
  notes: string;
  createdAt: string;
  recentMovements: Array<{
    id: string;
    type: MovementType;
    quantity: number;
    occurredAt: string;
    notes: string;
  }>;
};

type InventoryMovement = {
  id: string;
  itemId: string;
  itemName: string;
  itemCategory: InventoryCategory;
  type: MovementType;
  quantity: number;
  unit: string;
  occurredAt: string;
  notes: string;
};

type InventoryResponse = {
  stats: {
    totalItems: number;
    lowStockCount: number;
    feedItems: number;
    usageEntries30Days: number;
  };
  analytics: {
    totalUsageByCategory: Record<InventoryCategory, number>;
    feedUsageByItem: Array<{ itemId: string; itemName: string; quantity: number; unit: string }>;
  };
  lowStockItems: Array<{
    id: string;
    name: string;
    category: InventoryCategory;
    currentQuantity: number;
    unit: string;
    lowStockThreshold: number | null;
  }>;
  items: InventoryItem[];
  movements: InventoryMovement[];
  feedLog: Array<{
    id: string;
    itemId: string;
    itemName: string;
    quantity: number;
    unit: string;
    occurredAt: string;
    notes: string;
  }>;
};

type ItemForm = {
  name: string;
  category: InventoryCategory;
  currentQuantity: string;
  unit: string;
  lowStockThreshold: string;
  notes: string;
};

type MovementForm = {
  itemId: string;
  type: MovementType;
  quantity: string;
  occurredAt: string;
  notes: string;
};

const emptyItemForm: ItemForm = {
  name: "",
  category: "Feed",
  currentQuantity: "",
  unit: "lbs",
  lowStockThreshold: "",
  notes: "",
};

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function InventoryPage() {
  const [data, setData] = useState<InventoryResponse | null>(null);
  const [itemForm, setItemForm] = useState<ItemForm>(emptyItemForm);
  const [movementForm, setMovementForm] = useState<MovementForm>({
    itemId: "",
    type: "Usage",
    quantity: "",
    occurredAt: todayDate(),
    notes: "",
  });
  const [categoryFilter, setCategoryFilter] = useState<"All" | InventoryCategory>("All");
  const [showAddItem, setShowAddItem] = useState(false);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [isSavingMovement, setIsSavingMovement] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadInventory();
  }, []);

  useEffect(() => {
    if (!movementForm.itemId && data?.items[0]) {
      setMovementForm((current) => ({ ...current, itemId: data.items[0].id }));
    }
  }, [data?.items, movementForm.itemId]);

  async function loadInventory() {
    try {
      const response = await fetch("/api/inventory", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to load inventory.");
      }

      setData((await response.json()) as InventoryResponse);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load inventory.");
    }
  }

  async function handleAddItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSavingItem(true);
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "item",
          name: itemForm.name,
          category: itemForm.category,
          currentQuantity: Number(itemForm.currentQuantity || 0),
          unit: itemForm.unit,
          lowStockThreshold:
            itemForm.lowStockThreshold === "" ? null : Number(itemForm.lowStockThreshold),
          notes: itemForm.notes,
        }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Failed to add inventory item.");
      }

      setItemForm(emptyItemForm);
      setShowAddItem(false);
      await loadInventory();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Failed to add inventory item.",
      );
    } finally {
      setIsSavingItem(false);
    }
  }

  async function handleMovement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSavingMovement(true);
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "movement",
          itemId: movementForm.itemId,
          type: movementForm.type,
          quantity: Number(movementForm.quantity || 0),
          occurredAt: movementForm.occurredAt,
          notes: movementForm.notes,
        }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Failed to log inventory movement.");
      }

      setMovementForm((current) => ({
        ...current,
        quantity: "",
        occurredAt: todayDate(),
        notes: "",
      }));
      await loadInventory();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Failed to log inventory movement.",
      );
    } finally {
      setIsSavingMovement(false);
    }
  }

  const filteredItems = useMemo(() => {
    const items = data?.items ?? [];
    return categoryFilter === "All"
      ? items
      : items.filter((item) => item.category === categoryFilter);
  }, [categoryFilter, data?.items]);

  const stats = [
    {
      label: "Inventory Items",
      value: String(data?.stats.totalItems ?? 0),
      detail: "Feed, bedding, medical, and other supply records.",
    },
    {
      label: "Low Stock",
      value: String(data?.stats.lowStockCount ?? 0),
      detail: "Items at or below their reorder warning threshold.",
    },
    {
      label: "Feed Items",
      value: String(data?.stats.feedItems ?? 0),
      detail: "Tracked feeds available for feed log and usage analytics.",
    },
    {
      label: "30 Day Usage",
      value: String(data?.stats.usageEntries30Days ?? 0),
      detail: "Usage entries logged in the last 30 days.",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Inventory & Supplies
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Feed, bedding, and medical stock
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
              Track current stock, log usage, review feed history, and catch reorder needs before
              supplies run out.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddItem((current) => !current)}
            className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
          >
            {showAddItem ? "Close" : "Add Item"}
          </button>
        </div>
        {error ? <p className="mt-4 text-sm text-[#b34b75]">{error}</p> : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} detail={card.detail} />
        ))}
      </section>

      {showAddItem ? (
        <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Add Item
          </p>
          <form onSubmit={handleAddItem} className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Item Name">
              <input
                value={itemForm.name}
                onChange={(event) =>
                  setItemForm((current) => ({ ...current, name: event.target.value }))
                }
                className={inputClassName()}
                placeholder="Layer feed"
              />
            </Field>
            <Field label="Category">
              <select
                value={itemForm.category}
                onChange={(event) =>
                  setItemForm((current) => ({
                    ...current,
                    category: event.target.value as InventoryCategory,
                  }))
                }
                className={inputClassName()}
              >
                <option value="Feed">Feed</option>
                <option value="Bedding">Bedding</option>
                <option value="Medical">Medical</option>
                <option value="Other">Other</option>
              </select>
            </Field>
            <Field label="Current Quantity">
              <input
                type="number"
                min="0"
                step="0.01"
                value={itemForm.currentQuantity}
                onChange={(event) =>
                  setItemForm((current) => ({
                    ...current,
                    currentQuantity: event.target.value,
                  }))
                }
                className={inputClassName()}
                placeholder="100"
              />
            </Field>
            <Field label="Unit">
              <input
                value={itemForm.unit}
                onChange={(event) =>
                  setItemForm((current) => ({ ...current, unit: event.target.value }))
                }
                className={inputClassName()}
                placeholder="lbs, bags, bales, bottles"
              />
            </Field>
            <Field label="Low Stock Threshold">
              <input
                type="number"
                min="0"
                step="0.01"
                value={itemForm.lowStockThreshold}
                onChange={(event) =>
                  setItemForm((current) => ({
                    ...current,
                    lowStockThreshold: event.target.value,
                  }))
                }
                className={inputClassName()}
                placeholder="Optional"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Notes">
                <textarea
                  value={itemForm.notes}
                  onChange={(event) =>
                    setItemForm((current) => ({ ...current, notes: event.target.value }))
                  }
                  rows={3}
                  className={`${inputClassName()} resize-none`}
                  placeholder="Supplier, storage location, or reorder preference"
                />
              </Field>
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={isSavingItem}
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSavingItem ? "Saving..." : "Add Item"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Quick Log
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">Track usage or restock</h2>
          <form onSubmit={handleMovement} className="mt-5 grid gap-4">
            <Field label="Item">
              <select
                value={movementForm.itemId}
                onChange={(event) =>
                  setMovementForm((current) => ({ ...current, itemId: event.target.value }))
                }
                className={inputClassName()}
              >
                {(data?.items ?? []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({formatQuantity(item.currentQuantity)} {item.unit})
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Action">
                <select
                  value={movementForm.type}
                  onChange={(event) =>
                    setMovementForm((current) => ({
                      ...current,
                      type: event.target.value as MovementType,
                    }))
                  }
                  className={inputClassName()}
                >
                  <option value="Usage">Usage</option>
                  <option value="StockIn">Restock</option>
                  <option value="Adjustment">Set Count</option>
                </select>
              </Field>
              <Field label="Quantity">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={movementForm.quantity}
                  onChange={(event) =>
                    setMovementForm((current) => ({ ...current, quantity: event.target.value }))
                  }
                  className={inputClassName()}
                />
              </Field>
              <Field label="Date">
                <input
                  type="date"
                  value={movementForm.occurredAt}
                  onChange={(event) =>
                    setMovementForm((current) => ({
                      ...current,
                      occurredAt: event.target.value,
                    }))
                  }
                  className={inputClassName()}
                />
              </Field>
            </div>
            <Field label="Notes">
              <textarea
                value={movementForm.notes}
                onChange={(event) =>
                  setMovementForm((current) => ({ ...current, notes: event.target.value }))
                }
                rows={3}
                className={`${inputClassName()} resize-none`}
                placeholder="Fed grow-outs, added pine shavings, restocked first aid kit"
              />
            </Field>
            <button
              type="submit"
              disabled={isSavingMovement || (data?.items.length ?? 0) === 0}
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--teal)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#318f8b] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSavingMovement ? "Saving..." : "Log Entry"}
            </button>
          </form>
        </div>

        <div className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Reorder Alerts
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">Low stock warnings</h2>
          <div className="mt-5 space-y-3">
            {(data?.lowStockItems ?? []).length > 0 ? (
              data?.lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[22px] border border-[#f3c8d4] bg-[#fff7f9] p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.name}</p>
                      <p className="mt-1 text-sm text-[color:var(--muted)]">
                        {item.category} stock is {formatQuantity(item.currentQuantity)} {item.unit}.
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#b34b75]">
                      Threshold {formatQuantity(item.lowStockThreshold ?? 0)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[22px] border border-[color:var(--line)] bg-[#fcfbff] p-4 text-sm text-[color:var(--muted)]">
                No reorder warnings right now.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Current Stock
            </p>
            <h2 className="text-xl font-semibold tracking-tight">Inventory items</h2>
          </div>
          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value as "All" | InventoryCategory)
            }
            className={inputClassName()}
          >
            <option value="All">All Categories</option>
            <option value="Feed">Feed</option>
            <option value="Bedding">Bedding</option>
            <option value="Medical">Medical</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const isLow =
                item.lowStockThreshold !== null &&
                item.currentQuantity <= item.lowStockThreshold;

              return (
                <article
                  key={item.id}
                  className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <Pill tone="teal">{item.category}</Pill>
                        {isLow ? <Pill tone="danger">Low Stock</Pill> : null}
                      </div>
                      <p className="mt-3 text-base font-semibold tracking-tight">{item.name}</p>
                      <p className="mt-1 text-sm text-[color:var(--muted)]">
                        {formatQuantity(item.currentQuantity)} {item.unit} on hand
                      </p>
                    </div>
                    {item.lowStockThreshold !== null ? (
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                        Low at {formatQuantity(item.lowStockThreshold)}
                      </span>
                    ) : null}
                  </div>
                  {item.notes ? (
                    <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                      {item.notes}
                    </p>
                  ) : null}
                </article>
              );
            })
          ) : (
            <div className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-5 text-sm text-[color:var(--muted)] lg:col-span-2">
              No inventory items match this filter.
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Usage Analytics
          </p>
          <div className="mt-5 space-y-3">
            {(["Feed", "Bedding", "Medical", "Other"] as InventoryCategory[]).map((category) => (
              <div
                key={category}
                className="flex items-center justify-between gap-4 rounded-[20px] border border-[color:var(--line)] bg-[#fcfbff] px-4 py-3"
              >
                <span className="text-sm font-semibold text-foreground">{category}</span>
                <span className="text-sm text-[color:var(--muted)]">
                  {formatQuantity(data?.analytics.totalUsageByCategory[category] ?? 0)} used
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-3">
            {(data?.analytics.feedUsageByItem ?? []).map((item) => (
              <div key={item.itemId} className="rounded-[20px] bg-[#edf7f8] px-4 py-3">
                <p className="text-sm font-semibold text-foreground">{item.itemName}</p>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  {formatQuantity(item.quantity)} {item.unit} used in the last 30 days
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Feed Log
          </p>
          <div className="mt-5 space-y-3">
            {(data?.feedLog ?? []).length > 0 ? (
              data?.feedLog.slice(0, 12).map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-[20px] border border-[color:var(--line)] bg-[#fcfbff] px-4 py-3"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-semibold text-foreground">{entry.itemName}</p>
                    <span className="text-sm text-[color:var(--muted)]">
                      {formatDate(entry.occurredAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">
                    {formatQuantity(entry.quantity)} {entry.unit} used
                    {entry.notes ? ` - ${entry.notes}` : ""}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[20px] border border-[color:var(--line)] bg-[#fcfbff] p-4 text-sm text-[color:var(--muted)]">
                Feed usage entries will appear here after you log them.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}

function inputClassName() {
  return "w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]";
}

function Pill({ children, tone }: { children: ReactNode; tone: "teal" | "danger" }) {
  const className =
    tone === "teal" ? "bg-[#edf7f8] text-[color:var(--teal)]" : "bg-[#fff1f3] text-[#b34b75]";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${className}`}>
      {children}
    </span>
  );
}

function formatQuantity(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}
