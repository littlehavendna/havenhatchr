import { DataTable } from "@/components/data-table";

const rows = [
  {
    bandNumber: "CH-2041",
    hatchDate: "Apr 3, 2026",
    flock: "Blue Meadow",
    status: "Available",
    notes: "Pullet hold candidate",
  },
  {
    bandNumber: "CH-2042",
    hatchDate: "Apr 3, 2026",
    flock: "Golden Fern",
    status: "Reserved",
    notes: "Reserved for Maple Row Farm",
  },
  {
    bandNumber: "CH-2043",
    hatchDate: "Apr 4, 2026",
    flock: "Silver Ridge",
    status: "Brooder",
    notes: "Observe toe alignment",
  },
  {
    bandNumber: "CH-2044",
    hatchDate: "Apr 5, 2026",
    flock: "Willow Patch",
    status: "Available",
    notes: "Ready for reservation list",
  },
];

export default function ChicksPage() {
  return (
    <DataTable
      title="Chicks"
      description="Band numbers, hatch dates, and current chick status."
      columns={[
        { key: "bandNumber", label: "Band Number" },
        { key: "hatchDate", label: "Hatch Date" },
        { key: "flock", label: "Flock" },
        { key: "status", label: "Status" },
        { key: "notes", label: "Notes" },
      ]}
      rows={rows}
    />
  );
}
