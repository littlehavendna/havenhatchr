"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  moduleLabels,
  optionalModuleKeys,
  type ModuleVisibility,
} from "@/lib/module-visibility";

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
  aiAccessEnabled: boolean;
  hasCompletedTutorial: boolean;
  hasSkippedTutorial: boolean;
  moduleVisibility: ModuleVisibility;
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
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [isSavingModules, setIsSavingModules] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [accountMessage, setAccountMessage] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [moduleError, setModuleError] = useState("");
  const [moduleVisibility, setModuleVisibility] = useState<ModuleVisibility | null>(null);
  const [aiAccessEnabled, setAiAccessEnabled] = useState(true);

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
        setAccountEmail(data.user.email);
        setModuleVisibility(data.user.moduleVisibility);
        setAiAccessEnabled(data.user.aiAccessEnabled);
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

  async function handleAccountSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSavingAccount(true);
      setAccountMessage("");
      setRequestError("");

      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: accountEmail.trim() }),
      });
      const data = await readJsonSafely<{
        user?: Pick<CurrentUser, "name" | "email">;
        error?: string;
      }>(response);

      if (!response.ok || !data.user) {
        throw new Error(data.error || "Unable to update account email.");
      }

      setUser((current) =>
        current
          ? {
              ...current,
              email: data.user?.email ?? current.email,
              name: data.user?.name ?? current.name,
            }
          : current,
      );
      setAccountEmail(data.user.email);
      setAccountMessage("Account email saved.");
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Unable to update account email.");
    } finally {
      setIsSavingAccount(false);
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

  async function handleRestartTutorial() {
    try {
      setIsRedirecting(true);
      setRequestError("");

      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restart" }),
      });
      const data = await readJsonSafely<{ error?: string }>(response);

      if (!response.ok) {
        throw new Error(data.error || "Unable to restart tutorial.");
      }

      window.location.href = "/dashboard";
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Unable to restart tutorial.");
      setIsRedirecting(false);
    }
  }

  async function handleModuleToggle(key: keyof ModuleVisibility) {
    if (!moduleVisibility) {
      return;
    }

    const nextVisibility = {
      ...moduleVisibility,
      [key]: !moduleVisibility[key],
    };

    setModuleVisibility(nextVisibility);
    setModuleError("");
    setIsSavingModules(true);

    try {
      const response = await fetch("/api/settings/modules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextVisibility),
      });
      const data = await readJsonSafely<{
        moduleVisibility?: ModuleVisibility;
        aiAccessEnabled?: boolean;
        error?: string;
      }>(response);

      if (!response.ok || !data.moduleVisibility) {
        throw new Error(data.error || "Unable to save feature visibility.");
      }

      setModuleVisibility(data.moduleVisibility);
      setAiAccessEnabled(data.aiAccessEnabled ?? aiAccessEnabled);
      setUser((current) =>
        current
          ? {
              ...current,
              moduleVisibility: data.moduleVisibility as ModuleVisibility,
              aiAccessEnabled: data.aiAccessEnabled ?? current.aiAccessEnabled,
            }
          : current,
      );
    } catch (error) {
      setModuleVisibility(moduleVisibility);
      setModuleError(
        error instanceof Error ? error.message : "Unable to save feature visibility.",
      );
    } finally {
      setIsSavingModules(false);
    }
  }

  async function handleAiAccessToggle() {
    if (!moduleVisibility) {
      return;
    }

    const nextAiAccessEnabled = !aiAccessEnabled;
    setAiAccessEnabled(nextAiAccessEnabled);
    setModuleError("");
    setIsSavingModules(true);

    try {
      const response = await fetch("/api/settings/modules", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...moduleVisibility,
          aiAccessEnabled: nextAiAccessEnabled,
        }),
      });
      const data = await readJsonSafely<{
        moduleVisibility?: ModuleVisibility;
        aiAccessEnabled?: boolean;
        error?: string;
      }>(response);

      if (!response.ok || !data.moduleVisibility || data.aiAccessEnabled === undefined) {
        throw new Error(data.error || "Unable to save AI access.");
      }

      setModuleVisibility(data.moduleVisibility);
      setAiAccessEnabled(data.aiAccessEnabled);
      setUser((current) =>
        current
          ? {
              ...current,
              moduleVisibility: data.moduleVisibility as ModuleVisibility,
              aiAccessEnabled: data.aiAccessEnabled as boolean,
            }
          : current,
      );
    } catch (error) {
      setAiAccessEnabled(aiAccessEnabled);
      setModuleError(error instanceof Error ? error.message : "Unable to save AI access.");
    } finally {
      setIsSavingModules(false);
    }
  }

  const canStartTrial = Boolean(
    user &&
      !user.isBetaUser &&
      !["trialing", "active"].includes(user.subscriptionStatus) &&
      !(user.currentPeriodEnd && new Date(user.currentPeriodEnd) > new Date()),
  );

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
        <form
          onSubmit={handleAccountSubmit}
          className="mt-8 rounded-[20px] border border-[color:var(--line)] bg-[#fcfaff] p-4"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
            Account Email
          </p>
          <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
            This is the email used for login and the default contact email for new DNA orders.
          </p>
          <label className="mt-4 block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Email
            </span>
            <input
              type="email"
              value={accountEmail}
              onChange={(event) => {
                setAccountEmail(event.target.value);
                setAccountMessage("");
              }}
              disabled={isLoading || isSavingAccount}
              className="w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-70"
            />
          </label>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[color:var(--muted)]">
              {accountMessage || "DNA order email can still be changed per order at checkout."}
            </p>
            <button
              type="submit"
              disabled={
                isLoading
                || isSavingAccount
                || !accountEmail.trim()
                || accountEmail.trim().toLowerCase() === user?.email.toLowerCase()
              }
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSavingAccount ? "Saving..." : "Save Email"}
            </button>
          </div>
        </form>

        <div className="mt-8 rounded-[20px] border border-[color:var(--line)] bg-[#fcfaff] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
            Onboarding
          </p>
          <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
            Restart the guided walkthrough anytime if you want a quick refresher on the breeder
            workflow.
          </p>
          <button
            type="button"
            onClick={handleRestartTutorial}
            disabled={isRedirecting}
            className="mt-4 inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-[#f8f7fe] disabled:cursor-not-allowed disabled:opacity-70"
          >
            Restart Tutorial
          </button>
        </div>

        <div className="mt-6 rounded-[20px] border border-[color:var(--line)] bg-[#fcfaff] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                Workspace Features
              </p>
              <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                Turn optional sections on or off in the app menu for this account. Turning a feature off only hides it from view and does not delete any of your saved data.
              </p>
            </div>
            <p className="text-xs text-[color:var(--muted)]">
              {isSavingModules ? "Saving..." : "Saved per account"}
            </p>
          </div>

          {moduleError ? <p className="mt-4 text-sm text-[#b34b75]">{moduleError}</p> : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between gap-4 rounded-[18px] border border-[color:var(--line)] bg-white px-4 py-3 sm:col-span-2">
              <span>
                <span className="block text-sm font-medium text-foreground">AI Tools</span>
                <span className="mt-1 block text-xs leading-5 text-[color:var(--muted)]">
                  Turn this off to hide AI navigation and block AI tool access for this account.
                </span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={aiAccessEnabled}
                onClick={() => void handleAiAccessToggle()}
                disabled={isLoading || isSavingModules || !moduleVisibility}
                className={`inline-flex h-8 w-20 shrink-0 items-center rounded-full border px-1 transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  aiAccessEnabled
                    ? "justify-end border-[color:var(--teal)] bg-[color:var(--teal-soft)]"
                    : "justify-start border-[color:var(--line)] bg-[#f3f0fb]"
                }`}
              >
                <span
                  className={`flex h-6 w-9 items-center justify-center rounded-full text-[10px] font-semibold uppercase tracking-[0.12em] shadow-sm ${
                    aiAccessEnabled
                      ? "bg-[color:var(--teal)] text-white"
                      : "bg-white text-[color:var(--muted)]"
                  }`}
                >
                  {aiAccessEnabled ? "On" : "Off"}
                </span>
              </button>
            </div>
            {optionalModuleKeys.map((key) => (
              <label
                key={key}
                className="flex items-center justify-between rounded-[18px] border border-[color:var(--line)] bg-white px-4 py-3"
              >
                <span className="text-sm font-medium text-foreground">{moduleLabels[key]}</span>
                <input
                  type="checkbox"
                  checked={moduleVisibility?.[key] ?? true}
                  onChange={() => void handleModuleToggle(key)}
                  disabled={isLoading || isSavingModules || !moduleVisibility}
                  className="h-4 w-4 rounded border-[color:var(--line)] text-[color:var(--accent)] focus:ring-[color:var(--accent)] disabled:cursor-not-allowed"
                />
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
          Billing
        </p>
        <div className="mt-5 grid gap-4">
          <div className="rounded-[20px] border border-[color:var(--line)] bg-[#fcfaff] p-4 text-sm text-[color:var(--muted)]">
            7 day free trial, then $10 per month. No commitment, cancel anytime.
          </div>
          {user?.isBetaUser ? (
            <div className="rounded-[20px] border border-[color:var(--line)] bg-[#edf7f8] p-4 text-sm text-[color:var(--muted)]">
              This account has Founder Access. Billing is bypassed while beta access is enabled.
            </div>
          ) : (
            <>
              {canStartTrial ? (
                <button
                  type="button"
                  onClick={() => handleBillingAction("/api/billing/checkout")}
                  disabled={isRedirecting}
                  className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isRedirecting ? "Opening..." : "Start Free Trial"}
                </button>
              ) : (
                <div className="rounded-[20px] border border-[color:var(--line)] bg-[#edf7f8] p-4 text-sm text-[color:var(--muted)]">
                  Your trial or subscription is already active. Use the billing portal to manage
                  payment details, invoices, or cancellation.
                </div>
              )}
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
