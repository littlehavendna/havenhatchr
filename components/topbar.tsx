"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type TopbarProps = {
  onMenuClick: () => void;
  onFeedbackClick: () => void;
};

export function Topbar({ onMenuClick, onFeedbackClick }: TopbarProps) {
  const router = useRouter();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    plan: string;
    planBadge: string;
    isBetaUser: boolean;
  } | null>(null);

  useEffect(() => {
    async function loadCurrentUser() {
      const response = await fetch("/api/auth/me", { cache: "no-store" });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as {
        user: {
          name: string;
          email: string;
          plan: string;
          planBadge: string;
          isBetaUser: boolean;
        };
      };
      setUser(data.user);
    }

    void loadCurrentUser();
  }, []);

  const initials = useMemo(() => {
    if (!user?.name) {
      return "HH";
    }

    return user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="mobile-safe-pt px-3 pt-3 sm:px-5 sm:pt-4 lg:px-8">
      <div className="glass-panel soft-shadow flex flex-col gap-4 rounded-[28px] border border-[color:var(--line)] px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[color:var(--line)] bg-white/80 text-[color:var(--muted)] md:hidden"
            aria-label="Open navigation"
          >
            <MenuIcon />
          </button>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)] sm:text-xs sm:tracking-[0.24em]">
              Poultry Breeder Management
            </p>
            <h1 className="mt-1 truncate text-xl font-semibold tracking-tight sm:text-2xl">
              HavenHatchr
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
          {user ? (
            <div className="order-3 w-full rounded-full border border-[color:var(--line)] bg-[color:var(--teal-soft)] px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--teal)] sm:order-none sm:w-auto sm:text-xs">
              {user.planBadge}
            </div>
          ) : null}
          {user ? (
            <div className="min-w-0 flex-1 text-left sm:max-w-[15rem] sm:text-right">
              <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
              <p className="truncate text-xs text-[color:var(--muted)]">{user.email}</p>
            </div>
          ) : null}
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--line)] bg-white/80 text-sm font-semibold text-[color:var(--accent)]">
            {initials}
          </div>
          <button
            type="button"
            onClick={onFeedbackClick}
            className="rounded-full border border-[color:var(--line)] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)] transition hover:bg-white"
          >
            Feedback
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-[color:var(--line)] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)] transition hover:bg-white"
          >
            Log Out
          </button>
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
