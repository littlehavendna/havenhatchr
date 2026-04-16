"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { BirdSex, ChickDeathReason, ChickStatus } from "@/lib/types";

type ChickProfileResponse = {
  chick: {
    id: string;
    bandNumber: string;
    hatchDate: string;
    flockId: string;
    flockName: string;
    hatchGroupId: string | null;
    hatchGroupName: string;
    status: string;
    sex: string;
    color: string;
    observedTraits: string[];
    notes: string;
    photoUrl: string;
    dnaStatus: "None" | "Pending" | "Completed" | "Cancelled";
    createdAt: string;
    pairingName: string;
    sireName: string;
    damName: string;
    producedTraitsSummary: string;
  };
  notes: Array<{ id: string; content: string; createdAt: string }>;
  photos: Array<{ id: string; url: string; caption: string; createdAt: string }>;
  dnaTests: Array<{
    id: string;
    bandNumber: string;
    testType: string;
    status: string;
    externalOrderId: string;
    resultSummary: string;
    completedAt: string | null;
    createdAt: string;
  }>;
  deathRecords: Array<{
    id: string;
    deathDate: string;
    deathReason: ChickDeathReason;
    deathReasonLabel: string;
    notes: string;
    createdAt: string;
  }>;
  flocks: Array<{
    id: string;
    name: string;
  }>;
  hatchGroups: Array<{
    id: string;
    name: string;
  }>;
};

type EditFormState = {
  bandNumber: string;
  hatchDate: string;
  flockId: string;
  hatchGroupId: string;
  status: ChickStatus;
  sex: BirdSex;
  color: string;
  observedTraits: string;
  notes: string;
};

const dnaTestOptions = ["Sexing", "Color", "Trait Panel"];
const deathReasonOptions: Array<{ value: ChickDeathReason; label: string }> = [
  { value: "FailureToThrive", label: "Failure to thrive" },
  { value: "ShippedWeak", label: "Shipped weak" },
  { value: "SplayLeg", label: "Splay leg" },
  { value: "Injury", label: "Injury" },
  { value: "Predator", label: "Predator" },
  { value: "UnabsorbedYolk", label: "Unabsorbed yolk" },
  { value: "AssistedHatchComplications", label: "Assisted hatch complications" },
  { value: "Unknown", label: "Unknown" },
  { value: "Other", label: "Other" },
];
const chickStatusOptions: ChickStatus[] = ["Available", "Reserved", "Sold", "Holdback", "Deceased"];
const sexOptions: BirdSex[] = ["Male", "Female", "Unknown"];

