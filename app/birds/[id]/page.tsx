"use client";

import Link from "next/link";
import { FormEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type BirdProfileResponse = {
  bird: {
    id: string;
    name: string;
    bandNumber: string;
    sex: string;
    breed: string;
    variety: string;
    color: string;
    genetics: string;
    flockId: string;
    flockName: string;
    status: string;
    notes: string;
    photoUrl: string;
    visualTraits: string[];
    carriedTraits: string[];
    genotypeNotes: string;
    projectTags: string[];
    createdAt: string;
    traits: Array<{ id: string; name: string; category: string; description: string }>;
  };
  notes: Array<{ id: string; entityType: string; entityId: string; content: string; createdAt: string }>;
  photos: Array<{ id: string; entityType: string; entityId: string; url: string; caption: string; createdAt: string }>;
  relatedPairings: Array<{
    id: string;
    name: string;
    sireId: string;
    damId: string;
    sireName: string;
    damName: string;
    goals: string;
    targetTraits: string[];
    avoidTraits: string[];
    projectGoal: string;
    notes: string;
    active: boolean;
    createdAt: string;
  }>;
  relatedHatchGroups: Array<{
    id: string;
    name: string;
    pairingId: string;
    setDate: string;
    hatchDate: string;
    eggsSet: number;
    eggsHatched: number;
    producedTraitsSummary: string;
    notes: string;
    createdAt: string;
  }>;
  offspring: Array<{
    id: string;
    bandNumber: string;
    hatchDate: string;
    flockId: string;
    hatchGroupId: string | null;
    hatchGroupName: string;
    status: string;
    sex: string;
    color: string;
    observedTraits: string[];
    notes: string;
    photoUrl: string;
    createdAt: string;
  }>;
  performanceSnapshot: {
    relatedHatchGroupsCount: number;
    estimatedOffspringCount: number;
    averageHatchRate: number;
  };
};

type NoteForm = { content: string };
type GeneticsForm = {
  visualTraits: string;
  carriedTraits: string;
  projectTags: string;
  genotypeNotes: string;
};

const emptyNoteForm: NoteForm = { content: "" };

export default function BirdProfilePage() {
  const params = useParams<{ id: string }>();
  const birdId = typeof params?.id === "string" ? params.id : "";
  const [profile, setProfile] = useState<BirdProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [noteForm, setNoteForm] = useState<NoteForm>(emptyNoteForm);
  const [noteError, setNoteError] = useState("");
  const [geneticsForm, setGeneticsForm] = useState<GeneticsForm>({
    visualTraits: "",
    carriedTraits: "",
    projectTags: "",
    genotypeNotes: "",
  });

  const loadProfile = useCallback(async () => {
    try {
      setRequestError("");
      const response = await fetch(`/api/birds/${birdId}`, { cache: "no-store" });
      if (response.status === 404) {
        setProfile(null);
        return;
      }
      if (!response.ok) throw new Error("Failed to load bird profile.");
      const data = (await response.json()) as BirdProfileResponse;
      setProfile(data);
      setGeneticsForm({
        visualTraits: data.bird.visualTraits.join(", "),
        carriedTraits: data.bird.carriedTraits.join(", "),
        projectTags: data.bird.projectTags.join(", "),
        genotypeNotes: data.bird.genotypeNotes,
      });
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Failed to load bird profile.");
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [birdId]);

  useEffect(() => {
    if (!birdId) return;
    void loadProfile();
  }, [birdId, loadProfile]);

  const bird = useMemo(() => {
    if (!profile) return null;
    return {
      ...profile.bird,
      visualTraits: splitCommaSeparated(geneticsForm.visualTraits),
      carriedTraits: splitCommaSeparated(geneticsForm.carriedTraits),
      projectTags: splitCommaSeparated(geneticsForm.projectTags),
      genotypeNotes: geneticsForm.genotypeNotes.trim(),
    };
  }, [profile, geneticsForm]);

  const birdNotes = profile?.notes ?? [];
  const birdPhotos = profile?.photos ?? [];
  const relatedPairings = profile?.relatedPairings ?? [];
  const relatedHatchGroups = profile?.relatedHatchGroups ?? [];
  const offspring = profile?.offspring ?? [];
  const performanceSnapshot = profile?.performanceSnapshot ?? {
    relatedHatchGroupsCount: 0,
    estimatedOffspringCount: 0,
    averageHatchRate: 0,
  };

  async function handleNoteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!noteForm.content.trim()) {
      setNoteError("Note content is required.");
      return;
    }
    try {
      setIsSavingNote(true);
      setRequestError("");
      setNoteError("");
      const response = await fetch(`/api/birds/${birdId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteForm.content.trim() }),
      });
      if (!response.ok) throw new Error("Failed to save note.");
      const data = (await response.json()) as {
        note: { id: string; entityType: string; entityId: string; content: string; createdAt: string };
      };
      setProfile((current) => (current ? { ...current, notes: [data.note, ...current.notes] } : current));
      setNoteForm(emptyNoteForm);
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Failed to save note.");
    } finally {
      setIsSavingNote(false);
    }
  }

  function handleGeneticsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGeneticsForm((current) => ({
      visualTraits: splitCommaSeparated(current.visualTraits).join(", "),
      carriedTraits: splitCommaSeparated(current.carriedTraits).join(", "),
      projectTags: splitCommaSeparated(current.projectTags).join(", "),
      genotypeNotes: current.genotypeNotes.trim(),
    }));
  }

  function updateGeneticsField<K extends keyof GeneticsForm>(key: K, value: GeneticsForm[K]) {
    setGeneticsForm((current) => ({ ...current, [key]: value }));
  }

  if (!isLoading && !bird) {
    return (
      <section className="soft-shadow rounded-[30px] border border-[color:var(--line)] bg-white/90 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Bird Profile</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Bird not found</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-[color:var(--muted)]">
          This bird record could not be loaded from the database.
        </p>
        <Link href="/birds" className="mt-5 inline-flex rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]">
          Back to Birds
        </Link>
      </section>
    );
  }

  if (isLoading || !bird) {
    return (
      <section className="soft-shadow rounded-[30px] border border-[color:var(--line)] bg-white/90 p-6 text-sm text-[color:var(--muted)]">
        Loading bird profile...
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="soft-shadow overflow-hidden rounded-[32px] border border-[color:var(--line)] bg-white/90">
        <div className="grid gap-6 border-b border-[color:var(--line)] bg-[linear-gradient(135deg,rgba(94,75,182,0.12),rgba(60,169,164,0.10))] px-6 py-7 xl:grid-cols-[minmax(0,1.3fr)_320px]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/birds" className="rounded-full border border-[color:var(--line)] bg-white/75 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">Back to Birds</Link>
              <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">{bird.status}</span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">{bird.name}</h1>
            <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{bird.bandNumber} · {bird.sex} · {bird.breed || "-"} · {bird.variety || "-"} · {bird.color || "-"}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard label="Current Flock" value={bird.flockName || "Unassigned"} />
              <SummaryCard label="Active Pairings" value={String(relatedPairings.length)} />
              <SummaryCard label="Offspring Count" value={String(offspring.length)} />
              <SummaryCard label="Notes Count" value={String(birdNotes.length)} />
            </div>
            {requestError ? <p className="mt-4 text-sm text-[#b34b75]">{requestError}</p> : null}
          </div>
          <div className="rounded-[30px] border border-[color:var(--line)] bg-white/70 p-4">
            {bird.photoUrl ? (
              <div className="overflow-hidden rounded-[24px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={bird.photoUrl} alt={bird.name} className="h-[260px] w-full object-cover" />
              </div>
            ) : (
              <div className="flex h-[260px] items-center justify-center rounded-[24px] border border-dashed border-[color:var(--line)] bg-[#fcfbff] text-sm text-[color:var(--muted)]">Photo placeholder</div>
            )}
          </div>
        </div>
        <div className="grid gap-6 px-6 py-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
          <div className="space-y-6">
            <section className="rounded-[28px] border border-[color:var(--line)] bg-[#fcfbff] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Overview</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <OverviewCard label="Band Number" value={bird.bandNumber} />
                <OverviewCard label="Breed" value={bird.breed || "-"} />
                <OverviewCard label="Variety" value={bird.variety || "-"} />
                <OverviewCard label="Color" value={bird.color || "-"} />
                <OverviewCard label="Sex" value={bird.sex} />
                <OverviewCard label="Status" value={bird.status} />
              </div>
              <div className="mt-4 rounded-[22px] border border-[color:var(--line)] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Breeder Notes</p>
                <p className="mt-2 text-sm leading-7 text-foreground">{bird.notes || "-"}</p>
              </div>
            </section>
            <section className="rounded-[28px] border border-[color:var(--line)] bg-white p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Notes</p>
                <span className="rounded-full bg-[#edf7f8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--teal)]">Prisma-backed</span>
              </div>
              <form onSubmit={handleNoteSubmit} className="mt-4 rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Add Note</span>
                  <textarea value={noteForm.content} onChange={(event) => { setNoteForm({ content: event.target.value }); setNoteError(""); }} rows={4} placeholder="Log a breeder observation, pairing update, or keeper note." className={`${inputClassName()} resize-none`} />
                </label>
                {noteError ? <p className="mt-2 text-sm text-[#b34b75]">{noteError}</p> : null}
                <button type="submit" disabled={isSavingNote} className="mt-4 inline-flex rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0] disabled:cursor-not-allowed disabled:opacity-70">{isSavingNote ? "Saving..." : "Save Note"}</button>
              </form>
              <div className="mt-4 space-y-3">
                {birdNotes.length > 0 ? birdNotes.map((note) => (
                  <article key={note.id} className="rounded-[22px] border border-[color:var(--line)] bg-[#f9f7fe] p-4">
                    <p className="text-sm leading-7 text-foreground">{note.content}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">{formatDate(note.createdAt)}</p>
                  </article>
                )) : <EmptyState copy="No notes are attached to this bird yet." />}
              </div>
            </section>
            <section className="rounded-[28px] border border-[color:var(--line)] bg-white p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Photos</p>
                <button type="button" className="rounded-full border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--muted)] transition hover:bg-[#f8f7fe]">Upload Placeholder</button>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {birdPhotos.length > 0 ? birdPhotos.map((photo) => (
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
                )) : <div className="md:col-span-2"><EmptyState copy="No bird photos are stored yet. Use the upload placeholder to stage future image support." /></div>}
              </div>
            </section>
          </div>
          <div className="space-y-6">
            <section className="rounded-[28px] border border-[color:var(--line)] bg-white p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">AI Helper</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight">Quick bird actions</h2>
                </div>
                <span className="rounded-full bg-[#ece7fb] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">Placeholder AI</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <AiActionLink href={`/ai?tool=listing&birdId=${bird.id}`} label="Generate Listing" />
                <AiActionLink href={`/ai?tool=notes&birdId=${bird.id}`} label="Summarize Notes" />
                <AiActionLink href={`/ai?tool=pairing&birdId=${bird.id}`} label="Suggest Pairing" />
              </div>
            </section>
            {relatedPairings.length > 0 ? (
              <section className="rounded-[28px] border border-[color:var(--line)] bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Performance Snapshot</p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight">Pairing-linked performance</h2>
                  </div>
                  <span className="rounded-full bg-[#edf7f8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--teal)]">Analytics</span>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <GeneticsCard label="Related Hatch Groups Count" value={String(performanceSnapshot.relatedHatchGroupsCount)} />
                  <GeneticsCard label="Estimated Offspring Count" value={String(performanceSnapshot.estimatedOffspringCount)} />
                  <GeneticsCard label="Average Hatch Rate" value={`${performanceSnapshot.averageHatchRate}%`} />
                </div>
              </section>
            ) : null}
            <section className="rounded-[28px] border border-[color:var(--line)] bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Genetics</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight">Breeder genetics hub</h2>
                </div>
                <span className="rounded-full bg-[#edf7f8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--teal)]">Local edits</span>
              </div>
              <div className="mt-5 grid gap-4">
                <GeneticsCard label="Visual Traits" value={formatList(bird.visualTraits)} />
                <GeneticsCard label="Carried Traits" value={formatList(bird.carriedTraits)} />
                <GeneticsCard label="Project Tags" value={formatList(bird.projectTags)} />
                <GeneticsCard label="Genotype Notes" value={bird.genotypeNotes || "No genotype notes recorded yet."} />
                <GeneticsCard label="Related Pairings" value={relatedPairings.length > 0 ? relatedPairings.map((pairing) => pairing.name).join(", ") : "No related pairings yet."} />
                <GeneticsCard label="Offspring Summary" value={offspring.length > 0 ? `${offspring.length} chicks tracked across ${relatedHatchGroups.length} hatch groups. Top observed traits: ${formatList(Array.from(new Set(offspring.flatMap((chick) => chick.observedTraits))).slice(0, 4))}` : "No offspring history connected yet."} />
                {bird.traits.length > 0 ? <GeneticsCard label="Linked Traits" value={formatList(bird.traits.map((trait) => trait.name))} /> : null}
              </div>
              <form onSubmit={handleGeneticsSubmit} className="mt-5 rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">Edit Genetics</p>
                <div className="mt-4 space-y-4">
                  <FormField label="Visual Traits" input={<input type="text" value={geneticsForm.visualTraits} onChange={(event) => updateGeneticsField("visualTraits", event.target.value)} placeholder="Blue Copper, Feathered Shanks" className={inputClassName()} />} />
                  <FormField label="Carried Traits" input={<input type="text" value={geneticsForm.carriedTraits} onChange={(event) => updateGeneticsField("carriedTraits", event.target.value)} placeholder="Deep Shell Color, Beard" className={inputClassName()} />} />
                  <FormField label="Project Tags" input={<input type="text" value={geneticsForm.projectTags} onChange={(event) => updateGeneticsField("projectTags", event.target.value)} placeholder="Dark Egg Project, Keeper Dam" className={inputClassName()} />} />
                  <FormField label="Genotype Notes" input={<textarea value={geneticsForm.genotypeNotes} onChange={(event) => updateGeneticsField("genotypeNotes", event.target.value)} rows={5} placeholder="Add genotype observations, inheritance assumptions, or breeder notes." className={`${inputClassName()} resize-none`} />} />
                </div>
                <button type="submit" className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]">Update Genetics View</button>
              </form>
            </section>
            <section className="rounded-[28px] border border-[color:var(--line)] bg-white p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Pairings</p>
              <div className="mt-4 space-y-3">
                {relatedPairings.length > 0 ? relatedPairings.map((pairing) => (
                  <article key={pairing.id} className="rounded-[22px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold tracking-tight">{pairing.name}</p>
                        <p className="mt-1 text-sm text-[color:var(--muted)]">{pairing.goals || "-"}</p>
                      </div>
                      <span className="rounded-full bg-[#ece7fb] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">{pairing.active ? "Active" : "Inactive"}</span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">Target Traits: {formatList(pairing.targetTraits)}</p>
                  </article>
                )) : <EmptyState copy="No pairings are linked to this bird." />}
              </div>
            </section>
            <section className="rounded-[28px] border border-[color:var(--line)] bg-white p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Offspring History</p>
              <div className="mt-4 space-y-3">
                {offspring.length > 0 ? offspring.map((chick) => (
                  <article key={chick.id} className="rounded-[22px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold tracking-tight">{chick.bandNumber}</p>
                        <p className="mt-1 text-sm text-[color:var(--muted)]">{chick.color || "-"} · {chick.sex} · {formatDate(chick.hatchDate)}</p>
                      </div>
                      <span className="rounded-full bg-[#edf7f8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--teal)]">{chick.status}</span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">Observed Traits: {formatList(chick.observedTraits)}</p>
                  </article>
                )) : <EmptyState copy="No offspring history is connected through current pairings and hatch groups." />}
              </div>
            </section>
            <section className="rounded-[28px] border border-[color:var(--line)] bg-white p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">Related Hatch Groups</p>
              <div className="mt-4 space-y-3">
                {relatedHatchGroups.length > 0 ? relatedHatchGroups.map((group) => (
                  <article key={group.id} className="rounded-[22px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
                    <p className="text-base font-semibold tracking-tight">{group.name}</p>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">{formatDate(group.setDate)} set · {formatDate(group.hatchDate)} hatch</p>
                    <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{group.producedTraitsSummary || "-"}</p>
                  </article>
                )) : <EmptyState copy="No hatch groups are tied to this bird yet." />}
              </div>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[22px] border border-[color:var(--line)] bg-white/82 p-4"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">{label}</p><p className="mt-2 text-lg font-semibold tracking-tight">{value}</p></div>;
}

function OverviewCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[22px] border border-[color:var(--line)] bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">{label}</p><p className="mt-2 text-sm font-semibold text-foreground">{value}</p></div>;
}

function GeneticsCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[22px] border border-[color:var(--line)] bg-white p-4"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">{label}</p><p className="mt-2 text-sm leading-7 text-foreground">{value}</p></div>;
}

function FormField({ label, input }: { label: string; input: ReactNode }) {
  return <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">{label}</span>{input}</label>;
}

function EmptyState({ copy }: { copy: string }) {
  return <div className="rounded-[22px] border border-dashed border-[color:var(--line)] bg-[#fcfbff] p-4 text-sm text-[color:var(--muted)]">{copy}</div>;
}

function AiActionLink({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="rounded-[20px] border border-[color:var(--line)] bg-[#fcfbff] px-4 py-4 text-sm font-semibold text-foreground transition hover:bg-white">{label}</Link>;
}

function inputClassName() {
  return "w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]";
}

function formatDate(value: string) {
  const date = value.includes("T") ? new Date(value) : new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function splitCommaSeparated(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function formatList(values: string[]) {
  return values.length > 0 ? values.join(", ") : "-";
}
