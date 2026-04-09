"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PaywallScreen } from "@/components/paywall-screen";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

type DashboardShellProps = {
  children: ReactNode;
};

const PUBLIC_SHELLLESS_ROUTES = new Set(["/", "/login", "/signup", "/pricing"]);

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [billingState, setBillingState] = useState<{
    hasAppAccess: boolean;
    isBetaUser: boolean;
  } | null>(null);
  const [isBillingLoading, setIsBillingLoading] = useState(true);
  useEffect(() => {
    if (PUBLIC_SHELLLESS_ROUTES.has(pathname)) {
      setIsBillingLoading(false);
      return;
    }

    async function loadBillingState() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });

        if (!response.ok) {
          setBillingState(null);
          return;
        }

        const data = (await response.json()) as {
          user: {
            hasAppAccess: boolean;
            isBetaUser: boolean;
          };
        };

        setBillingState({
          hasAppAccess: data.user.hasAppAccess,
          isBetaUser: data.user.isBetaUser,
        });
      } finally {
        setIsBillingLoading(false);
      }
    }

    void loadBillingState();
  }, [pathname]);

  if (PUBLIC_SHELLLESS_ROUTES.has(pathname)) {
    return <>{children}</>;
  }

  const allowChildren = billingState?.hasAppAccess || pathname === "/settings";

  return (
    <div className="min-h-screen text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="flex-1 px-4 pb-6 pt-4 sm:px-6 lg:px-8">
            {isBillingLoading ? (
              <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-6">
                <p className="text-sm text-[color:var(--muted)]">Loading account access...</p>
              </section>
            ) : billingState === null ? (
              children
            ) : allowChildren ? (
              children
            ) : (
              <PaywallScreen isBetaUser={billingState.isBetaUser} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
