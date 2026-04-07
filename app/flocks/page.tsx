import { DataTable } from "@/components/data-table";

const rows = [
  {
    flockName: "Blue Meadow",
    breed: "Blue Copper Marans",
    pairing: "Pen A",
    notes: "Strong fertility this month",
  },
  {
    flockName: "Golden Fern",
    breed: "Buff Orpington",
    pairing: "Pen C",
    notes: "Steady customer demand",
  },
  {
    flockName: "Silver Ridge",
    breed: "Ameraucana",
    pairing: "Pen B",
    notes: "Egg color tracking active",
  },
  {
    flockName: "Willow Patch",
    breed: "Olive Egger",
    pairing: "Grow-out pen",
    notes: "New pair introduced",
  },
];

export default function FlocksPage() {
  return (
    <DataTable
      title="Flocks"
      description="Current breeding flocks, pairings, and general notes."
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
