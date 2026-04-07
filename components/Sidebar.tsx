"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  { label: "Customers", href: "/customers", icon: CustomersIcon },
  { label: "Flocks", href: "/flocks", icon: FlocksIcon },
  { label: "Chicks", href: "/chicks", icon: ChicksIcon },
  { label: "Orders", href: "/orders", icon: OrdersIcon },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
];

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-[#213126]/30 backdrop-blur-sm transition md:hidden ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`glass-panel soft-shadow fixed inset-y-4 left-4 z-40 flex w-[280px] flex-col rounded-[28px] border border-[color:var(--line)] px-4 py-5 transition duration-200 md:sticky md:top-4 md:m-4 md:h-[calc(100vh-2rem)] md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-[120%]"
        }`}
      >
        <div className="mb-8 flex items-center justify-between px-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
              HavenHatchr
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Farm Ops
            </h1>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[color:var(--line)] p-2 text-[color:var(--muted)] md:hidden"
            aria-label="Close sidebar"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          {navigation.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-[color:var(--accent)] text-white shadow-lg shadow-emerald-900/10"
                    : "text-[color:var(--muted)] hover:bg-white/70 hover:text-foreground"
                }`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    isActive
                      ? "bg-white/16 text-white"
                      : "bg-[color:var(--accent-soft)] text-[color:var(--accent)]"
                  }`}
                >
                  <Icon />
                </span>
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="rounded-3xl border border-[color:var(--line)] bg-white/70 p-4">
          <p className="text-sm font-semibold">Spring Hatch Window</p>
          <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">
            Monitor placement, feed cycles, and order demand from one view.
          </p>
        </div>
      </aside>
    </>
  );
}

function iconProps() {
  return {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
}

function DashboardIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M3 13h8V3H3z" />
      <path d="M13 21h8v-6h-8z" />
      <path d="M13 10h8V3h-8z" />
      <path d="M3 21h8v-4H3z" />
    </svg>
  );
}

function CustomersIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function FlocksIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M4 18c1.2-3.3 3.8-5 8-5s6.8 1.7 8 5" />
      <path d="M9 11c0-2 1.3-5 3-5s3 3 3 5" />
      <path d="M10 11c-.6-2.1-2-3-3.5-3C4.7 8 4 9.5 4 11c0 1.7 1 3 3 3" />
      <path d="M14 11c.6-2.1 2-3 3.5-3 1.8 0 2.5 1.5 2.5 3 0 1.7-1 3-3 3" />
    </svg>
  );
}

function ChicksIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M8 14c0 3 2.2 5 5 5 3.3 0 6-2.7 6-6 0-2.8-2.2-5-5-5-2.1 0-4 1.2-5 3" />
      <path d="M3 12c0-2.2 1.8-4 4-4 1.4 0 2.6.7 3.3 1.8" />
      <path d="m19 11 2-1" />
      <path d="M6 6 4 5" />
      <circle cx="13.5" cy="11.5" r=".5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M6 7h15" />
      <path d="M6 12h15" />
      <path d="M6 17h15" />
      <path d="M3 7h.01" />
      <path d="M3 12h.01" />
      <path d="M3 17h.01" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.06V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.06-.4H2.9a2 2 0 1 1 0-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 8.6 4.6a1.7 1.7 0 0 0 1-.6A1.7 1.7 0 0 0 10 2.94V2.9a2 2 0 1 1 4 0V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 8.6a1.7 1.7 0 0 0 .6 1 1.7 1.7 0 0 0 1.06.4h.04a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
