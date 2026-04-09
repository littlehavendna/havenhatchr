"use client";

import { useEffect, useMemo, useState } from "react";

type CurrentUser = {
  name: string;
  email: string;
  plan: string;
  planBadge: string;
  isBetaUser: boolean;
  hasAppAccess: boolean;
  subscriptionStatus: string;
  trialEnd: string | null;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
};

async function readJsonSafely<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}

export default function SettingsPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        setRequestError("");
        const response = await fetch("/api/auth/me", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Failed to load billing settings.");
        }

        const data = (await response.json()) as { user: CurrentUser };
        setUser(data.user);
      } catch (error) {
        setRequestError(
          error instanceof Error ? error.message : "Failed to load billing settings.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadUser();
  }, []);

  const renewalLabel = useMemo(() => {
    if (!user) {
      return "-";
    }

    if (user.isBetaUser) {
      return "Founder access enabled";
    }

    if (user.subscriptionStatus === "trialing" && user.trialEnd) {
      return `Trial ends ${formatDate(user.trialEnd)}`;
    }

    if (user.currentPeriodEnd) {
      return `Renews ${formatDate(user.currentPeriodEnd)}`;
    }

    return "Billing inactive";
  }, [user]);

  async function handleBillingAction(path: string) {
    try {
      setIsRedirecting(true);
      setRequestError("");

      const response = await fetch(path, { method: "POST" });
      const data = await readJsonSafely<{ url?: string; error?: string }>(response);

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Unable to open billing.");
      }

      window.location.href = data.url;
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Unable to open billing.");
      setIsRedirecting(false);
    }
  }

  async function handleCancelSubscription() {
    try {
      setIsRedirecting(true);
      setRequestError("");

      const response = await fetch("/api/billing/cancel", { method: "POST" });
      const data = await readJsonSafely<{ error?: string }>(response);

      if (!response.ok) {
        throw new Error(data.error || "Unable to schedule cancellation.");
      }

      window.location.reload();
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : "Unable to schedule cancellation.",
      );
      setIsRedirecting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="mt-3 text-base text-[color:var(--muted)]">
          Manage billing, plan access, and account status without leaving the app.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <StatusCard label="Current Plan" value={isLoading ? "Loading..." : user?.planBadge || "-"} />
          <StatusCard label="Access" value={isLoading ? "Loading..." : user?.hasAppAccess ? "Full Access" : "Billing Required"} />
          <StatusCard label="Status" value={isLoading ? "Loading..." : user?.isBetaUser ? "Beta User" : toTitle(user?.subscriptionStatus || "inactive")} />
          <StatusCard label="Renewal" value={isLoading ? "Loading..." : renewalLabel} />
        </div>

        {requestError ? <p className="mt-5 text-sm text-[#b34b75]">{requestError}</p> : null}
      </section>

      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
          Billing
        </p>
        <div className="mt-5 grid gap-4">
          <div className="rounded-[20px] border border-[color:var(--line)] bg-[#fcfaff] p-4 text-sm text-[color:var(--muted)]">
            14 day free trial, then $10 per month. No commitment, cancel anytime.
          </div>
          {user?.isBetaUser ? (
            <div className="rounded-[20px] border border-[color:var(--line)] bg-[#edf7f8] p-4 text-sm text-[color:var(--muted)]">
              This account has Founder Access. Billing is bypassed while beta access is enabled.
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleBillingAction("/api/billing/checkout")}
                disabled={isRedirecting}
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isRedirecting ? "Opening..." : "Start Free Trial"}
              </button>
              <button
                type="button"
                onClick={() => handleBillingAction("/api/billing/portal")}
                disabled={isRedirecting || !user?.stripeCustomerId}
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-[#f8f7fe] disabled:cursor-not-allowed disabled:opacity-70"
              >
                Open Billing Portal
              </button>
              <button
                type="button"
                onClick={handleCancelSubscription}
                disabled={isRedirecting || !user?.stripeCustomerId}
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[color:var(--muted)] transition hover:bg-[#f8f7fe] disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel Subscription
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-[color:var(--line)] bg-[#fcfaff] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function toTitle(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
