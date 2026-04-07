import { DataTable } from "@/components/data-table";
import { StatCard } from "@/components/stat-card";
import {
  aiWorkbench,
  birds,
  chicks,
  currentUser,
  customers,
  dashboardStats,
  flocks,
  hatchGroups,
  orders,
  pairings,
  platformModules,
  reservations,
} from "@/lib/mock-data";

export default function DashboardPage() {
  const recentChicks = chicks.slice(0, 3).map((chick) => ({
    bandNumber: chick.bandNumber,
    hatchDate: formatDate(chick.hatchDate),
    flock: flocks.find((flock) => flock.id === chick.flockId)?.name ?? "Unknown",
    status: chick.status,
    notes: chick.notes,
  }));

  const recentOrders = orders.slice(0, 3).map((order) => ({
    customer:
      customers.find((customer) => customer.id === order.customerId)?.name ?? "Unknown",
    chickCount: String(order.chickIds.length),
    status: toTitleCase(order.status),
    pickupDate: formatDate(order.pickupDate),
  }));

  const recentHatchGroups = hatchGroups.slice(0, 3).map((group) => ({
    name: group.name,
    pairing: pairings.find((pairing) => pairing.id === group.pairingId)?.name ?? "Unknown",
    setDate: formatDate(group.setDate),
    hatchDate: formatDate(group.hatchDate),
    eggsSet: String(group.eggsSet),
    eggsHatched: String(group.eggsHatched),
  }));

  const activePairings = pairings
    .filter((pairing) => pairing.active)
    .slice(0, 3)
    .map((pairing) => ({
      name: pairing.name,
      sire: birds.find((bird) => bird.id === pairing.sireId)?.name ?? "Unknown",
      dam: birds.find((bird) => bird.id === pairing.damId)?.name ?? "Unknown",
      goals: pairing.goals,
      status: pairing.active ? "Active" : "Inactive",
    }));

  return (
    <div className="space-y-6">
      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
          Scalable SaaS Foundation
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          {currentUser.name}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
          The dashboard is structured around typed breeder entities so future
          genetics tracking, AI drafting, pairing analysis, analytics, and
          automation can plug into stable records instead of ad hoc UI state.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {dashboardStats.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            detail={card.detail}
          />
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <DataTable
          title="Recent Chicks"
          description="Newest chick records added to the brooder and reservation flow."
          columns={[
            { key: "bandNumber", label: "Band Number" },
            { key: "hatchDate", label: "Hatch Date" },
            { key: "flock", label: "Flock" },
            { key: "status", label: "Status" },
            { key: "notes", label: "Notes" },
          ]}
          rows={recentChicks}
        />
        <DataTable
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
          rows={reservations.slice(0, 3).map((reservation) => ({
            customer:
              customers.find((customer) => customer.id === reservation.customerId)?.name ??
              "Unknown",
            breed: reservation.requestedBreed,
            variety: reservation.requestedVariety,
            quantity: String(reservation.quantity),
            status: reservation.status,
            createdAt: formatDate(reservation.createdAt),
          }))}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DataTable
          title="Recent Orders"
          description="Latest customer reservations and pickup plans."
          columns={[
            { key: "customer", label: "Customer" },
            { key: "chickCount", label: "Chick Count" },
            { key: "status", label: "Status" },
            { key: "pickupDate", label: "Pickup Date" },
          ]}
          rows={recentOrders}
        />
        <DataTable
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
          rows={recentHatchGroups}
        />
      </div>

      <DataTable
        title="Active Pairings"
        description="Breeder pairs currently shaping upcoming hatch plans."
        columns={[
          { key: "name", label: "Pairing" },
          { key: "sire", label: "Sire" },
          { key: "dam", label: "Dam" },
          { key: "goals", label: "Goals" },
          { key: "status", label: "Status" },
        ]}
        rows={activePairings}
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Product Lanes
          </p>
          <div className="mt-5 space-y-4">
            {platformModules.map((module) => (
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
                <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                  {item.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function formatDate(value: string) {
  const date = value.includes("T")
    ? new Date(value)
    : new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function toTitleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
