"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  plan: string;
  subscriptionStatus: string;
  isBetaUser: boolean;
  isFounder: boolean;
  aiAccessEnabled: boolean;
  isAdmin: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  accountDisabledAt: string | null;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState("");

  useEffect(() => {
    void loadUsers();
  }, []);

  async function loadUsers(query = "") {
    try {
      const response = await fetch(`/api/admin/users?search=${encodeURIComponent(query)}`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Failed to load users.");
      const data = (await response.json()) as { users: AdminUser[] };
      setUsers(data.users);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load users.");
    }
  }

  async function updateUser(id: string, payload: Record<string, boolean>) {
    try {
      setPendingId(id);
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to update user.");
      await loadUsers(search);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update user.");
    } finally {
      setPendingId("");
    }
  }

  const filtered = useMemo(() => users, [users]);

  return (
    <div className="space-y-6">
      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Users</h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Search accounts, inspect access state, and apply internal control flags.
            </p>
          </div>
          <input
            type="text"
            value={search}
            onChange={(event) => {
              const value = event.target.value;
              setSearch(value);
              void loadUsers(value);
            }}
            placeholder="Search name, email, plan, or status"
            className="w-full max-w-md rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
          />
        </div>
        {error ? <p className="mt-4 text-sm text-[#b34b75]">{error}</p> : null}
      </section>

      <section className="soft-shadow overflow-hidden rounded-[28px] border border-[color:var(--line)] bg-[color:var(--panel-strong)]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-[#f5f3fd]">
              <tr>
                {["Name", "Plan", "Subscription", "Beta", "Founder", "AI", "Admin", "Signup", "Last Login", "Actions"].map((label) => (
                  <th key={label} className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-t border-[color:var(--line)] align-top">
                  <td className="px-5 py-4 text-sm">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-[color:var(--muted)]">{user.email}</p>
                  </td>
                  <td className="px-5 py-4 text-sm">{user.plan}</td>
                  <td className="px-5 py-4 text-sm">{user.subscriptionStatus}</td>
                  <td className="px-5 py-4 text-sm">{user.isBetaUser ? "Yes" : "No"}</td>
                  <td className="px-5 py-4 text-sm">{user.isFounder ? "Yes" : "No"}</td>
                  <td className="px-5 py-4 text-sm">{user.aiAccessEnabled ? "Enabled" : "Off"}</td>
                  <td className="px-5 py-4 text-sm">{user.isAdmin ? "Yes" : "No"}</td>
                  <td className="px-5 py-4 text-sm">{formatDate(user.createdAt)}</td>
                  <td className="px-5 py-4 text-sm">{user.lastLoginAt ? formatDate(user.lastLoginAt) : "-"}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <ActionButton disabled={pendingId === user.id} onClick={() => updateUser(user.id, { isBetaUser: !user.isBetaUser })}>
                        {user.isBetaUser ? "Remove Beta" : "Make Beta"}
                      </ActionButton>
                      <ActionButton disabled={pendingId === user.id} onClick={() => updateUser(user.id, { isFounder: !user.isFounder })}>
                        {user.isFounder ? "Remove Founder" : "Make Founder"}
                      </ActionButton>
                      <ActionButton disabled={pendingId === user.id} onClick={() => updateUser(user.id, { aiAccessEnabled: !user.aiAccessEnabled })}>
                        {user.aiAccessEnabled ? "Disable AI" : "Enable AI"}
                      </ActionButton>
                      <ActionButton disabled={pendingId === user.id} onClick={() => updateUser(user.id, { isAdmin: !user.isAdmin })}>
                        {user.isAdmin ? "Remove Admin" : "Make Admin"}
                      </ActionButton>
                      <ActionButton disabled={pendingId === user.id} onClick={() => updateUser(user.id, { disableAccount: !user.accountDisabledAt })}>
                        {user.accountDisabledAt ? "Re-enable" : "Disable"}
                      </ActionButton>
                      <Link href={`/admin/users/${user.id}`} className="rounded-full border border-[color:var(--line)] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)] transition hover:bg-[#f8f7fe]">
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-full border border-[color:var(--line)] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)] transition hover:bg-[#f8f7fe] disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
