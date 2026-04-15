"use client";

import { FormEvent, type ReactNode, useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { StatCard } from "@/components/stat-card";

type EggSaleType = "TableEggs" | "HatchingEggs" | "Other";
type EggSaleUnit = "PerEgg" | "PerDozen" | "Flat";

type EggSaleRow = {
  id: string;
  saleDate: string;
  locationId: string;
  locationName: string;
  saleType: EggSaleType;
  saleTypeLabel: string;
  quantity: number;
  quantityLabel: string;
  unitType: EggSaleUnit;
  unitTypeLabel: string;
  pricePerUnit: number;
  totalAmount: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type EggSaleLocation = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  saleCount: number;
  revenue: number;
};

type EggSaleSettings = {
  id: string;
  defaultPricePerEgg: number;
  defaultPricePerDozen: number;
  defaultSaleUnit: EggSaleUnit;
  defaultSaleUnitLabel: string;
  createdAt: string;
  updatedAt: string;
};

type EggSalesResponse = {
  settings: EggSaleSettings;
  locations: EggSaleLocation[];
  sales: EggSaleRow[];
  reporting: {
    byLocation: Array<{
      locationId: string;
      locationName: string;
      revenue: number;
      saleCount: number;
    }>;
  };
};

type SaleForm = {
  saleDate: string;
  locationId: string;
  saleType: EggSaleType;
  quantity: string;
  unitType: EggSaleUnit;
  pricePerUnit: string;
  notes: string;
};

type SettingsForm = {
  defaultPricePerEgg: string;
  defaultPricePerDozen: string;
  defaultSaleUnit: EggSaleUnit;
};

type LocationForm = {
  name: string;
  description: string;
};

type FilterState = {
  search: string;
  dateFrom: string;
  dateTo: string;
  locationId: string;
  saleType: EggSaleType | "All";
};

const saleTypeOptions: Array<{ value: EggSaleType; label: string }> = [
  { value: "TableEggs", label: "Table Eggs" },
  { value: "HatchingEggs", label: "Hatching Eggs" },
  { value: "Other", label: "Other" },
];

const unitTypeOptions: Array<{ value: EggSaleUnit; label: string }> = [
  { value: "PerEgg", label: "Per Egg" },
  { value: "PerDozen", label: "Per Dozen" },
  { value: "Flat", label: "Flat" },
];

const emptyFilters: FilterState = {
  search: "",
  dateFrom: "",
  dateTo: "",
  locationId: "All",
  saleType: "All",
};

const emptyLocationForm: LocationForm = {
  name: "",
  description: "",
};

export default function EggSalesPage() {
  const [data, setData] = useState<EggSalesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requestError, setRequestError] = useState("");
  const [activePanel, setActivePanel] = useState<"sale" | "locations" | "settings" | null>(null);
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [saleForm, setSaleForm] = useState<SaleForm>(() => createEmptySaleForm());
  const [saleErrors, setSaleErrors] = useState<Partial<Record<keyof SaleForm, string>>>({});
  const [settingsForm, setSettingsForm] = useState<SettingsForm>({
    defaultPricePerEgg: "0",
    defaultPricePerDozen: "0",
    defaultSaleUnit: "PerDozen",
  });
  const [settingsError, setSettingsError] = useState("");
  const [locationForm, setLocationForm] = useState<LocationForm>(emptyLocationForm);
  const [locationFormError, setLocationFormError] = useState("");
  const [locationEdits, setLocationEdits] = useState<Record<string, { name: string; description: string; isActive: boolean }>>({});
  const [locationEditError, setLocationEditError] = useState("");
  const [savingLocationId, setSavingLocationId] = useState("");
  const [isSavingSale, setIsSavingSale] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isCreatingLocation, setIsCreatingLocation] = useState(false);

  useEffect(() => {
    void loadEggSales();
  }, []);

  async function loadEggSales() {
    try {
      setRequestError("");
      const response = await fetch("/api/egg-sales", { cache: "no-store" });
      const payload = await readJson<EggSalesResponse & { error?: string }>(response);

      if (!response.ok) {
        throw new Error(payload.error || "Failed to load egg sales.");
      }

      setData(payload);
      setSettingsForm({
        defaultPricePerEgg: formatEditableNumber(payload.settings.defaultPricePerEgg),
        defaultPricePerDozen: formatEditableNumber(payload.settings.defaultPricePerDozen),
        defaultSaleUnit: payload.settings.defaultSaleUnit,
      });
      setLocationEdits(
        Object.fromEntries(
          payload.locations.map((location) => [
            location.id,
            {
              name: location.name,
              description: location.description,
              isActive: location.isActive,
            },
          ]),
        ),
      );
      setSaleForm(buildSaleForm(payload));
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Failed to load egg sales.");
    } finally {
      setIsLoading(false);
    }
  }

  function openSalePanel() {
    if (data) {
      setSaleForm(buildSaleForm(data));
    }
    setSaleErrors({});
    setRequestError("");
    setActivePanel("sale");
  }

  function openLocationsPanel() {
    if (data) {
      setLocationEdits(
        Object.fromEntries(
          data.locations.map((location) => [
            location.id,
            {
              name: location.name,
              description: location.description,
              isActive: location.isActive,
            },
          ]),
        ),
      );
    }
    setLocationForm(emptyLocationForm);
    setLocationFormError("");
    setLocationEditError("");
    setActivePanel("locations");
  }

  function openSettingsPanel() {
    if (data) {
      setSettingsForm({
        defaultPricePerEgg: formatEditableNumber(data.settings.defaultPricePerEgg),
        defaultPricePerDozen: formatEditableNumber(data.settings.defaultPricePerDozen),
        defaultSaleUnit: data.settings.defaultSaleUnit,
      });
    }
    setSettingsError("");
    setActivePanel("settings");
  }

  function closePanel() {
    setActivePanel(null);
    setRequestError("");
    setSaleErrors({});
    setSettingsError("");
    setLocationFormError("");
    setLocationEditError("");
  }

  function updateSaleField<K extends keyof SaleForm>(key: K, value: SaleForm[K]) {
    setSaleForm((current) => ({ ...current, [key]: value }));
    setSaleErrors((current) => ({ ...current, [key]: undefined }));
    setRequestError("");
  }

  function updateSaleUnit(unitType: EggSaleUnit) {
    const settings = data?.settings;
    const nextPrice =
      unitType === "PerEgg"
        ? settings?.defaultPricePerEgg ?? 0
        : unitType === "PerDozen"
          ? settings?.defaultPricePerDozen ?? 0
          : 0;

    setSaleForm((current) => ({
      ...current,
      unitType,
      quantity: unitType === "Flat" ? "1" : current.quantity,
      pricePerUnit: formatEditableNumber(nextPrice),
    }));
    setSaleErrors((current) => ({
      ...current,
      unitType: undefined,
      quantity: undefined,
      pricePerUnit: undefined,
    }));
    setRequestError("");
  }

  async function handleCreateSale(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Partial<Record<keyof SaleForm, string>> = {};
    if (!saleForm.saleDate) nextErrors.saleDate = "Sale date is required.";
    if (!saleForm.locationId) nextErrors.locationId = "Location is required.";
    if (!saleForm.quantity || Number(saleForm.quantity) <= 0) {
      nextErrors.quantity = "Quantity must be greater than zero.";
    }
    if (saleForm.pricePerUnit === "" || Number(saleForm.pricePerUnit) < 0) {
      nextErrors.pricePerUnit = "Price per unit must be zero or more.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setSaleErrors(nextErrors);
      return;
    }

    try {
      setIsSavingSale(true);
      setRequestError("");

      const response = await fetch("/api/egg-sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          saleDate: saleForm.saleDate,
          locationId: saleForm.locationId,
          saleType: saleForm.saleType,
          quantity: Number(saleForm.unitType === "Flat" ? 1 : saleForm.quantity),
          unitType: saleForm.unitType,
          pricePerUnit: Number(saleForm.pricePerUnit),
          notes: saleForm.notes.trim(),
        }),
      });
      const payload = await readJson<{ error?: string }>(response);

      if (!response.ok) {
        throw new Error(payload.error || "Failed to save egg sale.");
      }

      await loadEggSales();
      closePanel();
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Failed to save egg sale.");
    } finally {
      setIsSavingSale(false);
    }
  }

  async function handleSaveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (Number(settingsForm.defaultPricePerEgg) < 0 || Number(settingsForm.defaultPricePerDozen) < 0) {
      setSettingsError("Default prices must be zero or more.");
      return;
    }

    try {
      setIsSavingSettings(true);
      setSettingsError("");
      setRequestError("");

      const response = await fetch("/api/egg-sales/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultPricePerEgg: Number(settingsForm.defaultPricePerEgg || 0),
          defaultPricePerDozen: Number(settingsForm.defaultPricePerDozen || 0),
          defaultSaleUnit: settingsForm.defaultSaleUnit,
        }),
      });
      const payload = await readJson<{ error?: string }>(response);

      if (!response.ok) {
        throw new Error(payload.error || "Failed to update pricing defaults.");
      }

      await loadEggSales();
      closePanel();
    } catch (error) {
      setSettingsError(
        error instanceof Error ? error.message : "Failed to update pricing defaults.",
      );
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function handleCreateLocation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!locationForm.name.trim()) {
      setLocationFormError("Location name is required.");
      return;
    }

    try {
      setIsCreatingLocation(true);
      setLocationFormError("");
      setRequestError("");

      const response = await fetch("/api/egg-sales/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: locationForm.name.trim(),
          description: locationForm.description.trim(),
        }),
      });
      const payload = await readJson<{ error?: string }>(response);

      if (!response.ok) {
        throw new Error(payload.error || "Failed to create location.");
      }

      await loadEggSales();
      setLocationForm(emptyLocationForm);
      setActivePanel("locations");
    } catch (error) {
      setLocationFormError(error instanceof Error ? error.message : "Failed to create location.");
    } finally {
      setIsCreatingLocation(false);
    }
  }

  async function handleUpdateLocation(locationId: string) {
    const edit = locationEdits[locationId];
    if (!edit || !edit.name.trim()) {
      setLocationEditError("Each location needs a name.");
      return;
    }

    try {
      setSavingLocationId(locationId);
      setLocationEditError("");
      setRequestError("");

      const response = await fetch(`/api/egg-sales/locations/${locationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: edit.name.trim(),
          description: edit.description.trim(),
          isActive: edit.isActive,
        }),
      });
      const payload = await readJson<{ error?: string }>(response);

      if (!response.ok) {
        throw new Error(payload.error || "Failed to update location.");
      }

      await loadEggSales();
      setActivePanel("locations");
    } catch (error) {
      setLocationEditError(error instanceof Error ? error.message : "Failed to update location.");
    } finally {
      setSavingLocationId("");
    }
  }

  const sales = data?.sales ?? [];
  const locations = data?.locations ?? [];
  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      !filters.search ||
      [sale.locationName, sale.saleTypeLabel, sale.unitTypeLabel, sale.notes]
        .join(" ")
        .toLowerCase()
        .includes(filters.search.toLowerCase());
    const matchesFrom = !filters.dateFrom || sale.saleDate >= filters.dateFrom;
    const matchesTo = !filters.dateTo || sale.saleDate <= filters.dateTo;
    const matchesLocation = filters.locationId === "All" || sale.locationId === filters.locationId;
    const matchesType = filters.saleType === "All" || sale.saleType === filters.saleType;

    return matchesSearch && matchesFrom && matchesTo && matchesLocation && matchesType;
  });

  const summary = summarizeSales(filteredSales);
  const topLocation = summary.locationBreakdown[0];
  const insight = buildSalesInsight(summary, filteredSales);
  const tableRows = filteredSales.map((sale) => ({
    date: formatDate(sale.saleDate),
    location: sale.locationName,
    saleType: sale.saleTypeLabel,
    quantity: sale.quantityLabel,
    unitType: sale.unitTypeLabel,
    pricePerUnit: formatCurrency(sale.pricePerUnit),
    total: formatCurrency(sale.totalAmount),
    notes: sale.notes || "-",
  }));

  return (
    <>
      <div className="space-y-6">
        <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Egg Sales
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Egg Sales</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
                Track egg sales, revenue, and where your eggs are selling best.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={openSalePanel} className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]">
                Add Sale
              </button>
              <button type="button" onClick={openLocationsPanel} className="inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-[#f8f7fe]">
                Manage Locations
              </button>
              <button type="button" onClick={openSettingsPanel} className="inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-[#f8f7fe]">
                Pricing Defaults
              </button>
            </div>
          </div>
          {requestError ? <p className="mt-4 text-sm text-[#b34b75]">{requestError}</p> : null}
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Sales Revenue" value={formatCurrency(summary.totalRevenue)} detail={`${filteredSales.length} sale${filteredSales.length === 1 ? "" : "s"} in view`} />
          <StatCard label="Eggs Sold" value={formatCompactNumber(summary.eggsSold)} detail="Per-egg sales tracked in current results" />
          <StatCard label="Dozens Sold" value={formatCompactNumber(summary.dozensSold)} detail="Per-dozen sales tracked in current results" />
          <StatCard label="Top Location" value={topLocation?.locationName ?? "-"} detail={topLocation ? `${formatCurrency(topLocation.revenue)} across ${topLocation.saleCount} sales` : "No location data yet"} />
        </section>

        <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-[#edf7f8] p-5 sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--teal)]">
            Sales Heads Up
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight">{insight.title}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
            {insight.message}
          </p>
        </section>

        <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Filters</h3>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                Search sales and compare date ranges, locations, and sale types.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-5">
              <FormField label="Search" input={<input type="text" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Location, type, notes" className={inputClassName()} />} />
              <FormField label="Date From" input={<input type="date" value={filters.dateFrom} onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))} className={inputClassName()} />} />
              <FormField label="Date To" input={<input type="date" value={filters.dateTo} onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))} className={inputClassName()} />} />
              <FormField
                label="Location"
                input={
                  <select value={filters.locationId} onChange={(event) => setFilters((current) => ({ ...current, locationId: event.target.value }))} className={inputClassName()}>
                    <option value="All">All Locations</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                }
              />
              <FormField
                label="Sale Type"
                input={
                  <select
                    value={filters.saleType}
                    onChange={(event) => setFilters((current) => ({ ...current, saleType: event.target.value as EggSaleType | "All" }))}
                    className={inputClassName()}
                  >
                    <option value="All">All Sale Types</option>
                    {saleTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                }
              />
            </div>
          </div>
        </section>

        <DataTable
          title="Sales Log"
          description={isLoading ? "Loading egg sales..." : "Every sale is persisted through Prisma so revenue and location reporting stay current."}
          columns={[
            { key: "date", label: "Date" },
            { key: "location", label: "Location" },
            { key: "saleType", label: "Sale Type" },
            { key: "quantity", label: "Quantity" },
            { key: "unitType", label: "Unit Type" },
            { key: "pricePerUnit", label: "Price Per Unit" },
            { key: "total", label: "Total" },
            { key: "notes", label: "Notes" },
          ]}
          rows={tableRows}
          emptyState={{
            title: "No egg sales yet",
            description: "Log your first egg sale to start tracking revenue, default pricing, and location performance.",
            actionLabel: "Add Sale",
            onAction: openSalePanel,
          }}
        />

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold tracking-tight">Location Performance</h3>
              <p className="text-sm text-[color:var(--muted)]">
                Compare which locations are generating the most egg revenue right now.
              </p>
            </div>
            <div className="mt-5 space-y-3">
              {summary.locationBreakdown.length > 0 ? (
                summary.locationBreakdown.map((entry) => (
                  <div key={entry.locationId} className="flex flex-col gap-3 rounded-[22px] border border-[color:var(--line)] bg-[#fcfbff] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{entry.locationName}</p>
                      <p className="mt-1 text-sm text-[color:var(--muted)]">{entry.saleCount} sale{entry.saleCount === 1 ? "" : "s"} tracked</p>
                    </div>
                    <div className="flex gap-3 sm:text-right">
                      <LocationMetric label="Revenue" value={formatCurrency(entry.revenue)} />
                      <LocationMetric label="Avg Sale" value={formatCurrency(entry.saleCount > 0 ? entry.revenue / entry.saleCount : 0)} />
                    </div>
                  </div>
                ))
              ) : (
                <EmptyPanelMessage message="Location comparisons will appear after you log a sale." />
              )}
            </div>
          </div>

          <div className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold tracking-tight">Current Defaults</h3>
              <p className="text-sm text-[color:var(--muted)]">
                These values prefill the add sale workflow so logging stays fast.
              </p>
            </div>
            <div className="mt-5 grid gap-3">
              <DetailCard label="Default Sale Unit" value={data?.settings.defaultSaleUnitLabel ?? "Loading..."} />
              <DetailCard label="Default Price Per Egg" value={formatCurrency(data?.settings.defaultPricePerEgg ?? 0)} />
              <DetailCard label="Default Price Per Dozen" value={formatCurrency(data?.settings.defaultPricePerDozen ?? 0)} />
              <DetailCard label="Active Locations" value={String(locations.filter((location) => location.isActive).length)} />
            </div>
          </div>
        </section>
      </div>

      {activePanel === "sale" ? (
        <ModalShell title="Add Sale" subtitle="Log table eggs, hatching eggs, or any other egg sale with default pricing ready to use." onClose={closePanel}>
          <form onSubmit={handleCreateSale} className="mt-6 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Sale Date" error={saleErrors.saleDate} input={<input type="date" value={saleForm.saleDate} onChange={(event) => updateSaleField("saleDate", event.target.value)} className={inputClassName(saleErrors.saleDate)} />} />
              <FormField
                label="Location"
                error={saleErrors.locationId}
                input={
                  <select value={saleForm.locationId} onChange={(event) => updateSaleField("locationId", event.target.value)} className={inputClassName(saleErrors.locationId)}>
                    <option value="">Select location</option>
                    {locations.filter((location) => location.isActive).map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Sale Type"
                input={
                  <select value={saleForm.saleType} onChange={(event) => updateSaleField("saleType", event.target.value as EggSaleType)} className={inputClassName()}>
                    {saleTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                }
              />
              <FormField
                label="Unit Type"
                input={
                  <select value={saleForm.unitType} onChange={(event) => updateSaleUnit(event.target.value as EggSaleUnit)} className={inputClassName()}>
                    {unitTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label={saleForm.unitType === "Flat" ? "Quantity" : "Quantity Sold"}
                error={saleErrors.quantity}
                input={
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    disabled={saleForm.unitType === "Flat"}
                    value={saleForm.unitType === "Flat" ? "1" : saleForm.quantity}
                    onChange={(event) => updateSaleField("quantity", event.target.value)}
                    placeholder={saleForm.unitType === "PerEgg" ? "12" : saleForm.unitType === "PerDozen" ? "3" : "1"}
                    className={inputClassName(saleErrors.quantity)}
                  />
                }
              />
              <FormField
                label={saleForm.unitType === "Flat" ? "Flat Sale Amount" : "Price Per Unit"}
                error={saleErrors.pricePerUnit}
                input={
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={saleForm.pricePerUnit}
                    onChange={(event) => updateSaleField("pricePerUnit", event.target.value)}
                    placeholder="0.00"
                    className={inputClassName(saleErrors.pricePerUnit)}
                  />
                }
              />
            </div>

            <div className="rounded-[22px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                    Revenue Preview
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">
                    Defaults come from your egg pricing settings and can be overridden here.
                  </p>
                </div>
                <p className="text-2xl font-semibold tracking-tight">{formatCurrency(getSalePreviewTotal(saleForm))}</p>
              </div>
            </div>

            <FormField
              label="Notes"
              input={
                <textarea
                  value={saleForm.notes}
                  onChange={(event) => updateSaleField("notes", event.target.value)}
                  rows={4}
                  placeholder="Optional details like buyer name, carton notes, or follow-up info"
                  className={`${inputClassName()} resize-none`}
                />
              }
            />

            <button type="submit" disabled={isSavingSale} className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0] disabled:cursor-not-allowed disabled:opacity-70">
              {isSavingSale ? "Saving..." : "Save Sale"}
            </button>
          </form>
        </ModalShell>
      ) : null}

      {activePanel === "settings" ? (
        <ModalShell title="Pricing Defaults" subtitle="Set the default unit and base pricing used every time you open the Add Sale form." onClose={closePanel}>
          <form onSubmit={handleSaveSettings} className="mt-6 space-y-5">
            <FormField
              label="Default Sale Unit"
              input={
                <select value={settingsForm.defaultSaleUnit} onChange={(event) => setSettingsForm((current) => ({ ...current, defaultSaleUnit: event.target.value as EggSaleUnit }))} className={inputClassName()}>
                  {unitTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Default Price Per Egg" input={<input type="number" min="0" step="0.01" value={settingsForm.defaultPricePerEgg} onChange={(event) => setSettingsForm((current) => ({ ...current, defaultPricePerEgg: event.target.value }))} className={inputClassName()} />} />
              <FormField label="Default Price Per Dozen" input={<input type="number" min="0" step="0.01" value={settingsForm.defaultPricePerDozen} onChange={(event) => setSettingsForm((current) => ({ ...current, defaultPricePerDozen: event.target.value }))} className={inputClassName()} />} />
            </div>
            {settingsError ? <p className="text-sm text-[#b34b75]">{settingsError}</p> : null}
            <button type="submit" disabled={isSavingSettings} className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0] disabled:cursor-not-allowed disabled:opacity-70">
              {isSavingSettings ? "Saving..." : "Save Defaults"}
            </button>
          </form>
        </ModalShell>
      ) : null}

      {activePanel === "locations" ? (
        <ModalShell title="Manage Locations" subtitle="Keep your sale locations current so you can compare roadside, market, shop, and customer-channel performance." onClose={closePanel}>
          <div className="mt-6 space-y-6">
            <form onSubmit={handleCreateLocation} className="grid gap-4 rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
              <div>
                <h3 className="text-base font-semibold tracking-tight">Add Location</h3>
                <p className="mt-1 text-sm text-[color:var(--muted)]">Create a new sale channel for future egg sales.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Location Name" input={<input type="text" value={locationForm.name} onChange={(event) => setLocationForm((current) => ({ ...current, name: event.target.value }))} placeholder="Farm Stand" className={inputClassName()} />} />
                <FormField label="Description" input={<input type="text" value={locationForm.description} onChange={(event) => setLocationForm((current) => ({ ...current, description: event.target.value }))} placeholder="Weekend pop-up on the property" className={inputClassName()} />} />
              </div>
              {locationFormError ? <p className="text-sm text-[#b34b75]">{locationFormError}</p> : null}
              <button type="submit" disabled={isCreatingLocation} className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0] disabled:cursor-not-allowed disabled:opacity-70">
                {isCreatingLocation ? "Saving..." : "Add Location"}
              </button>
            </form>

            <div className="space-y-3">
              {locations.map((location) => {
                const edit = locationEdits[location.id];
                if (!edit) {
                  return null;
                }

                return (
                  <article key={location.id} className="rounded-[24px] border border-[color:var(--line)] bg-white p-4">
                    <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
                      <FormField label="Name" input={<input type="text" value={edit.name} onChange={(event) => setLocationEdits((current) => ({ ...current, [location.id]: { ...current[location.id], name: event.target.value } }))} className={inputClassName()} />} />
                      <FormField label="Description" input={<input type="text" value={edit.description} onChange={(event) => setLocationEdits((current) => ({ ...current, [location.id]: { ...current[location.id], description: event.target.value } }))} className={inputClassName()} />} />
                      <div className="grid gap-3">
                        <label className="flex items-center gap-3 rounded-[20px] border border-[color:var(--line)] bg-[#fcfbff] px-4 py-3 text-sm text-foreground">
                          <input type="checkbox" checked={edit.isActive} onChange={(event) => setLocationEdits((current) => ({ ...current, [location.id]: { ...current[location.id], isActive: event.target.checked } }))} className="h-4 w-4 rounded border-[color:var(--line)] text-[color:var(--accent)]" />
                          Active
                        </label>
                        <button type="button" onClick={() => void handleUpdateLocation(location.id)} disabled={savingLocationId === location.id} className="inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-[#f8f7fe] disabled:cursor-not-allowed disabled:opacity-70">
                          {savingLocationId === location.id ? "Saving..." : "Save Location"}
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                      <span className="rounded-full bg-[#f5f3fd] px-3 py-2">{location.saleCount} sales</span>
                      <span className="rounded-full bg-[#edf7f8] px-3 py-2 text-[color:var(--teal)]">{formatCurrency(location.revenue)} revenue</span>
                    </div>
                  </article>
                );
              })}
            </div>
            {locationEditError ? <p className="text-sm text-[#b34b75]">{locationEditError}</p> : null}
          </div>
        </ModalShell>
      ) : null}
    </>
  );
}

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#221c3f]/35 backdrop-blur-sm">
      <button type="button" aria-label={`Close ${title}`} onClick={onClose} className="flex-1" />
      <aside className="soft-shadow h-full w-full max-w-2xl overflow-y-auto border-l border-[color:var(--line)] bg-white px-6 py-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Egg Sales
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2>
            <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{subtitle}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-[color:var(--line)] px-3 py-2 text-sm text-[color:var(--muted)] transition hover:bg-[#f8f7fe]">
            Close
          </button>
        </div>
        {children}
      </aside>
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

function LocationMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-[color:var(--line)] bg-[#fcfbff] px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function EmptyPanelMessage({ message }: { message: string }) {
  return (
    <div className="rounded-[22px] border border-[color:var(--line)] bg-[#fcfbff] px-5 py-10 text-center text-sm text-[color:var(--muted)]">
      {message}
    </div>
  );
}

function buildSaleForm(data: EggSalesResponse): SaleForm {
  const activeLocations = data.locations.filter((location) => location.isActive);
  const defaultUnit = data.settings.defaultSaleUnit;

  return {
    saleDate: getTodayDateString(),
    locationId: activeLocations[0]?.id ?? "",
    saleType: "TableEggs",
    quantity: "1",
    unitType: defaultUnit,
    pricePerUnit: formatEditableNumber(getDefaultPriceForUnit(data.settings, defaultUnit)),
    notes: "",
  };
}

function createEmptySaleForm(): SaleForm {
  return {
    saleDate: getTodayDateString(),
    locationId: "",
    saleType: "TableEggs",
    quantity: "1",
    unitType: "PerDozen",
    pricePerUnit: "0",
    notes: "",
  };
}

function getDefaultPriceForUnit(settings: EggSaleSettings, unitType: EggSaleUnit) {
  if (unitType === "PerEgg") {
    return settings.defaultPricePerEgg;
  }

  if (unitType === "PerDozen") {
    return settings.defaultPricePerDozen;
  }

  return 0;
}

function getSalePreviewTotal(form: SaleForm) {
  const price = Number(form.pricePerUnit || 0);
  const quantity = Number(form.unitType === "Flat" ? 1 : form.quantity || 0);

  if (form.unitType === "Flat") {
    return price;
  }

  return quantity * price;
}

function summarizeSales(sales: EggSaleRow[]) {
  const locationBreakdownMap = new Map<
    string,
    { locationId: string; locationName: string; revenue: number; saleCount: number }
  >();

  let totalRevenue = 0;
  let eggsSold = 0;
  let dozensSold = 0;

  for (const sale of sales) {
    totalRevenue += sale.totalAmount;

    if (sale.unitType === "PerEgg") {
      eggsSold += sale.quantity;
    }

    if (sale.unitType === "PerDozen") {
      dozensSold += sale.quantity;
    }

    const current = locationBreakdownMap.get(sale.locationId) ?? {
      locationId: sale.locationId,
      locationName: sale.locationName,
      revenue: 0,
      saleCount: 0,
    };

    current.revenue += sale.totalAmount;
    current.saleCount += 1;
    locationBreakdownMap.set(sale.locationId, current);
  }

  return {
    totalRevenue,
    eggsSold,
    dozensSold,
    locationBreakdown: Array.from(locationBreakdownMap.values()).sort((left, right) => {
      if (right.revenue === left.revenue) {
        return left.locationName.localeCompare(right.locationName);
      }

      return right.revenue - left.revenue;
    }),
  };
}

function buildSalesInsight(
  summary: ReturnType<typeof summarizeSales>,
  sales: EggSaleRow[],
) {
  if (summary.locationBreakdown.length === 0) {
    return {
      title: "No sales data yet",
      message: "Add a few egg sales and HavenHatchr will call out which locations are making the most money for your operation.",
    };
  }

  const monthlyTrend = buildMonthlyRevenueTrend(sales);
  if (monthlyTrend) {
    return monthlyTrend;
  }

  const top = summary.locationBreakdown[0];
  const second = summary.locationBreakdown[1];
  const topShare = summary.totalRevenue > 0 ? Math.round((top.revenue / summary.totalRevenue) * 100) : 0;

  if (!second) {
    return {
      title: `${top.locationName} is your only tracked sales channel`,
      message: `${top.locationName} has brought in ${formatCurrency(top.revenue)} so far. Add more locations as you sell through other channels to compare where your egg revenue is strongest.`,
    };
  }

  const leadAmount = top.revenue - second.revenue;

  return {
    title: `${top.locationName} is making the most money right now`,
    message: `${top.locationName} leads your current sales with ${formatCurrency(top.revenue)}, about ${topShare}% of tracked revenue. It is ahead of ${second.locationName} by ${formatCurrency(leadAmount)}.`,
  };
}

function buildMonthlyRevenueTrend(sales: EggSaleRow[]) {
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthKey = `${previousMonthDate.getFullYear()}-${String(previousMonthDate.getMonth() + 1).padStart(2, "0")}`;
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(now.getFullYear(), now.getMonth(), 1));

  const currentMonthSales = sales.filter((sale) => sale.saleDate.slice(0, 7) === currentMonthKey);
  if (currentMonthSales.length === 0) {
    return null;
  }

  const revenueByLocation = new Map<string, { locationName: string; revenue: number; saleCount: number }>();
  for (const sale of currentMonthSales) {
    const current = revenueByLocation.get(sale.locationId) ?? {
      locationName: sale.locationName,
      revenue: 0,
      saleCount: 0,
    };

    current.revenue += sale.totalAmount;
    current.saleCount += 1;
    revenueByLocation.set(sale.locationId, current);
  }

  const topEntry = Array.from(revenueByLocation.entries())
    .sort((left, right) => {
      if (right[1].revenue === left[1].revenue) {
        return left[1].locationName.localeCompare(right[1].locationName);
      }

      return right[1].revenue - left[1].revenue;
    })[0];

  if (!topEntry) {
    return null;
  }

  const [topLocationId, topLocation] = topEntry;
  const previousMonthRevenue = sales
    .filter(
      (sale) =>
        sale.locationId === topLocationId && sale.saleDate.slice(0, 7) === previousMonthKey,
    )
    .reduce((sum, sale) => sum + sale.totalAmount, 0);

  if (previousMonthRevenue > 0) {
    const change = topLocation.revenue - previousMonthRevenue;
    const direction = change >= 0 ? "up" : "down";

    return {
      title: `${topLocation.locationName} is leading ${monthLabel}`,
      message: `${topLocation.locationName} has produced ${formatCurrency(topLocation.revenue)} this month across ${topLocation.saleCount} sale${topLocation.saleCount === 1 ? "" : "s"}. That is ${direction} ${formatCurrency(Math.abs(change))} compared with last month at the same location.`,
    };
  }

  return {
    title: `${topLocation.locationName} is leading ${monthLabel}`,
    message: `${topLocation.locationName} has produced ${formatCurrency(topLocation.revenue)} this month across ${topLocation.saleCount} sale${topLocation.saleCount === 1 ? "" : "s"}, making it your strongest sales channel for the month so far.`,
  };
}

function inputClassName(error?: string) {
  return `w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 ${
    error
      ? "border-[#d67aa0] focus:border-[#d67aa0] focus:ring-[#f3d4e1]"
      : "border-[color:var(--line)] focus:border-[color:var(--accent)] focus:ring-[color:var(--accent-soft)]"
  }`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatEditableNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, "");
}

function formatCompactNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, "");
}

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

async function readJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}
