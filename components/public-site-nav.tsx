"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export function PublicSiteNav() {
  const pathname = usePathname();

  return (
    <header className="px-4 pt-4 sm:px-6 lg:px-8">
      <div className="glass-panel soft-shadow mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-4 rounded-[30px] border border-[color:var(--line)] px-5 py-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center justify-between gap-4 md:flex-none">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            HavenHatchr
          </Link>
          <Link
            href="/login"
            className="shrink-0 rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
          >
            Login
          </Link>
        </div>
        <nav className="order-last flex w-full items-center justify-between gap-3 overflow-x-auto text-sm font-medium text-[color:var(--muted)] md:order-none md:w-auto md:justify-center md:gap-6 md:overflow-visible">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 rounded-full px-2 py-1 transition hover:text-foreground md:px-0 md:py-0 ${
                  isActive ? "text-foreground" : ""
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
