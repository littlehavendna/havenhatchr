import { DataTable } from "@/components/data-table";
import { StatCard } from "@/components/stat-card";

const recentChicks = [
  {
    bandNumber: "CH-2041",
    hatchDate: "Apr 3, 2026",
    flock: "Blue Meadow",
    status: "Available",
    notes: "Blue copper Marans pullet",
  },
  {
    bandNumber: "CH-2042",
    hatchDate: "Apr 3, 2026",
    flock: "Golden Fern",
    status: "Reserved",
    notes: "Hold for weekend pickup",
  },
  {
    bandNumber: "CH-2043",
    hatchDate: "Apr 4, 2026",
    flock: "Silver Ridge",
    status: "Brooder",
    notes: "Needs leg band check",
  },
];

const recentOrders = [
  {
    customer: "Maple Row Farm",
    chickCount: "12",
    status: "Reserved",
    pickupDate: "Apr 12, 2026",
  },
  {
    customer: "Clover Hen Co.",
    chickCount: "8",
    status: "Pending",
    pickupDate: "Apr 14, 2026",
  },
  {
    customer: "Elm Hollow Homestead",
    chickCount: "16",
    status: "Ready",
    pickupDate: "Apr 16, 2026",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Customers",
            value: "28",
            detail: "4 new reservations this week",
          },
          {
            label: "Active Flocks",
            value: "11",
            detail: "Breeding groups currently tracked",
          },
          {
            label: "Chicks Available",
            value: "46",
            detail: "Across open hatch groups",
          },
          {
            label: "Reserved Chicks",
            value: "31",
            detail: "Assigned to customer pickups",
          },
        ].map((card) => (
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
      </div>
    </div>
  );
}
