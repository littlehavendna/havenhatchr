type RowValue = string | number;

type Column<T> = {
  key: keyof T;
  label: string;
};

type DataTableProps<T extends Record<string, RowValue>> = {
  title: string;
  description?: string;
  columns: Column<T>[];
  rows: T[];
};

export function DataTable<T extends Record<string, RowValue>>({
  title,
  description,
  columns,
  rows,
}: DataTableProps<T>) {
  return (
    <section className="soft-shadow overflow-hidden rounded-[28px] border border-[color:var(--line)] bg-[color:var(--panel-strong)]">
      <div className="border-b border-[color:var(--line)] px-5 py-5 sm:px-6">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-[color:var(--muted)]">{description}</p>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-[#f5f3fd]">
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
                className="border-t border-[color:var(--line)] transition hover:bg-[#f8f7fe]"
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
