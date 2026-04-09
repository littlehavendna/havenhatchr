"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/data-table";
import { StatCard } from "@/components/stat-card";

type DashboardStat = {
  label: string;
  value: string;
  detail: string;
};

type DashboardData = {
  stats: DashboardStat[];
  onboardingChecklist: {
    completedCount: number;
    totalCount: number;
    items: Array<{
      key: string;
      label: string;
      description: string;
      href: string;
      complete: boolean;
    }>;
  };
  recentChicks: Array<Record<string, string>>;
  recentReservations: Array<Record<string, string>>;
  recentOrders: Array<Record<string, string>>;
  recentHatchGroups: Array<Record<string, string>>;
  recentBirds: Array<Record<string, string>>;
  activePairings: Array<Record<string, string>>;
};

type AnalyticsData = {
  geneticsSnapshot: {
    mostTrackedTraits: Array<{ trait: string; count: number }>;
    mostActiveProjectTags: string[];
  };
  dashboardInsights: {
    bestPerformingPairing: string;
    currentAverageHatchRate: number;
    openReservationsCount: number;
    topProjectTag: string;
  };
  activeGoalPairings?: Array<{ name: string; projectGoal: string }>;
};

const productLanes = [
  {
    title: "Genetics Tracking",
    description:
      "Bird, Trait, Pairing, and HatchGroup entities are structured for lineage review, trait planning, and future genetics intelligence.",
  },
  {
    title: "AI Assistant",
    description:
      "The shared type system makes it easier to build farm-aware answers and assistant workflows on top of structured breeder data.",
  },
  {
    title: "Listing Text & Message Drafts",
    description:
      "Customers, chicks, notes, photos, and genetics context are organized so future AI tools can draft clean outbound content.",
  },
  {
    title: "Analytics & Automation",
    description:
      "Reservations, pairings, hatch results, and trait outcomes are centralized for dashboards and breeder automations.",
  },
];

