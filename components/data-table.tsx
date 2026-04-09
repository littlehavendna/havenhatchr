import type { ReactNode } from "react";

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
  renderActions?: (row: T, index: number) => ReactNode;
  emptyState?: {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
  };
};

export function DataTable<T extends Record<string, RowValue>>({
  title,
  description,
  columns,
  rows,
  renderActions,
  emptyState,
}: DataTableProps<T>) {
  return (
    <section className="soft-shadow overflow-hidden rounded-[28px] border border-[color:var(--line)] bg-[color:var(--panel-strong)]">
      <div className="border-b border-[color:var(--line)] px-5 py-5 sm:px-6">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-[color:var(--muted)]">{description}</p>
        ) : null}
      </div>

      <div className="grid gap-4 p-4 sm:hidden">
        {rows.length > 0 ? (
          rows.map((row, index) => (
            <article
              key={index}
              className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-4"
            >
              <div className="grid gap-3">
                {columns.map((column) => (
                  <div
                    key={String(column.key)}
                    className="flex items-start justify-between gap-4 border-b border-[color:var(--line)] pb-3 last:border-b-0 last:pb-0"
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                      {column.label}
                    </span>
                    <span className="max-w-[60%] text-right text-sm font-medium text-foreground">
                      {row[column.key]}
                    </span>
                  </div>
                ))}
              </div>
              {renderActions ? (
                <div className="mt-4 flex justify-end">
                  {renderActions(row, index)}
                </div>
              ) : null}
            </article>
          ))
        ) : (
          <div className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] px-5 py-10 text-center">
            <p className="text-base font-semibold tracking-tight text-foreground">
              {emptyState?.title ?? "Nothing here yet"}
            </p>
            <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
              {emptyState?.description ?? "Add your first record to get started."}
            </p>
            {emptyState?.actionLabel && emptyState.onAction ? (
              <button
                type="button"
                onClick={emptyState.onAction}
                className="mt-5 inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
              >
                {emptyState.actionLabel}
              </button>
            ) : null}
          </div>
        )}
      </div>

      <div className="hidden overflow-x-auto sm:block">
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
              {renderActions ? (
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)] sm:px-6">
                  Actions
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row, index) => (
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
                  {renderActions ? (
                    <td className="px-5 py-4 text-right text-sm text-foreground sm:px-6">
                      {renderActions(row, index)}
                    </td>
                  ) : null}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (renderActions ? 1 : 0)}
                  className="border-t border-[color:var(--line)] px-5 py-10 sm:px-6"
                >
                  <div className="mx-auto max-w-xl text-center">
                    <p className="text-base font-semibold tracking-tight text-foreground">
                      {emptyState?.title ?? "Nothing here yet"}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                      {emptyState?.description ?? "Add your first record to get started."}
                    </p>
                    {emptyState?.actionLabel && emptyState.onAction ? (
                      <button
                        type="button"
                        onClick={emptyState.onAction}
                        className="mt-5 inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
                      >
                        {emptyState.actionLabel}
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
