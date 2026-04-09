"use client";

import Link from "next/link";
import { FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { StatCard } from "@/components/stat-card";

type AlertRow = {
  id: string;
  title: string;
  detail: string;
  category: string;
  dueDate: string;
  priority: "Today" | "Upcoming" | "Watch";
  href: string;
};

type TaskRow = {
  id: string;
  title: string;
  description: string;
  status: "Open" | "InProgress" | "Completed";
  priority: "Low" | "Medium" | "High";
  dueDate: string;
  relatedEntityType: "Bird" | "Chick" | "HatchGroup" | "Customer" | "Order" | "Reservation" | "Show" | "Other";
  relatedEntityId: string;
  notes: string;
  createdAt: string;
};

type TasksResponse = {
  stats: {
    dueToday: number;
    upcoming: number;
    watchList: number;
    openTasks: number;
    completedTasks: number;
  };
  alerts: AlertRow[];
  tasks: TaskRow[];
};

type TaskForm = {
  title: string;
  description: string;
  status: TaskRow["status"];
  priority: TaskRow["priority"];
  dueDate: string;
  relatedEntityType: TaskRow["relatedEntityType"];
  relatedEntityId: string;
  notes: string;
};

const emptyForm: TaskForm = {
  title: "",
  description: "",
  status: "Open",
  priority: "Medium",
  dueDate: "",
  relatedEntityType: "Other",
  relatedEntityId: "",
  notes: "",
};

export default function TasksPage() {
  const [data, setData] = useState<TasksResponse | null>(null);
  const [form, setForm] = useState<TaskForm>(emptyForm);
  const [statusFilter, setStatusFilter] = useState<"All" | TaskRow["status"]>("All");
  const [priorityFilter, setPriorityFilter] = useState<"All" | TaskRow["priority"]>("All");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const response = await fetch("/api/tasks", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to load tasks.");
      }

      setData((await response.json()) as TasksResponse);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load tasks.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSaving(true);
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Failed to create task.");
      }

      setForm(emptyForm);
      await loadTasks();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create task.");
    } finally {
      setIsSaving(false);
    }
  }

  async function markComplete(id: string) {
    try {
      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Completed" }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Failed to update task.");
      }

      await loadTasks();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update task.");
    }
  }

  const filteredTasks = useMemo(() => {
    const tasks = data?.tasks ?? [];
    return tasks.filter((task) => {
      const statusMatches = statusFilter === "All" || task.status === statusFilter;
      const priorityMatches = priorityFilter === "All" || task.priority === priorityFilter;
      return statusMatches && priorityMatches;
    });
  }, [data?.tasks, priorityFilter, statusFilter]);

  const stats = [
    {
      label: "Due Today",
      value: String(data?.stats.dueToday ?? 0),
      detail: "Auto-generated lockdown, hatch, pickup, and follow-up alerts.",
    },
    {
      label: "Open Tasks",
      value: String(data?.stats.openTasks ?? 0),
      detail: "Manual breeder work items still in progress.",
    },
    {
      label: "Completed",
      value: String(data?.stats.completedTasks ?? 0),
      detail: "Finished manual tasks logged in this workspace.",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
          Tasks
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Breeder task manager</h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
          Manage breeder work items and keep daily workflow visible. Lockdown notices and other
          practical alerts auto-populate from live hatch, order, and reservation data.
        </p>
        {error ? <p className="mt-4 text-sm text-[#b34b75]">{error}</p> : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} detail={card.detail} />
        ))}
      </section>

      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Add Task
          </p>
          <h2 className="text-xl font-semibold tracking-tight">Create a breeder work item</h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Title">
            <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className={inputClassName()} placeholder="Band chicks" />
          </Field>
          <Field label="Due Date">
            <input type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} className={inputClassName()} />
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as TaskRow["status"] }))} className={inputClassName()}>
              <option value="Open">Open</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </Field>
          <Field label="Priority">
            <select value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as TaskRow["priority"] }))} className={inputClassName()}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </Field>
          <Field label="Related Entity Type">
            <select value={form.relatedEntityType} onChange={(event) => setForm((current) => ({ ...current, relatedEntityType: event.target.value as TaskRow["relatedEntityType"] }))} className={inputClassName()}>
              <option value="Other">Other</option>
              <option value="Bird">Bird</option>
              <option value="Chick">Chick</option>
              <option value="HatchGroup">Hatch Group</option>
              <option value="Customer">Customer</option>
              <option value="Order">Order</option>
              <option value="Reservation">Reservation</option>
              <option value="Show">Show</option>
            </select>
          </Field>
          <Field label="Related Entity Id">
            <input value={form.relatedEntityId} onChange={(event) => setForm((current) => ({ ...current, relatedEntityId: event.target.value }))} className={inputClassName()} placeholder="Optional internal id" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={3} className={`${inputClassName()} resize-none`} placeholder="What needs to happen?" />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Notes">
              <textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} rows={3} className={`${inputClassName()} resize-none`} placeholder="Optional notes or follow-up details" />
            </Field>
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" disabled={isSaving} className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0] disabled:cursor-not-allowed disabled:opacity-70">
              {isSaving ? "Saving..." : "Add Task"}
            </button>
          </div>
        </form>
      </section>

      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Task List
            </p>
            <h2 className="text-xl font-semibold tracking-tight">Manual breeder tasks</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "All" | TaskRow["status"])} className={inputClassName()}>
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as "All" | TaskRow["priority"])} className={inputClassName()}>
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <article key={task.id} className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <Pill tone="accent">{formatStatus(task.status)}</Pill>
                      <Pill tone={task.priority === "High" ? "danger" : task.priority === "Medium" ? "teal" : "neutral"}>{task.priority}</Pill>
                      <Pill tone="neutral">{task.relatedEntityType}</Pill>
                    </div>
                    <p className="mt-3 text-base font-semibold tracking-tight text-foreground">{task.title}</p>
                    {task.description ? <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{task.description}</p> : null}
                    <div className="mt-3 text-sm text-[color:var(--muted)]">
                      <p>Due {formatDate(task.dueDate)}</p>
                      {task.relatedEntityId ? <p>Linked record: {task.relatedEntityId}</p> : null}
                      {task.notes ? <p className="mt-1">{task.notes}</p> : null}
                    </div>
                  </div>
                  {task.status !== "Completed" ? (
                    <button type="button" onClick={() => void markComplete(task.id)} className="inline-flex items-center justify-center rounded-full border border-[color:var(--teal)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--teal)] transition hover:bg-[color:var(--teal-soft)]">
                      Mark Complete
                    </button>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-5 text-sm text-[color:var(--muted)]">
              No tasks match the current filters.
            </div>
          )}
        </div>
      </section>

      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
            Auto Alerts
          </p>
          <h2 className="text-xl font-semibold tracking-tight">Operational reminders from live data</h2>
        </div>
        <div className="mt-5 space-y-4">
          {(data?.alerts ?? []).length > 0 ? (
            data?.alerts.map((alert) => (
              <Link key={alert.id} href={alert.href} className="block rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-4 transition hover:bg-white">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <Pill tone="teal">{alert.category}</Pill>
                      <Pill tone={alert.priority === "Today" ? "danger" : alert.priority === "Upcoming" ? "accent" : "neutral"}>{alert.priority}</Pill>
                    </div>
                    <p className="mt-3 text-base font-semibold tracking-tight text-foreground">{alert.title}</p>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{alert.detail}</p>
                  </div>
                  <span className="text-sm text-[color:var(--muted)]">Due {formatDate(alert.dueDate)}</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-5 text-sm text-[color:var(--muted)]">
              No auto-generated alerts right now.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">{label}</span>
      {children}
    </label>
  );
}

function inputClassName() {
  return "w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]";
}

function Pill({ children, tone }: { children: ReactNode; tone: "accent" | "teal" | "danger" | "neutral" }) {
  const className =
    tone === "accent"
      ? "bg-[#f5f3fd] text-[color:var(--accent)]"
      : tone === "teal"
        ? "bg-[#edf7f8] text-[color:var(--teal)]"
        : tone === "danger"
          ? "bg-[#fff1f3] text-[#b34b75]"
          : "bg-white text-[color:var(--muted)]";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${className}`}>
      {children}
    </span>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatStatus(value: TaskRow["status"]) {
  if (value === "InProgress") {
    return "In Progress";
  }

  return value;
}
