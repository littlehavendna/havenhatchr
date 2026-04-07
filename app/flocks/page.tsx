import { DataTable } from "@/components/DataTable";

const rows = [
  { flock: "Aurora Layers", breed: "ISA Brown", count: "540", collection: "1,920 eggs", health: "Excellent" },
  { flock: "Meadowline", breed: "Rhode Island Red", count: "320", collection: "1,060 eggs", health: "Stable" },
  { flock: "Pinecrest", breed: "Barred Rock", count: "270", collection: "840 eggs", health: "Watch feed" },
  { flock: "Silver Brook", breed: "Australorp", count: "410", collection: "1,380 eggs", health: "Excellent" },
];

export default function FlocksPage() {
  return (
    <DataTable
      title="Flock Overview"
      description="Example flock records with breed mix, counts, and collection output."
      columns={[
        { key: "flock", label: "Flock" },
        { key: "breed", label: "Breed" },
        { key: "count", label: "Bird Count" },
        { key: "collection", label: "Egg Collection" },
        { key: "health", label: "Health" },
      ]}
      rows={rows}
    />
  );
}
