import { DataTable } from "@/components/DataTable";

const rows = [
  { setting: "Notification Digest", value: "Enabled", owner: "Ops Team", updated: "Apr 5" },
  { setting: "Inventory Sync", value: "Every 30 min", owner: "Automation", updated: "Apr 3" },
  { setting: "Customer Portal", value: "Preview mode", owner: "Sales", updated: "Apr 1" },
  { setting: "Brand Theme", value: "Soft farm-tech", owner: "Admin", updated: "Mar 28" },
];

export default function SettingsPage() {
  return (
    <DataTable
      title="Workspace Settings"
      description="Example configuration records for account and dashboard preferences."
      columns={[
        { key: "setting", label: "Setting" },
        { key: "value", label: "Value" },
        { key: "owner", label: "Owner" },
        { key: "updated", label: "Last Updated" },
      ]}
      rows={rows}
    />
  );
}
