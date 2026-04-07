type Column<T> = {
  key: keyof T;
  label: string;
};

type DataTableProps<T extends Record<string, string>> = {
  title: string;
  description: string;
  columns: Column<T>[];
  rows: T[];
};

export function DataTable<T extends Record<string, string>>({
  title,
  description,
  columns,
  rows,
}: DataTableProps<T>) {
  return (
    <section className="soft-shadow overflow-hidden rounded-[28px] border border-[color:var(--line)] bg-[color:var(--panel-strong)]">
      <div className="border-b border-[color:var(--line)] px-5 py-5 sm:px-6">
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        <p className="mt-1 text-sm text-[color:var(--muted)]">{description}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-[#f5f8f3]">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)] sm:px-6"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                className="border-t border-[color:var(--line)] transition hover:bg-[#fafcf8]"
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className="px-5 py-4 text-sm text-foreground sm:px-6"
                  >
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
