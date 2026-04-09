"use client";

import { useEffect, useState } from "react";

type FeedbackEntry = {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  type: "Bug" | "FeatureRequest" | "GeneralFeedback";
  message: string;
  page: string;
  status: "Open" | "InProgress" | "Resolved";
  createdAt: string;
};

const typeOptions = [
  { value: "All", label: "All Types" },
  { value: "Bug", label: "Bug" },
  { value: "FeatureRequest", label: "Feature Request" },
  { value: "GeneralFeedback", label: "General Feedback" },
] as const;

const statusOptions = [
  { value: "All", label: "All Statuses" },
  { value: "Open", label: "Open" },
  { value: "InProgress", label: "In Progress" },
  { value: "Resolved", label: "Resolved" },
] as const;

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [typeFilter, setTypeFilter] = useState<(typeof typeOptions)[number]["value"]>("All");
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]["value"]>("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadFeedback(typeFilter, statusFilter);
  }, [typeFilter, statusFilter]);

  async function loadFeedback(type: string, status: string) {
    try {
      setError("");
      setIsLoading(true);
      const params = new URLSearchParams({ type, status });
      const response = await fetch(`/api/admin/feedback?${params.toString()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load feedback.");
      }

      const data = (await response.json()) as { feedback: FeedbackEntry[] };
      setFeedback(data.feedback);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load feedback.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusUpdate(id: string, status: FeedbackEntry["status"]) {
    try {
      setError("");
      const response = await fetch("/api/admin/feedback", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Failed to update feedback.");
      }

      setFeedback((current) =>
        current.map((entry) => (entry.id === id ? { ...entry, status } : entry)),
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update feedback.");
    }
  }

  return (
    <div className="space-y-6">
      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Feedback Inbox</h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              Review beta user feedback, bug reports, and feature requests from inside the app.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value as (typeof typeOptions)[number]["value"])
              }
              className="w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as (typeof statusOptions)[number]["value"])
              }
              className="w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {error ? <p className="mt-4 text-sm text-[#b34b75]">{error}</p> : null}
      </section>

      <section className="space-y-4">
        {isLoading ? (
          <div className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-6 text-sm text-[color:var(--muted)]">
            Loading feedback...
          </div>
        ) : feedback.length > 0 ? (
          feedback.map((entry) => (
            <article
              key={entry.id}
              className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-6"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#edf7f8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--teal)]">
                      {formatType(entry.type)}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
                      {formatStatus(entry.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{entry.userName}</p>
                    <p className="text-sm text-[color:var(--muted)]">{entry.userEmail}</p>
                  </div>
                  <p className="text-sm leading-7 text-foreground">{entry.message}</p>
                  <div className="text-sm text-[color:var(--muted)]">
                    <p>Page: {entry.page}</p>
                    <p>Submitted: {formatDateTime(entry.createdAt)}</p>
                  </div>
                </div>
                <div className="w-full max-w-[220px]">
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                      Update Status
                    </span>
                    <select
                      value={entry.status}
                      onChange={(event) =>
                        void handleStatusUpdate(
                          entry.id,
                          event.target.value as FeedbackEntry["status"],
                        )
                      }
                      className="w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
                    >
                      {statusOptions
                        .filter((option) => option.value !== "All")
                        .map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                    </select>
                  </label>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-6 text-sm text-[color:var(--muted)]">
            No feedback matches the current filters.
          </div>
        )}
      </section>
    </div>
  );
}

function formatType(value: FeedbackEntry["type"]) {
  if (value === "FeatureRequest") {
    return "Feature Request";
  }

  if (value === "GeneralFeedback") {
    return "General Feedback";
  }

  return value;
}

function formatStatus(value: FeedbackEntry["status"]) {
  if (value === "InProgress") {
    return "In Progress";
  }

  return value;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
