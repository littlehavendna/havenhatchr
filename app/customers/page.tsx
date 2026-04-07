import { DataTable } from "@/components/data-table";
import { customers, reservations } from "@/lib/mock-data";

export default function CustomersPage() {
  const rows = customers.map((customer) => ({
    name: customer.name,
    contact: customer.email,
    reserved: `${reservations.filter((reservation) => reservation.customerId === customer.id).length} reservations`,
    notes: customer.notes,
  }));

  return (
    <DataTable
      title="Customers"
      description="CRM-ready customer records mapped for reservations, notes, waitlists, and future AI message drafting."
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
