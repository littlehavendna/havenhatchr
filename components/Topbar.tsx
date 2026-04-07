"use client";

import { usePathname } from "next/navigation";

const titles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Daily hatchery health, demand, and operations snapshot.",
  },
  "/customers": {
    title: "Customers",
    subtitle: "Track farms, pickup partners, and repeat hatch buyers.",
  },
  "/flocks": {
    title: "Flocks",
    subtitle: "Monitor breed groups, egg flow, and flock performance.",
  },
  "/chicks": {
    title: "Chicks",
    subtitle: "View chick batches, health checks, and readiness status.",
  },
  "/orders": {
    title: "Orders",
    subtitle: "Follow reservations, fulfillment windows, and payment status.",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Manage dashboard preferences and hatchery defaults.",
  },
};

type TopbarProps = {
  onMenuClick: () => void;
};

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const content = titles[pathname] ?? titles["/dashboard"];

  return (
    <header className="px-4 pt-4 sm:px-6 lg:px-8">
      <div className="glass-panel soft-shadow flex items-center justify-between rounded-[28px] border border-[color:var(--line)] px-4 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[color:var(--line)] bg-white/80 text-[color:var(--muted)] md:hidden"
            aria-label="Open sidebar"
          >
            <MenuIcon />
          </button>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
              Hatchery Console
            </p>
            <h2 className="mt-1 truncate text-2xl font-semibold tracking-tight">
              {content.title}
            </h2>
            <p className="mt-1 hidden text-sm text-[color:var(--muted)] sm:block">
              {content.subtitle}
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <div className="rounded-2xl border border-[color:var(--line)] bg-white/70 px-4 py-2 text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Farm Status
            </p>
            <p className="text-sm font-medium text-[color:var(--accent)]">
              All systems stable
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--accent)] text-sm font-semibold text-white">
            HH
          </div>
        </div>
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M3 12h18" />
      <path d="M3 18h18" />
    </svg>
  );
}
