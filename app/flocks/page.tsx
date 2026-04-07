import { DataTable } from "@/components/data-table";
import { flocks } from "@/lib/mock-data";

export default function FlocksPage() {
  const rows = flocks.map((flock) => ({
    flockName: flock.name,
    breed: `${flock.breed} ${flock.variety}`.trim(),
    pairing: flock.active ? "Active" : "Inactive",
    notes: flock.notes,
  }));

  return (
    <DataTable
      title="Flocks"
      description="Breeding groups organized for future pairing outcome tools, hatch analysis, and genetics workflows."
      columns={[
        { key: "flockName", label: "Flock Name" },
        { key: "breed", label: "Breed" },
        { key: "pairing", label: "Pairing" },
        { key: "notes", label: "Notes" },
      ]}
      rows={rows}
    />
  );
}