export default function ChickProfilePage() {
  const params = useParams<{ id: string }>();
  const chickId = typeof params?.id === "string" ? params.id : "";
  const [profile, setProfile] = useState<ChickProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requestError, setRequestError] = useState("");
  const [isDnaModalOpen, setIsDnaModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [testType, setTestType] = useState("Sexing");
  const [isDeathModalOpen, setIsDeathModalOpen] = useState(false);
  const [isSavingDeath, setIsSavingDeath] = useState(false);
  const [deathDate, setDeathDate] = useState(new Date().toISOString().slice(0, 10));
  const [deathReason, setDeathReason] = useState<ChickDeathReason>("Unknown");
  const [deathNotes, setDeathNotes] = useState("");
  const [editForm, setEditForm] = useState<EditFormState>({
    bandNumber: "",
    hatchDate: "",
    flockId: "",
    hatchGroupId: "",
    status: "Available",
    sex: "Unknown",
    color: "",
    observedTraits: "",
    notes: "",
  });

  const loadProfile = useCallback(async () => {
    try {
      setRequestError("");
      const response = await fetch(`/api/chicks/${chickId}`, { cache: "no-store" });
      if (response.status === 404) {
        setProfile(null);
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to load chick profile.");
      }
      const data = (await response.json()) as ChickProfileResponse;
      setProfile(data);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Failed to load chick profile.");
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [chickId]);

  useEffect(() => {
    if (!chickId) return;
    void loadProfile();
  }, [chickId, loadProfile]);

  async function handleDnaRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;

    try {
      setIsSubmitting(true);
      setRequestError("");
      const response = await fetch("/api/dna-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chickId: profile.chick.id, testType }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Unable to request DNA test.");
      }
      await loadProfile();
      setIsDnaModalOpen(false);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Unable to request DNA test.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function openEditModal() {
    if (!profile) return;

    setEditForm({
      bandNumber: profile.chick.bandNumber,
      hatchDate: profile.chick.hatchDate,
      flockId: profile.chick.flockId,
      hatchGroupId: profile.chick.hatchGroupId || "",
      status: profile.chick.status as ChickStatus,
      sex: profile.chick.sex as BirdSex,
      color: profile.chick.color,
      observedTraits: profile.chick.observedTraits.join(", "),
      notes: profile.chick.notes,
    });
    setRequestError("");
    setIsEditModalOpen(true);
  }

  async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;

    try {
      setIsSavingEdit(true);
      setRequestError("");
      const response = await fetch(`/api/chicks/${profile.chick.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bandNumber: editForm.bandNumber.trim(),
          hatchDate: editForm.hatchDate,
          flockId: editForm.flockId,
          hatchGroupId: editForm.hatchGroupId || undefined,
          status: editForm.status,
          sex: editForm.sex,
          color: editForm.color.trim(),
          observedTraits: splitTraits(editForm.observedTraits),
          notes: editForm.notes.trim(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Unable to update chick.");
      }
      await loadProfile();
      setIsEditModalOpen(false);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Unable to update chick.");
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleDeathRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;

    try {
      setIsSavingDeath(true);
      setRequestError("");
      const response = await fetch("/api/chicks/deaths", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chickId: profile.chick.id,
          deathDate,
          deathReason,
          notes: deathNotes.trim(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Unable to log chick death.");
      }
      await loadProfile();
      setIsDeathModalOpen(false);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Unable to log chick death.");
    } finally {
      setIsSavingDeath(false);
    }
  }

  if (!isLoading && !profile) {
    return (
      <section className="soft-shadow rounded-[30px] border border-[color:var(--line)] bg-white/90 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Chick Profile</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Chick not found</h1>
        <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
          This chick record could not be loaded from the database.
        </p>
        <Link href="/chicks" className="mt-5 inline-flex rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]">
          Back to Chicks
        </Link>
      </section>
    );
  }

  if (isLoading || !profile) {
    return (
      <section className="soft-shadow rounded-[30px] border border-[color:var(--line)] bg-white/90 p-6 text-sm text-[color:var(--muted)]">
        Loading chick profile...
      </section>
    );
  }

  const { chick, notes, photos, dnaTests, deathRecords } = profile;

  return (
    <>
      <div className="space-y-6">
        <section className="soft-shadow overflow-hidden rounded-[32px] border border-[color:var(--line)] bg-white/90">
          <div className="grid gap-6 border-b border-[color:var(--line)] bg-[linear-gradient(135deg,rgba(94,75,182,0.12),rgba(60,169,164,0.10))] px-6 py-7 xl:grid-cols-[minmax(0,1.3fr)_320px]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/chicks" className="rounded-full border border-[color:var(--line)] bg-white/75 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">Back to Chicks</Link>
                <button
                  type="button"
                  onClick={openEditModal}
                  className="rounded-full border border-[color:var(--line)] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)] transition hover:bg-[#f8f7fe]"
                >
                  Edit Chick
                </button>
                <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">{chick.status}</span>
                <span className={dnaStatusClassName(chick.dnaStatus)}>{chick.dnaStatus} DNA</span>
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight">{chick.bandNumber}</h1>
              <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                {formatDate(chick.hatchDate)} · {chick.sex} · {chick.color || "-"} · {chick.flockName}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <SummaryCard label="Current Flock" value={chick.flockName} />
                <SummaryCard label="Hatch Group" value={chick.hatchGroupName || "-"} />
                <SummaryCard label="DNA Requests" value={String(dnaTests.length)} />
                <SummaryCard label="DNA Status" value={chick.dnaStatus} />
              </div>
              {requestError ? <p className="mt-4 text-sm text-[#b34b75]">{requestError}</p> : null}
            </div>
            <div className="rounded-[30px] border border-[color:var(--line)] bg-white/70 p-4">
              {chick.photoUrl ? (
                <div className="overflow-hidden rounded-[24px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={chick.photoUrl} alt={chick.bandNumber} className="h-[260px] w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-[260px] items-center justify-center rounded-[24px] border border-dashed border-[color:var(--line)] bg-[#fcfbff] text-sm text-[color:var(--muted)]">Photo placeholder</div>
              )}
            </div>
          </div>
          <div className="grid gap-6 px-6 py-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
            <div className="space-y-6">
              <section className="rounded-[28px] border border-[color:var(--line)] bg-[#fcfbff] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Overview</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <OverviewCard label="Band Number" value={chick.bandNumber} />
                  <OverviewCard label="Sex" value={chick.sex} />
                  <OverviewCard label="Color" value={chick.color || "-"} />
                  <OverviewCard label="Flock" value={chick.flockName} />
                  <OverviewCard label="Hatch Group" value={chick.hatchGroupName || "-"} />
                  <OverviewCard label="DNA Status" value={chick.dnaStatus} />
                </div>
                <div className="mt-4 rounded-[22px] border border-[color:var(--line)] bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Observed Traits</p>
                  <p className="mt-2 text-sm leading-7 text-foreground">
                    {chick.observedTraits.length > 0 ? chick.observedTraits.join(", ") : "-"}
                  </p>
                </div>
                <div className="mt-4 rounded-[22px] border border-[color:var(--line)] bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Notes</p>
                  <p className="mt-2 text-sm leading-7 text-foreground">{chick.notes || "-"}</p>
                </div>
              </section>

              <section className="rounded-[28px] border border-[color:var(--line)] bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">DNA Testing</p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight">DNA Tracking</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDnaModalOpen(true)}
                    className="rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]"
                  >
                    Request DNA Test
                  </button>
                  {chick.status !== "Deceased" ? (
                    <button
                      type="button"
                      onClick={() => setIsDeathModalOpen(true)}
                      className="rounded-full border border-[#d9c9d2] bg-white px-5 py-3 text-sm font-semibold text-[#8d5d72] transition hover:bg-[#fff7f8]"
                    >
                      Log Chick Loss
                    </button>
                  ) : null}
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <OverviewCard label="Pairing" value={chick.pairingName || "-"} />
                  <OverviewCard label="Produced Traits" value={chick.producedTraitsSummary || "-"} />
                  <OverviewCard label="Sire" value={chick.sireName || "-"} />
                  <OverviewCard label="Dam" value={chick.damName || "-"} />
                </div>
                <div className="mt-5 space-y-3">
                  {dnaTests.length > 0 ? dnaTests.map((test) => (
                    <article key={test.id} className="rounded-[22px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-base font-semibold tracking-tight">{test.testType}</p>
                          <p className="mt-1 text-sm text-[color:var(--muted)]">
                            Requested {formatDate(test.createdAt)}
                          </p>
                        </div>
                        <span className={dnaStatusClassName(test.status as "Pending" | "Completed" | "Cancelled")}>
                          {test.status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                        {test.resultSummary || "No results have been attached to this DNA request yet."}
                      </p>
                    </article>
                  )) : (
                    <EmptyState copy="No DNA requests have been created for this chick yet." />
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-[28px] border border-[color:var(--line)] bg-white p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Loss Records</p>
                <div className="mt-4 space-y-3">
                  {deathRecords.length > 0 ? deathRecords.map((record) => (
                    <article key={record.id} className="rounded-[22px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{record.deathReasonLabel}</p>
                          <p className="mt-1 text-sm text-[color:var(--muted)]">{formatDate(record.deathDate)}</p>
                        </div>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{record.notes || "No additional notes recorded."}</p>
                    </article>
                  )) : <EmptyState copy="No chick loss has been recorded for this chick." />}
                </div>
              </section>
              <section className="rounded-[28px] border border-[color:var(--line)] bg-white p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Notes</p>
                <div className="mt-4 space-y-3">
                  {notes.length > 0 ? notes.map((note) => (
                    <article key={note.id} className="rounded-[22px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
                      <p className="text-sm leading-7 text-foreground">{note.content}</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">{formatDate(note.createdAt)}</p>
                    </article>
                  )) : <EmptyState copy="No notes are attached to this chick yet." />}
                </div>
              </section>
              <section className="rounded-[28px] border border-[color:var(--line)] bg-white p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Photos</p>
                <div className="mt-4 grid gap-4">
                  {photos.length > 0 ? photos.map((photo) => (
                    <article key={photo.id} className="overflow-hidden rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff]">
                      <div className="aspect-[4/3] bg-[#f3f0fe]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo.url} alt={photo.caption} className="h-full w-full object-cover" />
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-semibold text-foreground">{photo.caption}</p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">{formatDate(photo.createdAt)}</p>
                      </div>
                    </article>
                  )) : <EmptyState copy="No chick photos are stored yet." />}
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>

      {isDnaModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#221c3f]/40 px-4 backdrop-blur-sm">
          <div className="soft-shadow w-full max-w-xl rounded-[30px] border border-[color:var(--line)] bg-white p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight">Request DNA Test</h3>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  Create a DNA request and keep the chick record connected to its testing history.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDnaModalOpen(false)}
                className="rounded-2xl border border-[color:var(--line)] px-3 py-2 text-sm text-[color:var(--muted)] transition hover:bg-[#f8f7fe]"
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleDnaRequest} className="mt-6 space-y-4">
              <Field label="Band Number" value={chick.bandNumber} />
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Test Selection</span>
                <select
                  value={testType}
                  onChange={(event) => setTestType(event.target.value)}
                  className={inputClassName()}
                >
                  {dnaTestOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Requesting..." : "Confirm DNA Request"}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {isEditModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#221c3f]/40 px-4 backdrop-blur-sm">
          <div className="soft-shadow w-full max-w-3xl rounded-[30px] border border-[color:var(--line)] bg-white p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight">Edit Chick</h3>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  Update this chick record and save the changes back to HavenHatchr.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-2xl border border-[color:var(--line)] px-3 py-2 text-sm text-[color:var(--muted)] transition hover:bg-[#f8f7fe]"
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Band Number</span>
                <input type="text" value={editForm.bandNumber} onChange={(event) => setEditForm((current) => ({ ...current, bandNumber: event.target.value }))} className={inputClassName()} />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Hatch Date</span>
                <input type="date" value={editForm.hatchDate} onChange={(event) => setEditForm((current) => ({ ...current, hatchDate: event.target.value }))} className={inputClassName()} />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Flock</span>
                <select value={editForm.flockId} onChange={(event) => setEditForm((current) => ({ ...current, flockId: event.target.value }))} className={inputClassName()}>
                  <option value="">Select flock</option>
                  {profile.flocks.map((flock) => (
                    <option key={flock.id} value={flock.id}>{flock.name}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Hatch Group</span>
                <select value={editForm.hatchGroupId} onChange={(event) => setEditForm((current) => ({ ...current, hatchGroupId: event.target.value }))} className={inputClassName()}>
                  <option value="">Optional hatch group</option>
                  {profile.hatchGroups.map((group) => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Status</span>
                <select value={editForm.status} onChange={(event) => setEditForm((current) => ({ ...current, status: event.target.value as ChickStatus }))} className={inputClassName()}>
                  {chickStatusOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Sex</span>
                <select value={editForm.sex} onChange={(event) => setEditForm((current) => ({ ...current, sex: event.target.value as BirdSex }))} className={inputClassName()}>
                  {sexOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Color</span>
                <input type="text" value={editForm.color} onChange={(event) => setEditForm((current) => ({ ...current, color: event.target.value }))} className={inputClassName()} />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Observed Traits</span>
                <input type="text" value={editForm.observedTraits} onChange={(event) => setEditForm((current) => ({ ...current, observedTraits: event.target.value }))} className={inputClassName()} />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Notes</span>
                <textarea value={editForm.notes} onChange={(event) => setEditForm((current) => ({ ...current, notes: event.target.value }))} rows={4} className={`${inputClassName()} resize-none`} />
              </label>
              <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="inline-flex items-center justify-center rounded-full border border-[color:var(--line)] bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-[#f8f7fe]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSavingEdit ? "Saving..." : "Save Chick"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isDeathModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#221c3f]/40 px-4 backdrop-blur-sm">
          <div className="soft-shadow w-full max-w-xl rounded-[30px] border border-[color:var(--line)] bg-white p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight">Log Chick Loss</h3>
                <p className="mt-1 text-sm text-[color:var(--muted)]">
                  Save the loss reason and keep hatch and incubator reports accurate.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDeathModalOpen(false)}
                className="rounded-2xl border border-[color:var(--line)] px-3 py-2 text-sm text-[color:var(--muted)] transition hover:bg-[#f8f7fe]"
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleDeathRecord} className="mt-6 space-y-4">
              <Field label="Band Number" value={chick.bandNumber} />
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Death Date</span>
                <input type="date" value={deathDate} onChange={(event) => setDeathDate(event.target.value)} className={inputClassName()} />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Reason</span>
                <select value={deathReason} onChange={(event) => setDeathReason(event.target.value as ChickDeathReason)} className={inputClassName()}>
                  {deathReasonOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Notes</span>
                <textarea value={deathNotes} onChange={(event) => setDeathNotes(event.target.value)} rows={4} className={`${inputClassName()} resize-none`} />
              </label>
              <button
                type="submit"
                disabled={isSavingDeath}
                className="inline-flex w-full items-center justify-center rounded-full bg-[#8d5d72] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#74485b] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSavingDeath ? "Saving..." : "Save Death Record"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[22px] border border-[color:var(--line)] bg-white/82 p-4"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">{label}</p><p className="mt-2 text-lg font-semibold tracking-tight">{value}</p></div>;
}

function OverviewCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[22px] border border-[color:var(--line)] bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">{label}</p><p className="mt-2 text-sm font-semibold text-foreground">{value}</p></div>;
}

function Field({ label, value }: { label: string; value: string }) {
  return <div className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">{label}</span><input type="text" value={value} readOnly className={`${inputClassName()} bg-[#f7f5ff] text-[color:var(--muted)]`} /></div>;
}

function EmptyState({ copy }: { copy: string }) {
  return <div className="rounded-[22px] border border-dashed border-[color:var(--line)] bg-[#fcfbff] p-4 text-sm text-[color:var(--muted)]">{copy}</div>;
}

function inputClassName() {
  return "w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]";
}

function dnaStatusClassName(status: "None" | "Pending" | "Completed" | "Cancelled") {
  if (status === "Completed") {
    return "rounded-full bg-[#edf7f8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--teal)]";
  }
  if (status === "Pending") {
    return "rounded-full bg-[#ece7fb] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]";
  }
  if (status === "Cancelled") {
    return "rounded-full bg-[#f9e7ef] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#b34b75]";
  }
  return "rounded-full border border-[color:var(--line)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]";
}

function formatDate(value: string) {
  const date = value.includes("T") ? new Date(value) : new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function splitTraits(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
