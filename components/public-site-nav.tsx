"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/guides", label: "Guides" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export function PublicSiteNav() {
  const pathname = usePathname();

  return (
    <header className="px-4 pt-4 sm:px-6 lg:px-8">
      <div className="glass-panel soft-shadow mx-auto flex max-w-7xl items-center justify-between rounded-[30px] border border-[color:var(--line)] px-5 py-4 sm:px-6">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          HavenHatchr
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-[color:var(--muted)] md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition hover:text-foreground ${
                  isActive ? "text-foreground" : ""
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/login"
          className="rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
        >
          Login
        </Link>
      </div>
    </header>
  );
}
