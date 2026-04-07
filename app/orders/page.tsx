import { DataTable } from "@/components/DataTable";

const rows = [
  { order: "#HH-1024", customer: "Green Pastures Co-op", window: "Apr 10", quantity: "220 chicks", status: "Confirmed" },
  { order: "#HH-1025", customer: "Willow Creek Farm", window: "Apr 11", quantity: "140 chicks", status: "Packing" },
  { order: "#HH-1026", customer: "North Ridge Homestead", window: "Apr 13", quantity: "80 chicks", status: "Awaiting payment" },
  { order: "#HH-1027", customer: "Sunrise Poultry", window: "Apr 15", quantity: "300 chicks", status: "Reserved" },
];

export default function OrdersPage() {
  return (
    <DataTable
      title="Order Queue"
      description="Placeholder orders tied to upcoming hatch and fulfillment dates."
      columns={[
        { key: "order", label: "Order" },
        { key: "customer", label: "Customer" },
        { key: "window", label: "Pickup Window" },
        { key: "quantity", label: "Quantity" },
        { key: "status", label: "Status" },
      ]}
      rows={rows}
    />
  );
}
