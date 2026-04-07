import { DataTable } from "@/components/data-table";

const rows = [
  {
    name: "Maple Row Farm",
    contact: "maplerow@example.com",
    reserved: "12 chicks",
    notes: "Prefers Saturday pickup",
  },
  {
    name: "Clover Hen Co.",
    contact: "555-214-8874",
    reserved: "8 chicks",
    notes: "Blue egg layers requested",
  },
  {
    name: "Elm Hollow Homestead",
    contact: "elmhollow@example.com",
    reserved: "16 chicks",
    notes: "Repeat customer",
  },
  {
    name: "Oak & Grain Farm",
    contact: "555-782-1313",
    reserved: "4 chicks",
    notes: "Waiting on hatch confirmation",
  },
];

export default function CustomersPage() {
  return (
    <DataTable
      title="Customers"
      description="Customer reservations, contact details, and pickup notes."
      columns={[
        { key: "name", label: "Name" },
        { key: "contact", label: "Contact" },
        { key: "reserved", label: "Reserved" },
        { key: "notes", label: "Notes" },
      ]}
      rows={rows}
    />
  );
}
