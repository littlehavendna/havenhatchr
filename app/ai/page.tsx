"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  analyzeHatchRates,
  draftCustomerReply,
  generateListingText,
  getExistingPairingContext,
  suggestPairings,
  summarizeBreedingNotes,
} from "@/lib/ai-tools";
import { birds, chicks, customers, flocks, hatchGroups, pairings, traits } from "@/lib/mock-data";
import type { Bird, Chick, Customer } from "@/lib/types";

type ListingForm = {
  selectedId: string;
  sourceType: "bird" | "chick";
  breed: string;
  variety: string;
  color: string;
  sex: string;
  notes: string;
  price: string;
};

type NotesForm = {
  text: string;
};

type ReplyForm = {
  customerId: string;
  topic: string;
  customNotes: string;
};

type PairingForm = {
  sireId: string;
  damId: string;
  breedingGoal: string;
  targetTraits: string;
  avoidTraits: string;
};

const emptyListingForm: ListingForm = {
  selectedId: "",
  sourceType: "bird",
  breed: "",
  variety: "",
  color: "",
  sex: "",
  notes: "",
  price: "$",
};

const emptyNotesForm: NotesForm = {
  text: "",
};

const emptyReplyForm: ReplyForm = {
  customerId: "",
  topic: "",
  customNotes: "",
};

const emptyPairingForm: PairingForm = {
  sireId: "",
  damId: "",
  breedingGoal: "",
  targetTraits: "",
  avoidTraits: "",
};

export default function AiToolsPage() {
  return (
    <Suspense fallback={<AiToolsFallback />}>
      <AiToolsClientPage />
    </Suspense>
  );
}

