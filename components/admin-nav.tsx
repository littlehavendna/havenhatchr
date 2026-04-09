"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/billing", label: "Billing" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/feature-flags", label: "Feature Flags" },
  { href: "/admin/feedback", label: "Feedback" },
  { href: "/admin/support", label: "Support" },
  { href: "/admin/system", label: "System" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-4">
      <div className="flex flex-wrap gap-2">
        {adminLinks.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-[color:var(--accent)] text-white"
                  : "border border-[color:var(--line)] bg-white text-[color:var(--muted)] hover:bg-[#f8f7fe]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
