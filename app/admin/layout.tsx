import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";
import { requireAdminUser } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdminUser();
  } catch {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
          Internal Console
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
          Internal operations workspace for account oversight, billing, flags, support, and
          system controls.
        </p>
      </section>
      <AdminNav />
      {children}
    </div>
  );
}
