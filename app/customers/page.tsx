import { DataTable } from "@/components/DataTable";

const rows = [
  { customer: "Green Pastures Co-op", region: "Hudson Valley", tier: "Wholesale", lastOrder: "Apr 4", status: "Active" },
  { customer: "Willow Creek Farm", region: "Lancaster", tier: "Retail", lastOrder: "Apr 2", status: "Recurring" },
  { customer: "North Ridge Homestead", region: "Vermont", tier: "Breeder", lastOrder: "Mar 29", status: "Pending quote" },
  { customer: "Sunrise Poultry", region: "Finger Lakes", tier: "Wholesale", lastOrder: "Mar 26", status: "Active" },
];

export default function CustomersPage() {
  return (
    <DataTable
      title="Customer Directory"
      description="Placeholder customer accounts for the HavenHatchr CRM view."
      columns={[
        { key: "customer", label: "Customer" },
        { key: "region", label: "Region" },
        { key: "tier", label: "Tier" },
        { key: "lastOrder", label: "Last Order" },
        { key: "status", label: "Status" },
      ]}
      rows={rows}
    />
  );
}
