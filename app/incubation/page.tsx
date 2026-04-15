"use client";

import { FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/data-table";
import { StatCard } from "@/components/stat-card";

type IncubationResponse = {
  incubators: Array<{
    id: string;
    name: string;
    brand: string;
    model: string;
    notes: string;
    active: boolean;
    runCount: number;
    eggsSet: number;
    eggsCleared: number;
    eggsQuitters: number;
    eggsHatched: number;
    hatchRate: number;
    fertilityRate: number;
    hatchOfFertileRate: number;
    deathCount: number;
    survivalRate: number;
    averageHatchRate: number;
    createdAt: string;
  }>;
  runs: Array<{
    id: string;
    incubatorId: string;
    incubatorName: string;
    hatchGroupId: string;
    hatchGroupName: string;
    startDate: string;
    lockdownDate: string;
    expectedHatchDate: string;
    temperatureNotes: string;
    humidityNotes: string;
    turningNotes: string;
    lockdownHumidityNotes: string;
    specialAdjustments: string;
    generalNotes: string;
    eggsSet: number;
    eggsCleared: number;
    eggsQuitters: number;
    eggsHatched: number;
    hatchRate: number;
    fertilityRate: number;
    hatchOfFertileRate: number;
    quitterCount: number;
    survivalRate: number;
    deathCount: number;
    createdAt: string;
    updatedAt: string;
  }>;
  hatchGroups: Array<{
    id: string;
    name: string;
    pairingName: string;
    breedDesignation: string;
    setDate: string;
    lockdownDate: string;
    hatchDate: string;
    eggsSet: number;
    eggsCleared: number;
    eggsQuitters: number;
    eggsHatched: number;
    hatchRate: number;
    fertilityRate: number;
    hatchOfFertileRate: number;
    quitterCount: number;
    chickCount: number;
    deathCount: number;
    survivalRate: number;
    availableCount: number;
    reservedCount: number;
    soldCount: number;
    incubatorName: string;
    reviewFlag: boolean;
    notes: string;
  }>;
  pairings: Array<{
    id: string;
    name: string;
    hatchGroupCount: number;
    eggsSet: number;
    eggsHatched: number;
    hatchRate: number;
  }>;
  deathRecords: Array<{
    id: string;
    chickId: string;
    chickBandNumber: string;
    hatchGroupName: string;
    deathDate: string;
    deathReason: string;
    deathReasonLabel: string;
    notes: string;
  }>;
  deathReasonSummary: Array<{ reason: string; count: number }>;
  incubatorOptions: Array<{ id: string; name: string; active: boolean }>;
  hatchGroupOptions: Array<{
    id: string;
    name: string;
    setDate: string;
    lockdownDate: string;
    expectedHatchDate: string;
  }>;
  reports: {
    bestIncubator: string;
    lowestIncubator: string;
    mostCommonDeathReason: string;
    topPairing: string;
    hatchGroupsNeedingReview: string[];
  };
};

type IncubatorForm = {
  name: string;
  brand: string;
  model: string;
  notes: string;
};

type IncubatorEditForm = IncubatorForm & {
  active: boolean;
};

type RunForm = {
  id?: string;
  incubatorId: string;
  hatchGroupId: string;
  startDate: string;
  lockdownDate: string;
  expectedHatchDate: string;
  temperatureNotes: string;
  humidityNotes: string;
  turningNotes: string;
  lockdownHumidityNotes: string;
  specialAdjustments: string;
  generalNotes: string;
};

const emptyIncubatorForm: IncubatorForm = {
  name: "",
  brand: "",
  model: "",
  notes: "",
};

const emptyRunForm: RunForm = {
  incubatorId: "",
  hatchGroupId: "",
  startDate: "",
  lockdownDate: "",
  expectedHatchDate: "",
  temperatureNotes: "",
  humidityNotes: "",
  turningNotes: "",
  lockdownHumidityNotes: "",
  specialAdjustments: "",
  generalNotes: "",
};

export default function IncubationPage() {
  const [data, setData] = useState<IncubationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requestError, setRequestError] = useState("");
  const [activeModal, setActiveModal] = useState<"incubator" | "run" | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingIncubatorId, setEditingIncubatorId] = useState<string | null>(null);
  const [isSavingIncubatorEdit, setIsSavingIncubatorEdit] = useState(false);
  const [incubatorForm, setIncubatorForm] = useState<IncubatorForm>(emptyIncubatorForm);
  const [incubatorEditForm, setIncubatorEditForm] =
    useState<IncubatorEditForm | null>(null);
  const [runForm, setRunForm] = useState<RunForm>(emptyRunForm);
  const [runFormMode, setRunFormMode] = useState<"create" | "edit">("create");

  useEffect(() => {
    void loadIncubation();
  }, []);

  async function loadIncubation() {
    try {
      setRequestError("");
      const response = await fetch("/api/incubation", { cache: "no-store" });
      const payload = await readJson<IncubationResponse & { error?: string }>(response);

      if (!response.ok) {
        throw new Error(payload.error || "Failed to load incubation data.");
      }

      setData(payload);
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : "Failed to load incubation data.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function openIncubatorModal() {
    setIncubatorForm(emptyIncubatorForm);
    setActiveModal("incubator");
  }

  function openRunModal(run?: IncubationResponse["runs"][number]) {
    if (run) {
      setRunForm({
        id: run.id,
        incubatorId: run.incubatorId,
        hatchGroupId: run.hatchGroupId,
        startDate: run.startDate,
        lockdownDate: run.lockdownDate,
        expectedHatchDate: run.expectedHatchDate,
        temperatureNotes: run.temperatureNotes,
        humidityNotes: run.humidityNotes,
        turningNotes: run.turningNotes,
        lockdownHumidityNotes: run.lockdownHumidityNotes,
        specialAdjustments: run.specialAdjustments,
        generalNotes: run.generalNotes,
      });
      setRunFormMode("edit");
    } else {
      setRunForm(emptyRunForm);
      setRunFormMode("create");
    }
    setActiveModal("run");
  }

  function syncRunDates(hatchGroupId: string) {
    const option = data?.hatchGroupOptions.find((group) => group.id === hatchGroupId);
    setRunForm((current) => ({
      ...current,
      hatchGroupId,
      startDate: option?.setDate ?? current.startDate,
      lockdownDate: option?.lockdownDate ?? current.lockdownDate,
      expectedHatchDate: option?.expectedHatchDate ?? current.expectedHatchDate,
    }));
  }

  function startEditingIncubator(incubator: IncubationResponse["incubators"][number]) {
    setEditingIncubatorId(incubator.id);
    setIncubatorEditForm({
      name: incubator.name,
      brand: incubator.brand,
      model: incubator.model,
      notes: incubator.notes,
      active: incubator.active,
    });
    setRequestError("");
  }

  function cancelEditingIncubator() {
    setEditingIncubatorId(null);
    setIncubatorEditForm(null);
  }

  async function handleCreateIncubator(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setIsSaving(true);
      const response = await fetch("/api/incubation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: incubatorForm.name.trim(),
          brand: incubatorForm.brand.trim(),
          model: incubatorForm.model.trim(),
          notes: incubatorForm.notes.trim(),
          active: true,
        }),
      });
      const payload = await readJson<{ error?: string }>(response);
      if (!response.ok) {
        throw new Error(payload.error || "Failed to create incubator.");
      }

      await loadIncubation();
      setActiveModal(null);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Failed to create incubator.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdateIncubator(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingIncubatorId || !incubatorEditForm) {
      return;
    }

    try {
      setIsSavingIncubatorEdit(true);
      const response = await fetch(`/api/incubation/${editingIncubatorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: incubatorEditForm.name.trim(),
          brand: incubatorEditForm.brand.trim(),
          model: incubatorEditForm.model.trim(),
          notes: incubatorEditForm.notes.trim(),
          active: incubatorEditForm.active,
        }),
      });
      const payload = await readJson<{ error?: string }>(response);
      if (!response.ok) {
        throw new Error(payload.error || "Failed to update incubator.");
      }

      await loadIncubation();
      cancelEditingIncubator();
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Failed to update incubator.");
    } finally {
      setIsSavingIncubatorEdit(false);
    }
  }

  async function handleSaveRun(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setIsSaving(true);
      const response = await fetch("/api/incubation/runs", {
        method: runFormMode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...runForm,
          temperatureNotes: runForm.temperatureNotes.trim(),
          humidityNotes: runForm.humidityNotes.trim(),
          turningNotes: runForm.turningNotes.trim(),
          lockdownHumidityNotes: runForm.lockdownHumidityNotes.trim(),
          specialAdjustments: runForm.specialAdjustments.trim(),
          generalNotes: runForm.generalNotes.trim(),
        }),
      });
      const payload = await readJson<{ error?: string }>(response);
      if (!response.ok) {
        throw new Error(payload.error || "Failed to save incubator run.");
      }

      await loadIncubation();
      setActiveModal(null);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Failed to save incubator run.");
    } finally {
      setIsSaving(false);
    }
  }

  const totalEggsSet = data?.hatchGroups.reduce((sum, group) => sum + group.eggsSet, 0) ?? 0;
  const totalEggsHatched =
    data?.hatchGroups.reduce((sum, group) => sum + group.eggsHatched, 0) ?? 0;
  const totalDeaths = data?.deathRecords.length ?? 0;
  const totalClears = data?.hatchGroups.reduce((sum, group) => sum + group.eggsCleared, 0) ?? 0;
  const bestIncubator = [...(data?.incubators ?? [])].sort(
    (left, right) => right.averageHatchRate - left.averageHatchRate,
  )[0];

  const monthlyTrends = useMemo(() => {
    const trendMap = new Map<
      string,
      {
        monthKey: string;
        runs: number;
        eggsSet: number;
        eggsCleared: number;
        eggsHatched: number;
        deaths: number;
      }
    >();

    for (const run of data?.runs ?? []) {
      const monthKey = run.expectedHatchDate.slice(0, 7);
      const existing = trendMap.get(monthKey) ?? {
        monthKey,
        runs: 0,
        eggsSet: 0,
        eggsCleared: 0,
        eggsHatched: 0,
        deaths: 0,
      };

      existing.runs += 1;
      existing.eggsSet += run.eggsSet;
      existing.eggsCleared += run.eggsCleared;
      existing.eggsHatched += run.eggsHatched;
      existing.deaths += run.deathCount;
      trendMap.set(monthKey, existing);
    }

    return Array.from(trendMap.values())
      .sort((left, right) => left.monthKey.localeCompare(right.monthKey))
      .slice(-6)
      .map((trend) => ({
        ...trend,
        monthLabel: formatMonthLabel(trend.monthKey),
        hatchRate: calculateRate(trend.eggsSet, trend.eggsHatched),
        fertilityRate: calculateRate(trend.eggsSet, trend.eggsSet - trend.eggsCleared),
      }));
  }, [data]);

  const currentMonthLeader = monthlyTrends[monthlyTrends.length - 1]
    ? [...(data?.incubators ?? [])]
        .map((incubator) => {
          const monthKey = monthlyTrends[monthlyTrends.length - 1]?.monthKey;
          const runs = (data?.runs ?? []).filter(
            (run) => run.incubatorId === incubator.id && run.expectedHatchDate.startsWith(monthKey),
          );

          const eggsSet = runs.reduce((sum, run) => sum + run.eggsSet, 0);
          const eggsHatched = runs.reduce((sum, run) => sum + run.eggsHatched, 0);

          return {
            name: incubator.name,
            runCount: runs.length,
            hatchRate: calculateRate(eggsSet, eggsHatched),
          };
        })
        .filter((incubator) => incubator.runCount > 0)
        .sort((left, right) => right.hatchRate - left.hatchRate)[0]
    : null;

  return (
    <>
      <div className="space-y-6">
        <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Incubation Intelligence</h2>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                Track incubators, compare hatch performance, store hatch notes, and spot loss patterns.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={openIncubatorModal}
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-[#f8f7fe]"
              >
                Add Incubator
              </button>
              <button
                type="button"
                onClick={() => openRunModal()}
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
              >
                Log Incubator Run
              </button>
            </div>
          </div>
          {requestError ? <p className="mt-4 text-sm text-[#b34b75]">{requestError}</p> : null}
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Eggs Set" value={String(totalEggsSet)} detail="Across tracked hatch groups" />
          <StatCard label="Eggs Hatched" value={String(totalEggsHatched)} detail="Real hatch outcomes in the system" />
          <StatCard label="Clears Logged" value={String(totalClears)} detail="Fertility tracking for candling review" />
          <StatCard label="Best Incubator" value={bestIncubator?.name ?? "-"} detail={bestIncubator ? `${bestIncubator.averageHatchRate}% average hatch rate` : "Add incubator runs to compare"} />
        </section>

        <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-[#edf7f8] p-5 sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--teal)]">
            Breeder Insights
          </p>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <InsightCard title="Best Performing Incubator" body={data?.reports.bestIncubator ?? "Loading..."} />
            <InsightCard title="Lowest Hatch Rate Incubator" body={data?.reports.lowestIncubator ?? "Loading..."} />
            <InsightCard title="Most Common Loss Reason" body={data?.reports.mostCommonDeathReason ?? "Loading..."} />
            <InsightCard title="Top Pairing" body={data?.reports.topPairing ?? "Loading..."} />
          </div>
          {currentMonthLeader ? (
            <div className="mt-4 rounded-[22px] border border-[color:var(--line)] bg-white px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                This Month&apos;s Leader
              </p>
              <p className="mt-2 text-sm leading-7 text-foreground">
                {currentMonthLeader.name} is leading current-month hatch performance at {currentMonthLeader.hatchRate}% across {currentMonthLeader.runCount} run{currentMonthLeader.runCount === 1 ? "" : "s"}.
              </p>
            </div>
          ) : null}
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
            <h3 className="text-lg font-semibold tracking-tight">Monthly Hatch Trends</h3>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Rolling month-by-month hatch and fertility results from tracked incubator runs.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {monthlyTrends.length > 0 ? (
                monthlyTrends.map((trend) => (
                  <article
                    key={trend.monthKey}
                    className="rounded-[22px] border border-[color:var(--line)] bg-[#fcfbff] p-4"
                  >
                    <p className="text-sm font-semibold text-foreground">{trend.monthLabel}</p>
                    <div className="mt-4 space-y-3">
                      <MiniMetric label="Runs" value={String(trend.runs)} />
                      <MiniMetric label="Hatch Rate" value={`${trend.hatchRate}%`} />
                      <MiniMetric label="Fertility" value={`${trend.fertilityRate}%`} />
                    </div>
                    <p className="mt-4 text-sm text-[color:var(--muted)]">
                      {trend.eggsHatched} of {trend.eggsSet} eggs hatched, with {trend.eggsCleared} clears and {trend.deaths} logged deaths.
                    </p>
                  </article>
                ))
              ) : (
                <EmptyBox message="Monthly trend cards will appear once you have incubator runs across one or more months." />
              )}
            </div>
          </section>

          <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
            <h3 className="text-lg font-semibold tracking-tight">Loss Pattern Summary</h3>
            <div className="mt-5 space-y-3">
              {(data?.deathReasonSummary ?? []).length > 0 ? (
                data?.deathReasonSummary.map((reason) => (
                  <div
                    key={reason.reason}
                    className="flex items-center justify-between rounded-[22px] border border-[color:var(--line)] bg-[#fcfbff] px-4 py-4"
                  >
                    <span className="text-sm font-semibold text-foreground">{reason.reason}</span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
                      {reason.count}
                    </span>
                  </div>
                ))
              ) : (
                <EmptyBox message="Death reasons will roll up here once you start logging chick losses." />
              )}
            </div>
            <div className="mt-5 rounded-[22px] border border-[color:var(--line)] bg-[#fcfbff] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Logged Loss Records
              </p>
              <p className="mt-2 text-sm leading-7 text-foreground">
                {totalDeaths > 0
                  ? `${totalDeaths} total death record${totalDeaths === 1 ? "" : "s"} captured for reporting and review.`
                  : "No chick death records have been logged yet."}
              </p>
            </div>
          </section>
        </div>

        <DataTable
          title="Incubator Runs"
          description={
            isLoading
              ? "Loading incubator runs..."
              : "Compare notes, hatch outcomes, fertility, and survival from each run over time."
          }
          columns={[
            { key: "incubator", label: "Incubator" },
            { key: "hatchGroup", label: "Hatch Group" },
            { key: "expectedHatchDate", label: "Expected Hatch" },
            { key: "fertilityRate", label: "Fertility" },
            { key: "hatchRate", label: "Hatch Rate" },
            { key: "survivalRate", label: "Survival" },
            { key: "notes", label: "Notes" },
          ]}
          rows={(data?.runs ?? []).map((run) => ({
            id: run.id,
            incubator: run.incubatorName,
            hatchGroup: run.hatchGroupName,
            expectedHatchDate: formatDate(run.expectedHatchDate),
            fertilityRate: `${run.fertilityRate}%`,
            hatchRate: `${run.hatchRate}%`,
            survivalRate: `${run.survivalRate}%`,
            notes:
              [run.temperatureNotes, run.humidityNotes, run.turningNotes, run.generalNotes]
                .filter(Boolean)
                .join(" / ") || "-",
          }))}
          renderActions={(row) => (
            <button
              type="button"
              onClick={() => openRunModal(data?.runs.find((run) => run.id === row.id))}
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--teal)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--teal)] transition hover:bg-[color:var(--teal-soft)]"
            >
              Edit
            </button>
          )}
          emptyState={{
            title: "No incubator runs yet",
            description: "Log your first run to compare hatch timing, humidity notes, and incubator performance.",
            actionLabel: "Log Incubator Run",
            onAction: () => openRunModal(),
          }}
        />

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
            <h3 className="text-lg font-semibold tracking-tight">Incubator Performance</h3>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Edit incubator details inline and compare output over time without leaving the page.
            </p>
            <div className="mt-5 space-y-3">
              {(data?.incubators ?? []).length > 0 ? (
                data?.incubators.map((incubator) => {
                  const isEditing = editingIncubatorId === incubator.id && incubatorEditForm;

                  return (
                    <article
                      key={incubator.id}
                      className="rounded-[22px] border border-[color:var(--line)] bg-[#fcfbff] p-4"
                    >
                      {isEditing ? (
                        <form onSubmit={handleUpdateIncubator} className="space-y-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <Field
                              label="Name"
                              input={
                                <input
                                  type="text"
                                  value={incubatorEditForm.name}
                                  onChange={(event) =>
                                    setIncubatorEditForm((current) =>
                                      current ? { ...current, name: event.target.value } : current,
                                    )
                                  }
                                  className={inputClassName()}
                                />
                              }
                            />
                            <Field
                              label="Brand"
                              input={
                                <input
                                  type="text"
                                  value={incubatorEditForm.brand}
                                  onChange={(event) =>
                                    setIncubatorEditForm((current) =>
                                      current ? { ...current, brand: event.target.value } : current,
                                    )
                                  }
                                  className={inputClassName()}
                                />
                              }
                            />
                            <Field
                              label="Model"
                              input={
                                <input
                                  type="text"
                                  value={incubatorEditForm.model}
                                  onChange={(event) =>
                                    setIncubatorEditForm((current) =>
                                      current ? { ...current, model: event.target.value } : current,
                                    )
                                  }
                                  className={inputClassName()}
                                />
                              }
                            />
                            <label className="flex items-center gap-3 rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm text-foreground">
                              <input
                                type="checkbox"
                                checked={incubatorEditForm.active}
                                onChange={(event) =>
                                  setIncubatorEditForm((current) =>
                                    current ? { ...current, active: event.target.checked } : current,
                                  )
                                }
                                className="h-4 w-4 rounded border-[color:var(--line)]"
                              />
                              Active incubator
                            </label>
                          </div>
                          <Field
                            label="Notes"
                            input={
                              <textarea
                                value={incubatorEditForm.notes}
                                onChange={(event) =>
                                  setIncubatorEditForm((current) =>
                                    current ? { ...current, notes: event.target.value } : current,
                                  )
                                }
                                rows={3}
                                className={`${inputClassName()} resize-none`}
                              />
                            }
                          />
                          <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                              type="submit"
                              disabled={isSavingIncubatorEdit}
                              className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0] disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {isSavingIncubatorEdit ? "Saving..." : "Save Changes"}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditingIncubator}
                              className="inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-[#f8f7fe]"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-base font-semibold tracking-tight">{incubator.name}</p>
                              <p className="mt-1 text-sm text-[color:var(--muted)]">
                                {[incubator.brand, incubator.model].filter(Boolean).join(" ") || "No brand/model logged"}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
                                {incubator.active ? "Active" : "Inactive"}
                              </span>
                              <button
                                type="button"
                                onClick={() => startEditingIncubator(incubator)}
                                className="inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-foreground transition hover:bg-[#f8f7fe]"
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                          <div className="mt-4 grid gap-3 sm:grid-cols-4">
                            <MiniMetric label="Avg Hatch" value={`${incubator.averageHatchRate}%`} />
                            <MiniMetric label="Fertility" value={`${incubator.fertilityRate}%`} />
                            <MiniMetric label="Runs" value={String(incubator.runCount)} />
                            <MiniMetric label="Survival" value={`${incubator.survivalRate}%`} />
                          </div>
                          <p className="mt-4 text-sm text-[color:var(--muted)]">
                            {incubator.eggsHatched} hatched from {incubator.eggsSet} eggs set, with {incubator.eggsCleared} clears and {incubator.eggsQuitters} quitters logged.
                          </p>
                          {incubator.notes ? (
                            <p className="mt-2 text-sm text-[color:var(--muted)]">{incubator.notes}</p>
                          ) : null}
                        </>
                      )}
                    </article>
                  );
                })
              ) : (
                <EmptyBox message="Add an incubator to start comparing hatch performance over time." />
              )}
            </div>
          </section>

          <DataTable
            title="Incubator Comparison"
            description="Side-by-side breeder metrics for equipment decisions and review."
            columns={[
              { key: "name", label: "Incubator" },
              { key: "runs", label: "Runs" },
              { key: "fertility", label: "Fertility" },
              { key: "hatchRate", label: "Hatch Rate" },
              { key: "survival", label: "Survival" },
            ]}
            rows={(data?.incubators ?? []).map((incubator) => ({
              name: incubator.name,
              runs: String(incubator.runCount),
              fertility: `${incubator.fertilityRate}%`,
              hatchRate: `${incubator.averageHatchRate}%`,
              survival: `${incubator.survivalRate}%`,
            }))}
            emptyState={{
              title: "No incubator comparisons yet",
              description: "Add incubators and runs to compare fertility, hatch rate, and survival side by side.",
            }}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <DataTable
            title="Hatch Groups Needing Review"
            description="Groups with low hatch rate or recorded chick losses."
            columns={[
              { key: "name", label: "Hatch Group" },
              { key: "pairing", label: "Pairing" },
              { key: "fertilityRate", label: "Fertility" },
              { key: "hatchRate", label: "Hatch Rate" },
              { key: "deathCount", label: "Deaths" },
            ]}
            rows={(data?.hatchGroups ?? [])
              .filter((group) => group.reviewFlag)
              .map((group) => ({
                name: group.name,
                pairing: group.pairingName,
                fertilityRate: `${group.fertilityRate}%`,
                hatchRate: `${group.hatchRate}%`,
                deathCount: String(group.deathCount),
              }))}
            emptyState={{
              title: "No hatch groups need review",
              description: "Current hatch groups are not flagged for low hatch rate or losses.",
            }}
          />

          <DataTable
            title="Pairing Performance"
            description="Compare hatch success by breeder pairing."
            columns={[
              { key: "name", label: "Pairing" },
              { key: "groups", label: "Hatch Groups" },
              { key: "eggsSet", label: "Eggs Set" },
              { key: "eggsHatched", label: "Eggs Hatched" },
              { key: "hatchRate", label: "Hatch Rate" },
            ]}
            rows={(data?.pairings ?? []).map((pairing) => ({
              name: pairing.name,
              groups: String(pairing.hatchGroupCount),
              eggsSet: String(pairing.eggsSet),
              eggsHatched: String(pairing.eggsHatched),
              hatchRate: `${pairing.hatchRate}%`,
            }))}
            emptyState={{
              title: "No pairing performance yet",
              description: "Create hatch groups from pairings to compare pairing success here.",
            }}
          />
        </div>

      </div>

      {activeModal === "incubator" ? (
        <Modal
          title="Add Incubator"
          subtitle="Save the incubators you use so every run is tied back to real equipment."
          onClose={() => setActiveModal(null)}
        >
          <form onSubmit={handleCreateIncubator} className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field
              label="Name"
              input={
                <input
                  type="text"
                  value={incubatorForm.name}
                  onChange={(event) =>
                    setIncubatorForm((current) => ({ ...current, name: event.target.value }))
                  }
                  className={inputClassName()}
                />
              }
            />
            <Field
              label="Brand"
              input={
                <input
                  type="text"
                  value={incubatorForm.brand}
                  onChange={(event) =>
                    setIncubatorForm((current) => ({ ...current, brand: event.target.value }))
                  }
                  className={inputClassName()}
                />
              }
            />
            <Field
              label="Model"
              input={
                <input
                  type="text"
                  value={incubatorForm.model}
                  onChange={(event) =>
                    setIncubatorForm((current) => ({ ...current, model: event.target.value }))
                  }
                  className={inputClassName()}
                />
              }
            />
            <div className="sm:col-span-2">
              <Field
                label="Notes"
                input={
                  <textarea
                    value={incubatorForm.notes}
                    onChange={(event) =>
                      setIncubatorForm((current) => ({ ...current, notes: event.target.value }))
                    }
                    rows={4}
                    className={`${inputClassName()} resize-none`}
                  />
                }
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? "Saving..." : "Save Incubator"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {activeModal === "run" ? (
        <Modal
          title={runFormMode === "edit" ? "Edit Incubator Run" : "Log Incubator Run"}
          subtitle="Connect a hatch group to an incubator and save the notes breeders need later."
          onClose={() => setActiveModal(null)}
        >
          <form onSubmit={handleSaveRun} className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field
              label="Incubator"
              input={
                <select
                  value={runForm.incubatorId}
                  onChange={(event) =>
                    setRunForm((current) => ({ ...current, incubatorId: event.target.value }))
                  }
                  className={inputClassName()}
                >
                  <option value="">Select incubator</option>
                  {data?.incubatorOptions
                    .filter((option) => option.active)
                    .map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                </select>
              }
            />
            <Field
              label="Hatch Group"
              input={
                <select
                  value={runForm.hatchGroupId}
                  onChange={(event) => syncRunDates(event.target.value)}
                  className={inputClassName()}
                >
                  <option value="">Select hatch group</option>
                  {data?.hatchGroupOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              }
            />
            <Field
              label="Start Date"
              input={
                <input
                  type="date"
                  value={runForm.startDate}
                  onChange={(event) =>
                    setRunForm((current) => ({ ...current, startDate: event.target.value }))
                  }
                  className={inputClassName()}
                />
              }
            />
            <Field
              label="Lockdown Date"
              input={
                <input
                  type="date"
                  value={runForm.lockdownDate}
                  onChange={(event) =>
                    setRunForm((current) => ({ ...current, lockdownDate: event.target.value }))
                  }
                  className={inputClassName()}
                />
              }
            />
            <Field
              label="Expected Hatch Date"
              input={
                <input
                  type="date"
                  value={runForm.expectedHatchDate}
                  onChange={(event) =>
                    setRunForm((current) => ({
                      ...current,
                      expectedHatchDate: event.target.value,
                    }))
                  }
                  className={inputClassName()}
                />
              }
            />
            <Field
              label="Temperature Notes"
              input={
                <textarea
                  value={runForm.temperatureNotes}
                  onChange={(event) =>
                    setRunForm((current) => ({
                      ...current,
                      temperatureNotes: event.target.value,
                    }))
                  }
                  rows={3}
                  className={`${inputClassName()} resize-none`}
                />
              }
            />
            <Field
              label="Humidity Notes"
              input={
                <textarea
                  value={runForm.humidityNotes}
                  onChange={(event) =>
                    setRunForm((current) => ({
                      ...current,
                      humidityNotes: event.target.value,
                    }))
                  }
                  rows={3}
                  className={`${inputClassName()} resize-none`}
                />
              }
            />
            <Field
              label="Turning Notes"
              input={
                <textarea
                  value={runForm.turningNotes}
                  onChange={(event) =>
                    setRunForm((current) => ({ ...current, turningNotes: event.target.value }))
                  }
                  rows={3}
                  className={`${inputClassName()} resize-none`}
                />
              }
            />
            <Field
              label="Lockdown Humidity"
              input={
                <textarea
                  value={runForm.lockdownHumidityNotes}
                  onChange={(event) =>
                    setRunForm((current) => ({
                      ...current,
                      lockdownHumidityNotes: event.target.value,
                    }))
                  }
                  rows={3}
                  className={`${inputClassName()} resize-none`}
                />
              }
            />
            <Field
              label="Special Adjustments"
              input={
                <textarea
                  value={runForm.specialAdjustments}
                  onChange={(event) =>
                    setRunForm((current) => ({
                      ...current,
                      specialAdjustments: event.target.value,
                    }))
                  }
                  rows={3}
                  className={`${inputClassName()} resize-none`}
                />
              }
            />
            <div className="sm:col-span-2">
              <Field
                label="General Notes"
                input={
                  <textarea
                    value={runForm.generalNotes}
                    onChange={(event) =>
                      setRunForm((current) => ({ ...current, generalNotes: event.target.value }))
                    }
                    rows={4}
                    className={`${inputClassName()} resize-none`}
                  />
                }
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? "Saving..." : runFormMode === "edit" ? "Update Run" : "Save Run"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </>
  );
}

function Modal({
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#221c3f]/40 px-4 backdrop-blur-sm">
      <div className="soft-shadow max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[30px] border border-[color:var(--line)] bg-white p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
            <p className="mt-1 text-sm text-[color:var(--muted)]">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[color:var(--line)] px-3 py-2 text-sm text-[color:var(--muted)] transition hover:bg-[#f8f7fe]"
          >
            Cancel
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function InsightCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[22px] border border-[color:var(--line)] bg-white px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
        {title}
      </p>
      <p className="mt-2 text-sm leading-7 text-foreground">{body}</p>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Field({ label, input }: { label: string; input: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
        {label}
      </span>
      {input}
    </label>
  );
}

function EmptyBox({ message }: { message: string }) {
  return (
    <div className="rounded-[22px] border border-dashed border-[color:var(--line)] bg-[#fcfbff] p-4 text-sm text-[color:var(--muted)]">
      {message}
    </div>
  );
}

function inputClassName() {
  return "w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatMonthLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}-01T00:00:00`));
}

function calculateRate(total: number, part: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((part / total) * 100);
}

async function readJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}
