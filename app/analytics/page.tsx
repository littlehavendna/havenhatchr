"use client";

import { useEffect, useState } from "react";

type AnalyticsPayload = {
  summary: {
    totalBirds: number;
    activePairings: number;
    totalHatchGroups: number;
    averageHatchRate: number;
    availableChicks: number;
    openReservations: number;
    completedOrders: number;
  };
  hatchPerformanceRows: Array<{
    id: string;
    name: string;
    pairing: string;
    eggsSet: number;
    eggsHatched: number;
    hatchRate: number;
    notes: string;
  }>;
  pairingPerformanceRows: Array<{
    id: string;
    pairingName: string;
    sire: string;
    dam: string;
    hatchGroupsCount: number;
    totalEggsSet: number;
    totalChicksHatched: number;
    averageHatchRate: number;
    projectGoal: string;
  }>;
  reservationPressureRows: Array<{
    id: string;
    breed: string;
    variety: string;
    sex: string;
    color: string;
    demand: number;
    availability: number;
    gap: number;
  }>;
  salesSnapshot: {
    completedOrders: number;
    pendingOrders: number;
    reservedChicks: number;
    availableChicks: number;
    pickupPreview: Array<{ id: string; pickupDate: string; status: string }>;
  };
  geneticsSnapshot: {
    mostTrackedTraits: Array<{ trait: string; count: number }>;
    mostActiveProjectTags: string[];
    birdsWithGeneticsNotes: number;
    pairingsWithTargetTraits: number;
  };
  insights: string[];
  dashboardInsights: {
    bestPerformingPairing: string;
    currentAverageHatchRate: number;
    openReservationsCount: number;
    topProjectTag: string;
  };
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [requestError, setRequestError] = useState("");
  const isEmptyWorkspace = Boolean(
    data &&
      data.summary.totalBirds === 0 &&
      data.summary.activePairings === 0 &&
      data.summary.totalHatchGroups === 0 &&
      data.summary.availableChicks === 0 &&
      data.summary.openReservations === 0 &&
      data.summary.completedOrders === 0,
  );

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const response = await fetch("/api/analytics", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Failed to load analytics.");
        }

        const payload = (await response.json()) as AnalyticsPayload;
        setData(payload);
      } catch (error) {
        setRequestError(error instanceof Error ? error.message : "Failed to load analytics.");
      }
    }

    void loadAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <section className="soft-shadow rounded-[32px] border border-[color:var(--line)] bg-white/90 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
          Premium Intelligence
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
          A breeder-focused analytics workspace for hatch performance, pairing trends,
          reservation demand, sales pressure, and genetics signals.
        </p>
        {requestError ? <p className="mt-4 text-sm text-[#b34b75]">{requestError}</p> : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
        <SummaryCard label="Total Birds" value={String(data?.summary.totalBirds ?? 0)} />
        <SummaryCard label="Active Pairings" value={String(data?.summary.activePairings ?? 0)} />
        <SummaryCard
          label="Total Hatch Groups"
          value={String(data?.summary.totalHatchGroups ?? 0)}
        />
        <SummaryCard
          label="Average Hatch Rate"
          value={`${data?.summary.averageHatchRate ?? 0}%`}
        />
        <SummaryCard
          label="Available Chicks"
          value={String(data?.summary.availableChicks ?? 0)}
        />
        <SummaryCard
          label="Open Reservations"
          value={String(data?.summary.openReservations ?? 0)}
        />
        <SummaryCard
          label="Completed Orders"
          value={String(data?.summary.completedOrders ?? 0)}
        />
      </section>

      {isEmptyWorkspace ? (
        <section className="soft-shadow rounded-[32px] border border-[color:var(--line)] bg-white/90 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Empty Workspace
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Analytics will populate as you add breeder records
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
            Start with a flock, a bird, a pairing, and a hatch group. Once real records exist,
            HavenHatchr will calculate hatch performance, reservation pressure, and genetics
            trends automatically.
          </p>
        </section>
      ) : null}

      <section className="soft-shadow overflow-hidden rounded-[32px] border border-[color:var(--line)] bg-[color:var(--panel-strong)]">
        <div className="border-b border-[color:var(--line)] px-6 py-5">
          <h2 className="text-lg font-semibold tracking-tight">Hatch Performance</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Hatch-group-level performance with simple hatch rate calculation.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-[#f5f3fd]">
              <tr>
                {[
                  "Hatch Group Name",
                  "Pairing",
                  "Eggs Set",
                  "Eggs Hatched",
                  "Hatch Rate",
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
              {(data?.hatchPerformanceRows ?? []).map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-[color:var(--line)] transition hover:bg-[#faf8ff]"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">{row.name}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{row.pairing}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{row.eggsSet}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{row.eggsHatched}</td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    <span className="rounded-full bg-[#ece7fb] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
                      {row.hatchRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm leading-7 text-[color:var(--muted)]">
                    {row.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="soft-shadow overflow-hidden rounded-[32px] border border-[color:var(--line)] bg-[color:var(--panel-strong)]">
        <div className="border-b border-[color:var(--line)] px-6 py-5">
          <h2 className="text-lg font-semibold tracking-tight">Pairing Performance</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Pairing-level outcomes aggregated from linked hatch groups.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-[#f5f3fd]">
              <tr>
                {[
                  "Pairing Name",
                  "Sire",
                  "Dam",
                  "Hatch Groups Count",
                  "Total Eggs Set",
                  "Total Chicks Hatched",
                  "Average Hatch Rate",
                  "Project Goal",
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
              {(data?.pairingPerformanceRows ?? []).map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-[color:var(--line)] transition hover:bg-[#faf8ff]"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">
                    {row.pairingName}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{row.sire}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{row.dam}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{row.hatchGroupsCount}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{row.totalEggsSet}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{row.totalChicksHatched}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{row.averageHatchRate}%</td>
                  <td className="px-6 py-4 text-sm leading-7 text-[color:var(--muted)]">
                    {row.projectGoal}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="soft-shadow rounded-[32px] border border-[color:var(--line)] bg-white/90 p-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Reservation Pressure
            </p>
            <h2 className="text-xl font-semibold tracking-tight">Demand versus current availability</h2>
          </div>
          <div className="mt-5 space-y-3">
            {(data?.reservationPressureRows ?? []).map((row) => (
              <div
                key={`${row.id}-${row.breed}-${row.variety}`}
                className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold tracking-tight">
                      {row.breed} · {row.variety}
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">
                      {row.sex} · {row.color}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
                    Gap {row.gap}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <MetricBox label="Demand" value={String(row.demand)} />
                  <MetricBox label="Available" value={String(row.availability)} />
                  <MetricBox label="Pressure" value={row.gap > 0 ? "High" : "Covered"} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="soft-shadow rounded-[32px] border border-[color:var(--line)] bg-white/90 p-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Sales Snapshot
            </p>
            <h2 className="text-xl font-semibold tracking-tight">Orders, inventory, and pickups</h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <MetricBox
              label="Completed Orders"
              value={String(data?.salesSnapshot.completedOrders ?? 0)}
            />
            <MetricBox
              label="Pending Orders"
              value={String(data?.salesSnapshot.pendingOrders ?? 0)}
            />
            <MetricBox
              label="Reserved Chicks"
              value={String(data?.salesSnapshot.reservedChicks ?? 0)}
            />
            <MetricBox
              label="Available Chicks"
              value={String(data?.salesSnapshot.availableChicks ?? 0)}
            />
          </div>
          <div className="mt-5 rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Pickup Schedule Preview
            </p>
            <div className="mt-4 space-y-3">
              {(data?.salesSnapshot.pickupPreview ?? []).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 rounded-[18px] bg-white px-4 py-3"
                >
                  <span className="text-sm font-semibold text-foreground">
                    {formatDate(item.pickupDate)}
                  </span>
                  <span className="text-sm text-[color:var(--muted)]">{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="soft-shadow rounded-[32px] border border-[color:var(--line)] bg-white/90 p-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Genetics Snapshot
            </p>
            <h2 className="text-xl font-semibold tracking-tight">Trait and project signal overview</h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <AnalyticsListCard
              title="Most Tracked Traits"
              items={(data?.geneticsSnapshot.mostTrackedTraits ?? []).map(
                (item) => `${item.trait} (${item.count})`,
              )}
            />
            <AnalyticsListCard
              title="Most Active Project Tags"
              items={data?.geneticsSnapshot.mostActiveProjectTags ?? []}
            />
            <MetricBox
              label="Birds With Genetics Notes"
              value={String(data?.geneticsSnapshot.birdsWithGeneticsNotes ?? 0)}
            />
            <MetricBox
              label="Pairings With Target Traits"
              value={String(data?.geneticsSnapshot.pairingsWithTargetTraits ?? 0)}
            />
          </div>
        </section>

        <section className="soft-shadow rounded-[32px] border border-[color:var(--line)] bg-white/90 p-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Alerts and Insights
            </p>
            <h2 className="text-xl font-semibold tracking-tight">
              Breeder-focused signals and exceptions
            </h2>
          </div>
          <div className="mt-5 space-y-3">
            {(data?.insights ?? []).map((insight) => (
              <div
                key={insight}
                className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-4 text-sm leading-7 text-foreground"
              >
                {insight}
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="soft-shadow rounded-[32px] border border-[color:var(--line)] bg-white/90 p-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Compact Insights
          </p>
          <h2 className="text-xl font-semibold tracking-tight">Core breeder indicators</h2>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricBox
            label="Best Performing Pairing"
            value={data?.dashboardInsights.bestPerformingPairing ?? "-"}
          />
          <MetricBox
            label="Current Average Hatch Rate"
            value={`${data?.dashboardInsights.currentAverageHatchRate ?? 0}%`}
          />
          <MetricBox
            label="Open Reservations Count"
            value={String(data?.dashboardInsights.openReservationsCount ?? 0)}
          />
          <MetricBox label="Top Project Tag" value={data?.dashboardInsights.topProjectTag ?? "-"} />
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="soft-shadow rounded-[24px] border border-[color:var(--line)] bg-white/88 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold leading-7 text-foreground">{value}</p>
    </div>
  );
}

function AnalyticsListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[22px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
        {title}
      </p>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item} className="rounded-[16px] bg-white px-3 py-2 text-sm text-foreground">
            {item}
          </div>
        ))}
      </div>
    </div>
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
