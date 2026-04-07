import { DataTable } from "@/components/data-table";

const rows = [
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
  {
    customer: "Oak & Grain Farm",
    chickCount: "4",
    status: "Awaiting hatch",
    pickupDate: "Apr 19, 2026",
  },
];

export default function OrdersPage() {
  return (
    <DataTable
      title="Orders"
      description="Customer chick counts, order status, and planned pickup dates."
      columns={[
        { key: "customer", label: "Customer" },
        { key: "chickCount", label: "Chick Count" },
        { key: "status", label: "Status" },
        { key: "pickupDate", label: "Pickup Date" },
      ]}
      rows={rows}
    />
  );
}
