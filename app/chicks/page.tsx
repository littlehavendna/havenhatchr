import { DataTable } from "@/components/DataTable";

const rows = [
  { batch: "CHK-2407", breed: "Easter Egger", age: "5 days", brooder: "North Wing", status: "Strong" },
  { batch: "CHK-2408", breed: "Buff Orpington", age: "8 days", brooder: "Sun Room", status: "Ready soon" },
  { batch: "CHK-2409", breed: "Ameraucana", age: "2 days", brooder: "North Wing", status: "Monitoring" },
  { batch: "CHK-2410", breed: "Speckled Sussex", age: "11 days", brooder: "South Bay", status: "Strong" },
];

export default function ChicksPage() {
  return (
    <DataTable
      title="Chick Batches"
      description="Placeholder brooder batches and readiness status for current chicks."
      columns={[
        { key: "batch", label: "Batch" },
        { key: "breed", label: "Breed" },
        { key: "age", label: "Age" },
        { key: "brooder", label: "Brooder" },
        { key: "status", label: "Status" },
      ]}
      rows={rows}
    />
  );
}
