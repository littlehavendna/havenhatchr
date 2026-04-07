import { DataTable } from "@/components/DataTable";

const rows = [
  { metric: "Active flocks", value: "18", trend: "+2 this week", status: "Healthy" },
  { metric: "Egg collection", value: "4,280", trend: "+6.4%", status: "On target" },
  { metric: "Pending orders", value: "36", trend: "8 ship today", status: "In queue" },
  { metric: "Brooder occupancy", value: "72%", trend: "Room for 320", status: "Balanced" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        {[
          { label: "Weekly Hatch Rate", value: "92.4%", note: "Up from 89.8%" },
          { label: "Customer Retention", value: "87%", note: "Repeat farm buyers" },
          { label: "Feed Efficiency", value: "1.9x", note: "Stable across flocks" },
          { label: "Revenue Pipeline", value: "$18.6k", note: "Next 14 days booked" },
        ].map((card) => (
          <div
            key={card.label}
            className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5"
          >
            <p className="text-sm text-[color:var(--muted)]">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">{card.value}</p>
            <p className="mt-2 text-sm text-[color:var(--accent)]">{card.note}</p>
          </div>
        ))}
      </section>

      <DataTable
        title="Operations Snapshot"
        description="A quick read on the core hatchery metrics for today."
        columns={[
          { key: "metric", label: "Metric" },
          { key: "value", label: "Value" },
          { key: "trend", label: "Trend" },
          { key: "status", label: "Status" },
        ]}
        rows={rows}
      />
    </div>
  );
}
