"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type TopbarProps = {
  onMenuClick: () => void;
};

export function Topbar({ onMenuClick }: TopbarProps) {
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
    <header className="px-4 pt-4 sm:px-6 lg:px-8">
      <div className="glass-panel soft-shadow flex items-center justify-between rounded-[28px] border border-[color:var(--line)] px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[color:var(--line)] bg-white/80 text-[color:var(--muted)] md:hidden"
            aria-label="Open navigation"
          >
            <MenuIcon />
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
              Poultry Breeder Management
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              HavenHatchr
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="hidden rounded-full border border-[color:var(--line)] bg-[color:var(--teal-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--teal)] sm:block">
              {user.planBadge}
            </div>
          ) : null}
          {user?.isBetaUser ? (
            <div className="hidden rounded-full border border-[color:var(--line)] bg-[#f5f3fd] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--accent)] lg:block">
              Founder Access
            </div>
          ) : null}
          {user ? (
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-foreground">{user.name}</p>
              <p className="text-xs text-[color:var(--muted)]">{user.email}</p>
            </div>
          ) : null}
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--line)] bg-white/80 text-sm font-semibold text-[color:var(--accent)]">
            {initials}
          </div>
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