function AiToolsClientPage() {
  const searchParams = useSearchParams();

  const tool = searchParams.get("tool");
  const customerIdParam = searchParams.get("customerId");
  const customerNameParam = searchParams.get("customerName");
  const birdIdParam = searchParams.get("birdId");

  const initialBird = birdIdParam
    ? birds.find((entry) => entry.id === birdIdParam) ?? null
    : null;

  const [listingForm, setListingForm] = useState<ListingForm>(() => {
    if (tool === "listing" && initialBird) {
      return {
        selectedId: `bird:${initialBird.id}`,
        sourceType: "bird",
        breed: initialBird.breed,
        variety: initialBird.variety,
        color: initialBird.color,
        sex: initialBird.sex,
        notes: initialBird.notes,
        price: "$",
      };
    }

    return emptyListingForm;
  });
  const [listingOutput, setListingOutput] = useState("");

  const [notesForm, setNotesForm] = useState<NotesForm>(() => {
    if (tool === "notes" && initialBird) {
      return { text: initialBird.notes };
    }

    return emptyNotesForm;
  });
  const [notesOutput, setNotesOutput] = useState("");

  const [replyForm, setReplyForm] = useState<ReplyForm>(() => {
    if (tool === "reply" && customerIdParam) {
      return {
        customerId: customerIdParam,
        topic: `your recent HavenHatchr inquiry${
          customerNameParam ? `, ${customerNameParam}` : ""
        }`,
        customNotes: "",
      };
    }

    return emptyReplyForm;
  });
  const [replyOutput, setReplyOutput] = useState("");

  const [pairingForm, setPairingForm] = useState<PairingForm>(() => {
    if (tool === "pairing" && initialBird?.sex === "Male") {
      return { ...emptyPairingForm, sireId: initialBird.id };
    }

    if (tool === "pairing" && initialBird?.sex === "Female") {
      return { ...emptyPairingForm, damId: initialBird.id };
    }

    return emptyPairingForm;
  });
  const [pairingOutput, setPairingOutput] = useState<ReturnType<typeof suggestPairings> | null>(
    null,
  );

  const [hatchAnalysis] = useState(() => analyzeHatchRates(hatchGroups));

  const listingOptions = useMemo(
    () => [
      ...birds.map((bird) => ({
        id: `bird:${bird.id}`,
        label: `${bird.name} (${bird.bandNumber})`,
        sourceType: "bird" as const,
      })),
      ...chicks.map((chick) => ({
        id: `chick:${chick.id}`,
        label: `${chick.bandNumber} (${chick.color})`,
        sourceType: "chick" as const,
      })),
    ],
    [],
  );

  const selectedBird = birds.find((bird) => bird.id === pairingForm.sireId);
  const selectedDam = birds.find((bird) => bird.id === pairingForm.damId);

  function handleListingSelect(value: string) {
    const [sourceType, id] = value.split(":");
    const selected =
      sourceType === "bird"
        ? birds.find((bird) => bird.id === id)
        : chicks.find((chick) => chick.id === id);

    if (!selected) {
      setListingForm((current) => ({ ...current, selectedId: value }));
      return;
    }

    if (sourceType === "bird") {
      const bird = selected as Bird;
      setListingForm({
        selectedId: value,
        sourceType: "bird",
        breed: bird.breed,
        variety: bird.variety,
        color: bird.color,
        sex: bird.sex,
        notes: bird.notes,
        price: listingForm.price,
      });
      return;
    }

    const chick = selected as Chick;
    setListingForm({
      selectedId: value,
      sourceType: "chick",
      breed: flocksBreed(chick.flockId),
      variety: flocksVariety(chick.flockId),
      color: chick.color,
      sex: chick.sex,
      notes: chick.notes,
      price: listingForm.price,
    });
  }

  function handleGenerateListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const selectedRecord =
      listingForm.sourceType === "bird"
        ? birds.find((bird) => `bird:${bird.id}` === listingForm.selectedId) ?? null
        : chicks.find((chick) => `chick:${chick.id}` === listingForm.selectedId) ?? null;

    setListingOutput(
      generateListingText({
        selectedBirdOrChick: selectedRecord,
        breed: listingForm.breed,
        variety: listingForm.variety,
        color: listingForm.color,
        sex: listingForm.sex,
        notes: listingForm.notes,
        price: listingForm.price,
      }),
    );
  }

  function handleSummarizeNotes(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotesOutput(summarizeBreedingNotes(notesForm.text));
  }

  function handleDraftReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const customer =
      customers.find((entry) => entry.id === replyForm.customerId) ?? (null as Customer | null);

    setReplyOutput(
      draftCustomerReply({
        customer,
        topic: replyForm.topic,
        customNotes: replyForm.customNotes,
      }),
    );
  }

  function handleSuggestPairing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const sire = birds.find((bird) => bird.id === pairingForm.sireId) ?? null;
    const dam = birds.find((bird) => bird.id === pairingForm.damId) ?? null;
    const existingContext = getExistingPairingContext(sire, dam, pairings);
    const suggestion = suggestPairings({
      sire,
      dam,
      breedingGoal: pairingForm.breedingGoal,
      targetTraits: splitTags(pairingForm.targetTraits),
      avoidTraits: splitTags(pairingForm.avoidTraits),
    });

    setPairingOutput({
      ...suggestion,
      recommendedNextStep: existingContext
        ? `${suggestion.recommendedNextStep} Existing pairing context found: ${existingContext.name}.`
        : suggestion.recommendedNextStep,
    });
  }

  return (
    <div className="space-y-6">
      <section className="soft-shadow rounded-[32px] border border-[color:var(--line)] bg-white/90 p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Premium Workflow
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">AI Tools</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
              Placeholder AI tools are wired into the breeder workflow now, with clean UI hooks
              and structured utility functions ready for future API-backed generation.
            </p>
          </div>
          <div className="rounded-[26px] border border-[color:var(--line)] bg-[#fcfbff] px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Hatch Insight
            </p>
            <p className="mt-2 max-w-sm text-sm leading-7 text-[color:var(--muted)]">
              {hatchAnalysis}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <ToolCard
          title="Listing Writer"
          description="Draft breeder-ready listing copy for a bird or chick record."
        >
          <form onSubmit={handleGenerateListing} className="space-y-4">
            <FormField
              label="Bird or Chick Selection"
              input={
                <select
                  value={listingForm.selectedId}
                  onChange={(event) => handleListingSelect(event.target.value)}
                  className={inputClassName()}
                >
                  <option value="">Select record</option>
                  {listingOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Breed"
                input={
                  <input
                    type="text"
                    value={listingForm.breed}
                    onChange={(event) =>
                      setListingForm((current) => ({ ...current, breed: event.target.value }))
                    }
                    className={inputClassName()}
                  />
                }
              />
              <FormField
                label="Variety"
                input={
                  <input
                    type="text"
                    value={listingForm.variety}
                    onChange={(event) =>
                      setListingForm((current) => ({ ...current, variety: event.target.value }))
                    }
                    className={inputClassName()}
                  />
                }
              />
              <FormField
                label="Color"
                input={
                  <input
                    type="text"
                    value={listingForm.color}
                    onChange={(event) =>
                      setListingForm((current) => ({ ...current, color: event.target.value }))
                    }
                    className={inputClassName()}
                  />
                }
              />
              <FormField
                label="Sex"
                input={
                  <input
                    type="text"
                    value={listingForm.sex}
                    onChange={(event) =>
                      setListingForm((current) => ({ ...current, sex: event.target.value }))
                    }
                    className={inputClassName()}
                  />
                }
              />
              <FormField
                label="Price"
                input={
                  <input
                    type="text"
                    value={listingForm.price}
                    onChange={(event) =>
                      setListingForm((current) => ({ ...current, price: event.target.value }))
                    }
                    className={inputClassName()}
                  />
                }
              />
            </div>
            <FormField
              label="Notes"
              input={
                <textarea
                  value={listingForm.notes}
                  onChange={(event) =>
                    setListingForm((current) => ({ ...current, notes: event.target.value }))
                  }
                  rows={4}
                  className={`${inputClassName()} resize-none`}
                />
              }
            />
            <button type="submit" className={primaryButtonClassName()}>
              Generate Listing
            </button>
          </form>
          <OutputCard
            title="Generated Listing"
            body={
              listingOutput ||
              "Generate a listing to see a polished placeholder sales paragraph for website or social use."
            }
          />
        </ToolCard>

        <ToolCard
          title="Breeding Note Summarizer"
          description="Turn long freeform breeder notes into a cleaner working summary."
        >
          <form onSubmit={handleSummarizeNotes} className="space-y-4">
            <FormField
              label="Breeding Notes"
              input={
                <textarea
                  value={notesForm.text}
                  onChange={(event) => setNotesForm({ text: event.target.value })}
                  rows={10}
                  placeholder="Paste breeder notes, hatch observations, keeper decisions, or pair review notes."
                  className={`${inputClassName()} resize-none`}
                />
              }
            />
            <button type="submit" className={primaryButtonClassName()}>
              Summarize Notes
            </button>
          </form>
          <OutputCard
            title="Summary"
            body={
              notesOutput ||
              "Add breeding notes to produce a short clean summary with key points."
            }
          />
        </ToolCard>

        <ToolCard
          title="Customer Reply Draft"
          description="Create a friendly professional customer response from shared customer records."
        >
          <form onSubmit={handleDraftReply} className="space-y-4">
            <FormField
              label="Customer Name"
              input={
                <select
                  value={replyForm.customerId}
                  onChange={(event) =>
                    setReplyForm((current) => ({ ...current, customerId: event.target.value }))
                  }
                  className={inputClassName()}
                >
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              }
            />
            <FormField
              label="Inquiry Topic"
              input={
                <input
                  type="text"
                  value={replyForm.topic}
                  onChange={(event) =>
                    setReplyForm((current) => ({ ...current, topic: event.target.value }))
                  }
                  placeholder="availability for lavender pullets"
                  className={inputClassName()}
                />
              }
            />
            <FormField
              label="Custom Notes"
              input={
                <textarea
                  value={replyForm.customNotes}
                  onChange={(event) =>
                    setReplyForm((current) => ({ ...current, customNotes: event.target.value }))
                  }
                  rows={6}
                  placeholder="Add reservation context, pickup timing, or a breeder note."
                  className={`${inputClassName()} resize-none`}
                />
              }
            />
            <button type="submit" className={primaryButtonClassName()}>
              Draft Reply
            </button>
          </form>
          <OutputCard
            title="Reply Draft"
            body={
              replyOutput ||
              "Generate a reply to see a placeholder response that can later be replaced with a real AI draft."
            }
            preserveWhitespace
          />
        </ToolCard>

        <ToolCard
          title="Pairing Suggestions"
          description="Review a sire and dam combination with breeder-focused placeholder guidance."
        >
          <form onSubmit={handleSuggestPairing} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Select Sire"
                input={
                  <select
                    value={pairingForm.sireId}
                    onChange={(event) =>
                      setPairingForm((current) => ({ ...current, sireId: event.target.value }))
                    }
                    className={inputClassName()}
                  >
                    <option value="">Select sire</option>
                    {birds
                      .filter((bird) => bird.sex === "Male")
                      .map((bird) => (
                        <option key={bird.id} value={bird.id}>
                          {bird.name} ({bird.bandNumber})
                        </option>
                      ))}
                  </select>
                }
              />
              <FormField
                label="Select Dam"
                input={
                  <select
                    value={pairingForm.damId}
                    onChange={(event) =>
                      setPairingForm((current) => ({ ...current, damId: event.target.value }))
                    }
                    className={inputClassName()}
                  >
                    <option value="">Select dam</option>
                    {birds
                      .filter((bird) => bird.sex === "Female")
                      .map((bird) => (
                        <option key={bird.id} value={bird.id}>
                          {bird.name} ({bird.bandNumber})
                        </option>
                      ))}
                  </select>
                }
              />
            </div>
            <FormField
              label="Breeding Goal"
              input={
                <textarea
                  value={pairingForm.breedingGoal}
                  onChange={(event) =>
                    setPairingForm((current) => ({
                      ...current,
                      breedingGoal: event.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Refine dark shell depth while holding body width and copper balance."
                  className={`${inputClassName()} resize-none`}
                />
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Target Traits"
                input={
                  <input
                    type="text"
                    list="trait-options"
                    value={pairingForm.targetTraits}
                    onChange={(event) =>
                      setPairingForm((current) => ({
                        ...current,
                        targetTraits: event.target.value,
                      }))
                    }
                    placeholder="Dark Egg Line, Body Width"
                    className={inputClassName()}
                  />
                }
              />
              <FormField
                label="Avoid Traits"
                input={
                  <input
                    type="text"
                    list="trait-options"
                    value={pairingForm.avoidTraits}
                    onChange={(event) =>
                      setPairingForm((current) => ({
                        ...current,
                        avoidTraits: event.target.value,
                      }))
                    }
                    placeholder="Light Shell Color, Weak Beard"
                    className={inputClassName()}
                  />
                }
              />
            </div>
            <datalist id="trait-options">
              {traits.map((trait) => (
                <option key={trait.id} value={trait.name} />
              ))}
            </datalist>
            <button type="submit" className={primaryButtonClassName()}>
              Suggest Pairing
            </button>
          </form>

          <div className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Suggestion Card
            </p>
            {pairingOutput ? (
              <div className="mt-4 space-y-3">
                <SuggestionRow label="Pairing Summary" value={pairingOutput.pairingSummary} />
                <SuggestionRow label="Strengths" value={pairingOutput.strengths} />
                <SuggestionRow
                  label="Potential Concerns"
                  value={pairingOutput.potentialConcerns}
                />
                <SuggestionRow
                  label="Recommended Next Step"
                  value={pairingOutput.recommendedNextStep}
                />
              </div>
            ) : (
              <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                Select a sire and dam to generate a pairing summary, strengths, concerns, and
                recommended next step.
              </p>
            )}
            {selectedBird || selectedDam ? (
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                Current selection: {selectedBird?.name ?? "No sire"} / {selectedDam?.name ?? "No dam"}
              </p>
            ) : null}
          </div>
        </ToolCard>
      </div>

      <ToolCard
        title="Analyze Hatch Rates"
        description="Use the shared placeholder analytics function to surface a breeder-friendly hatch summary."
      >
        <div className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
            Hatch Rate Summary
          </p>
          <p className="mt-3 text-sm leading-7 text-foreground">{hatchAnalysis}</p>
        </div>
      </ToolCard>
    </div>
  );
}

function AiToolsFallback() {
  return (
    <section className="soft-shadow rounded-[32px] border border-[color:var(--line)] bg-white/90 p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
        AI Tools
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Loading AI workspace</h1>
      <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
        Preparing the placeholder AI tools and prefilled workflow context.
      </p>
    </section>
  );
}

function ToolCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="soft-shadow rounded-[32px] border border-[color:var(--line)] bg-white/90 p-6">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{description}</p>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function FormField({
  label,
  input,
}: {
  label: string;
  input: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
        {label}
      </span>
      {input}
    </label>
  );
}

function OutputCard({
  title,
  body,
  preserveWhitespace,
}: {
  title: string;
  body: string;
  preserveWhitespace?: boolean;
}) {
  return (
    <div className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
        {title}
      </p>
      <p
        className={`mt-3 text-sm leading-7 text-foreground ${
          preserveWhitespace ? "whitespace-pre-wrap" : ""
        }`}
      >
        {body}
      </p>
    </div>
  );
}

function SuggestionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-sm leading-7 text-foreground">{value}</p>
    </div>
  );
}

function primaryButtonClassName() {
  return "inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0]";
}

function inputClassName() {
  return "w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]";
}

function flocksBreed(flockId: string) {
  return flocks.find((flock) => flock.id === flockId)?.breed ?? "Unspecified";
}

function flocksVariety(flockId: string) {
  return flocks.find((flock) => flock.id === flockId)?.variety ?? "Unspecified";
}

function splitTags(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
