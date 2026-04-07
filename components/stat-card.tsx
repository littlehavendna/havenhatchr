type StatCardProps = {
  label: string;
  value: string;
  detail: string;
};

export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <article className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5">
      <p className="text-sm text-[color:var(--muted)]">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-sm text-[color:var(--teal)]">{detail}</p>
    </article>
  );
}
