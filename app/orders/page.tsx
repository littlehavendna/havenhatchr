import { DataTable } from "@/components/data-table";
import { customers, orders } from "@/lib/mock-data";

export default function OrdersPage() {
  const rows = orders.map((order) => ({
    customer:
      customers.find((customer) => customer.id === order.customerId)?.name ?? "Unknown",
    chickCount: String(order.chickIds.length),
    status: toTitleCase(order.status),
    pickupDate: formatDate(order.pickupDate),
  }));

  return (
    <DataTable
      title="Orders"
      description="Order records shaped for fulfillment, analytics, waitlist conversion, and future automation."
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

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function toTitleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
