"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/customers", label: "Customers" },
  { href: "/flocks", label: "Flocks" },
  { href: "/pairings", label: "Pairings" },
  { href: "/hatch-groups", label: "Hatch Groups" },
  { href: "/chicks", label: "Chicks" },
  { href: "/reservations", label: "Reservations" },
  { href: "/orders", label: "Orders" },
  { href: "/settings", label: "Settings" },
];

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-[#221c3f]/35 backdrop-blur-sm transition md:hidden ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`glass-panel soft-shadow fixed inset-y-4 left-4 z-40 flex w-72 flex-col rounded-[28px] border border-[color:var(--line)] p-4 transition duration-200 md:sticky md:top-4 md:m-4 md:h-[calc(100vh-2rem)] md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-[120%]"
        }`}
      >
        <div className="flex items-center justify-between px-2 py-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
              HavenHatchr
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              Breeder Hub
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[color:var(--line)] px-3 py-2 text-sm text-[color:var(--muted)] md:hidden"
          >
            Close
          </button>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-2">
          {links.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-[color:var(--accent)] text-white shadow-lg shadow-violet-950/12"
                    : "text-[color:var(--muted)] hover:bg-white/70 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="rounded-[24px] border border-[color:var(--line)] bg-white/72 p-4">
          <p className="text-sm font-semibold">Future Workspace</p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
            Ready for genetics, AI drafting, analytics, and waitlist automation.
          </p>
        </div>
      </aside>
    </>
  );
}