const aiWorkbench = [
  {
    lane: "Pairing Outcome Tools",
    summary: "Use pairings, hatch groups, and chick outcomes to guide future breeder decisions.",
    readiness: "Planned",
  },
  {
    lane: "AI Listing Drafts",
    summary: "Generate polished listing copy from chick traits, breeder notes, photos, and project tags.",
    readiness: "Stub ready",
  },
  {
    lane: "Customer Reply Drafts",
    summary: "Draft customer reservation updates and pickup reminders from order state.",
    readiness: "Stub ready",
  },
  {
    lane: "Hatch Analytics",
    summary: "Analyze eggs set, hatch rate, genetic goals, and downstream reservation performance.",
    readiness: "Data mapped",
  },
];

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    hasCompletedTutorial: boolean;
  } | null>(null);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [dashboardResponse, analyticsResponse, currentUserResponse] = await Promise.all([
          fetch("/api/dashboard", { cache: "no-store" }),
          fetch("/api/analytics", { cache: "no-store" }),
          fetch("/api/auth/me", { cache: "no-store" }),
        ]);

        if (!dashboardResponse.ok || !analyticsResponse.ok || !currentUserResponse.ok) {
          throw new Error("Failed to load dashboard data.");
        }

        const [dashboardData, analyticsData, currentUserData] = await Promise.all([
          dashboardResponse.json() as Promise<DashboardData>,
          analyticsResponse.json() as Promise<AnalyticsData>,
          currentUserResponse.json() as Promise<{ user: { hasCompletedTutorial: boolean } }>,
        ]);

        setDashboard(dashboardData);
        setAnalytics(analyticsData);
        setCurrentUser(currentUserData.user);
      } catch (error) {
        setRequestError(
          error instanceof Error ? error.message : "Failed to load dashboard data.",
        );
      }
    }

    void loadData();
  }, []);

  const commonTraits = analytics?.geneticsSnapshot.mostTrackedTraits ?? [];
  const recentProjectTags = analytics?.geneticsSnapshot.mostActiveProjectTags ?? [];
  const activeGoalPairings = analytics?.activeGoalPairings ?? [];
  const dashboardInsights = analytics?.dashboardInsights;
  const checklist = dashboard?.onboardingChecklist;
  const hasAnyOperationalData = Boolean(
    dashboard &&
      (dashboard.stats.some((stat) => Number(stat.value) > 0) ||
        dashboard.recentBirds.length > 0 ||
        dashboard.recentChicks.length > 0 ||
        dashboard.recentReservations.length > 0 ||
        dashboard.recentOrders.length > 0 ||
        dashboard.recentHatchGroups.length > 0 ||
        dashboard.activePairings.length > 0),
  );
  const shouldShowChecklist = Boolean(
    checklist &&
      (!currentUser?.hasCompletedTutorial || checklist.completedCount < checklist.totalCount),
  );
  const isChecklistComplete = Boolean(
    checklist && checklist.completedCount === checklist.totalCount,
  );

  return (
    <div className="space-y-6">
      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
          Scalable SaaS Foundation
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">HavenHatchr</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
          The dashboard is now loading breeder operations from PostgreSQL through Prisma while
          preserving the current HavenHatchr UI structure.
        </p>
        {requestError ? <p className="mt-4 text-sm text-[#b34b75]">{requestError}</p> : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {(dashboard?.stats ?? []).map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} detail={card.detail} />
        ))}
      </section>

      {!hasAnyOperationalData && !requestError ? (
        <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Clean Start
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Your breeder workspace is ready for real data
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
            New accounts now start empty by default. Use the checklist below to add your first
            flock, bird, chick, pairing, and reservation instead of working around fake starter
            records.
          </p>
        </section>
      ) : null}

      {shouldShowChecklist && checklist ? (
        <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Getting Started
              </p>
              <h2 className="text-xl font-semibold tracking-tight">New breeder checklist</h2>
              <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                Complete a few core setup actions to get HavenHatchr working for your operation.
              </p>
            </div>
            <span className="rounded-full border border-[color:var(--line)] bg-[#fcfbff] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
              {checklist.completedCount} of {checklist.totalCount} completed
            </span>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#efeaf8]">
            <div
              className="h-full rounded-full bg-[color:var(--accent)] transition-all"
              style={{ width: `${(checklist.completedCount / checklist.totalCount) * 100}%` }}
            />
          </div>
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {checklist.items.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="rounded-[22px] border border-[color:var(--line)] bg-[#fcfbff] px-4 py-4 transition hover:bg-white"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                      {item.description}
                    </p>
                  </div>
                  <span
                    className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full border px-2 text-xs font-semibold uppercase tracking-[0.16em] ${
                      item.complete
                        ? "border-[#b9e5cf] bg-[#edf9f1] text-[#2b8a57]"
                        : "border-[color:var(--line)] bg-white text-[color:var(--muted)]"
                    }`}
                  >
                    {item.complete ? "Done" : "Open"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {isChecklistComplete ? (
        <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            You&apos;re All Set
          </p>
          <p className="mt-2 text-base leading-7 text-[color:var(--muted)]">
            Your key breeder records are in place. From here, use the dashboard, genetics tools,
            and analytics views to grow the workflow at your own pace.
          </p>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <DataTable<Record<string, string>>
          title="Recent Chicks"
          description="Newest chick records added to the brooder and reservation flow."
          columns={[
            { key: "bandNumber", label: "Band Number" },
            { key: "hatchDate", label: "Hatch Date" },
            { key: "flock", label: "Flock" },
            { key: "status", label: "Status" },
            { key: "notes", label: "Notes" },
          ]}
          rows={dashboard?.recentChicks ?? []}
          emptyState={{
            title: "No chicks yet",
            description: "Add your first chick to start tracking hatch outcomes and inventory.",
            actionLabel: "Add your first chick",
            onAction: () => {
              window.location.href = "/chicks";
            },
          }}
        />
        <DataTable<Record<string, string>>
          title="Recent Reservations"
          description="Newest customer requests waiting to be matched or fulfilled."
          columns={[
            { key: "customer", label: "Customer" },
            { key: "breed", label: "Breed" },
            { key: "variety", label: "Variety" },
            { key: "quantity", label: "Quantity" },
            { key: "status", label: "Status" },
            { key: "createdAt", label: "Created" },
          ]}
          rows={(dashboard?.recentReservations ?? []).map((reservation) => ({
            ...reservation,
            createdAt: formatDateTime(reservation.createdAt),
          }))}
          emptyState={{
            title: "No reservations yet",
            description: "Reservations will appear here once customers start requesting birds or chicks.",
            actionLabel: "Add your first reservation",
            onAction: () => {
              window.location.href = "/reservations";
            },
          }}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DataTable<Record<string, string>>
          title="Recent Orders"
          description="Latest customer reservations and pickup plans."
          columns={[
            { key: "customer", label: "Customer" },
            { key: "chickCount", label: "Chick Count" },
            { key: "status", label: "Status" },
            { key: "pickupDate", label: "Pickup Date" },
          ]}
          rows={(dashboard?.recentOrders ?? []).map((order) => ({
            ...order,
            status: toTitleCase(order.status),
            pickupDate: formatDate(order.pickupDate),
          }))}
          emptyState={{
            title: "No orders yet",
            description: "Orders show up here after you start assigning chicks to customer pickups.",
            actionLabel: "Create an order",
            onAction: () => {
              window.location.href = "/orders";
            },
          }}
        />
        <DataTable<Record<string, string>>
          title="Recent Hatch Groups"
          description="Newest incubator groups and hatch batches."
          columns={[
            { key: "name", label: "Hatch Group" },
            { key: "pairing", label: "Pairing" },
            { key: "setDate", label: "Set Date" },
            { key: "hatchDate", label: "Hatch Date" },
            { key: "eggsSet", label: "Eggs Set" },
            { key: "eggsHatched", label: "Eggs Hatched" },
          ]}
          rows={(dashboard?.recentHatchGroups ?? []).map((group) => ({
            ...group,
            setDate: formatDate(group.setDate),
            hatchDate: formatDate(group.hatchDate),
          }))}
          emptyState={{
            title: "No hatch groups yet",
            description: "Track your first incubator batch to unlock hatch-rate analytics.",
            actionLabel: "Add a hatch group",
            onAction: () => {
              window.location.href = "/hatch-groups";
            },
          }}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DataTable<Record<string, string>>
          title="Recent Birds"
          description="Newest breeder records added to the central bird directory."
          columns={[
            { key: "name", label: "Name" },
            { key: "bandNumber", label: "Band Number" },
            { key: "flock", label: "Flock" },
            { key: "sex", label: "Sex" },
            { key: "status", label: "Status" },
          ]}
          rows={dashboard?.recentBirds ?? []}
          emptyState={{
            title: "No birds yet",
            description: "Bird records power pairings, genetics, notes, and breeder history.",
            actionLabel: "Add your first bird",
            onAction: () => {
              window.location.href = "/birds";
            },
          }}
        />
        <DataTable<Record<string, string>>
          title="Active Pairings"
          description="Breeder pairs currently shaping upcoming hatch plans."
          columns={[
            { key: "name", label: "Pairing" },
            { key: "sire", label: "Sire" },
            { key: "dam", label: "Dam" },
            { key: "goals", label: "Goals" },
            { key: "status", label: "Status" },
          ]}
          rows={dashboard?.activePairings ?? []}
          emptyState={{
            title: "No active pairings yet",
            description: "Create your first pairing to start planning hatch groups and breeding goals.",
            actionLabel: "Create your first pairing",
            onAction: () => {
              window.location.href = "/pairings";
            },
          }}
        />
      </div>

      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Genetics Snapshot
          </p>
          <h2 className="text-xl font-semibold tracking-tight">Current trait and project signals</h2>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          <div className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfaff] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Most Common Tracked Traits
            </p>
            <div className="mt-4 space-y-3">
              {commonTraits.map((entry) => (
                <div key={entry.trait} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-foreground">{entry.trait}</span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
                    {entry.count} birds
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-[color:var(--line)] bg-[#edf7f8] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Recent Project Tags
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {recentProjectTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--teal)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-[color:var(--line)] bg-[#f7f5ff] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Pairings With Active Genetic Goals
            </p>
            <div className="mt-4 space-y-3">
              {activeGoalPairings.map((pairing) => (
                <div key={pairing.name} className="rounded-[18px] bg-white px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">{pairing.name}</p>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">{pairing.projectGoal}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            AI Quick Tools
          </p>
          <h2 className="text-xl font-semibold tracking-tight">
            Jump into the first breeder AI workflows
          </h2>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <QuickToolLink href="/ai?tool=listing" label="Generate Listing" />
          <QuickToolLink href="/ai?tool=notes" label="Summarize Notes" />
          <QuickToolLink href="/ai?tool=reply" label="Draft Reply" />
          <QuickToolLink href="/ai?tool=pairing" label="Suggest Pairing" />
        </div>
      </section>

      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Insights
          </p>
          <h2 className="text-xl font-semibold tracking-tight">Compact breeder intelligence</h2>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <InsightPill
            label="Best Performing Pairing"
            value={dashboardInsights?.bestPerformingPairing ?? "-"}
          />
          <InsightPill
            label="Current Average Hatch Rate"
            value={
              dashboardInsights ? `${dashboardInsights.currentAverageHatchRate}%` : "-"
            }
          />
          <InsightPill
            label="Open Reservations Count"
            value={dashboardInsights ? String(dashboardInsights.openReservationsCount) : "-"}
          />
          <InsightPill label="Top Project Tag" value={dashboardInsights?.topProjectTag ?? "-"} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Product Lanes
          </p>
          <div className="mt-5 space-y-4">
            {productLanes.map((module) => (
              <div
                key={module.title}
                className="rounded-[22px] border border-[color:var(--line)] bg-[#fcfaff] p-4"
              >
                <p className="text-base font-semibold tracking-tight">{module.title}</p>
                <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                  {module.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            AI & Automation Workbench
          </p>
          <div className="mt-5 space-y-4">
            {aiWorkbench.map((item) => (
              <div
                key={item.lane}
                className="rounded-[22px] border border-[color:var(--line)] bg-[#edf7f8] p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-base font-semibold tracking-tight">{item.lane}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--teal)]">
                    {item.readiness}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{item.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function QuickToolLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-[22px] border border-[color:var(--line)] bg-[#fcfbff] px-4 py-4 text-sm font-semibold text-foreground transition hover:bg-white"
    >
      {label}
    </Link>
  );
}

function InsightPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-[color:var(--line)] bg-[#fcfbff] px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold leading-7 text-foreground">{value}</p>
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

function formatDateTime(value: string) {
  const date = new Date(value);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function toTitleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
