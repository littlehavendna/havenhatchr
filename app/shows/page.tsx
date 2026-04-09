"use client";

import {
  FormEvent,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { StatCard } from "@/components/stat-card";

type ShowSummary = {
  id: string;
  showName: string;
  location: string;
  date: string;
  standardsProfile: string;
  awardTemplateName: string;
  specialShowDivision: string;
  notes: string;
  entryCount: number;
};

type ShowOption = {
  id: string;
  showName: string;
  date: string;
  standardsProfile: string;
  awardTemplateName: string;
  specialShowDivision: string;
};

type BirdOption = {
  id: string;
  name: string;
  bandNumber: string;
  breed: string;
  variety: string;
  sex: string;
};

type ShowEntry = {
  id: string;
  showId: string;
  showName: string;
  showDate: string;
  location: string;
  birdId: string;
  birdName: string;
  bandNumber: string;
  entryType: string;
  species: string;
  sizeClass: string;
  sexClass: string;
  ageClass: string;
  breed: string;
  variety: string;
  apaClass: string;
  varietyClassification: string;
  division: string;
  specialShowDivision: string;
  entryClass: string;
  specialEntryType: string;
  awardTemplateKey: string;
  breedClubAward: string;
  showString: string;
  result: string;
  placement: string;
  awards: string[];
  customAwardText: string;
  pointsEarned: number;
  judgeName: string;
  judgeNumber: string;
  judgeComments: string;
  numberInClass: number;
  numberOfExhibitors: number;
  isWin: boolean;
  createdAt: string;
};

type CountItem = {
  count: number;
  breed?: string;
  variety?: string;
  entryClass?: string;
  birdName?: string;
};

type ShowStringGroup = {
  id: string;
  sizeClass: string;
  breed: string;
  variety: string;
  sexClass: string;
  ageClass: string;
  entries: ShowEntry[];
};

type ShowsResponse = {
  upcomingShows: ShowSummary[];
  pastShows: ShowSummary[];
  entries: ShowEntry[];
  showStringGroups: ShowStringGroup[];
  standardsSupport: {
    profiles: string[];
    awardTemplates: string[];
    species: Array<{
      species: string;
      sizeClasses: string[];
      sexClasses: string[];
      ageClasses: string[];
      apaClasses: string[];
      specialShowDivisions: string[];
      awardTemplates: string[];
    }>;
  };
  report: {
    entriesByBreed: CountItem[];
    entriesByVariety: CountItem[];
    entriesByClass: CountItem[];
    winsByBird: CountItem[];
    winsByBreed: CountItem[];
    topPerformingVarieties: Array<{ variety: string; wins: number; points: number }>;
    bestBirdsOverTime: Array<{
      birdName: string;
      bandNumber: string;
      showName: string;
      showDate: string;
      placement: string;
      awards: string[];
      pointsEarned: number;
    }>;
    recentJudgeComments: Array<{
      id: string;
      birdName: string;
      showName: string;
      showDate: string;
      judgeName: string;
      judgeComments: string;
    }>;
  };
  birds: BirdOption[];
  shows: ShowOption[];
};

type TabKey = "overview" | "showString" | "report";

const sizeClassOptions = ["Large Fowl", "Bantam"];
const sexClassOptions = ["Cock", "Cockerel", "Hen", "Pullet"];
const ageClassOptions = ["Adult", "Young", "Old Trio", "Young Trio"];
const specialEntryTypeOptions = ["Single", "Pair", "Trio", "Display", "Other"];
const divisionOptions = [
  "American",
  "Asiatic",
  "Mediterranean",
  "Continental",
  "English",
  "Game",
  "All Other Standard Breeds",
  "Bantam",
  "Waterfowl",
  "Ratite",
  "Other",
];
const poultryAwardOptions = [
  { key: "bestOfBreed", label: "Best of Breed" },
  { key: "reserveOfBreed", label: "Reserve of Breed" },
  { key: "bestOfVariety", label: "Best of Variety" },
  { key: "reserveOfVariety", label: "Reserve of Variety" },
  { key: "bestAmerican", label: "Best American" },
  { key: "bestAsiatic", label: "Best Asiatic" },
  { key: "bestMediterranean", label: "Best Mediterranean" },
  { key: "bestContinental", label: "Best Continental" },
  { key: "bestEnglish", label: "Best English" },
  { key: "bestGame", label: "Best Game" },
  { key: "bestAllOtherStandardBreeds", label: "Best All Other Standard Breeds" },
  { key: "bestBantam", label: "Best Bantam" },
  { key: "bestInShow", label: "Best in Show" },
  { key: "reserveInShow", label: "Reserve in Show" },
] as const;

type EntryFormState = {
  showId: string;
  birdId: string;
  entryType: string;
  species: string;
  sizeClass: string;
  sexClass: string;
  ageClass: string;
  breed: string;
  variety: string;
  apaClass: string;
  varietyClassification: string;
  division: string;
  specialShowDivision: string;
  entryClass: string;
  specialEntryType: string;
  awardTemplateKey: string;
  breedClubAward: string;
  showString: string;
  result: string;
  placement: string;
  pointsEarned: number;
  judgeName: string;
  judgeNumber: string;
  judgeComments: string;
  customAwardText: string;
  numberInClass: number;
  numberOfExhibitors: number;
  isWin: boolean;
  bestOfBreed: boolean;
  reserveOfBreed: boolean;
  bestOfVariety: boolean;
  reserveOfVariety: boolean;
  bestAmerican: boolean;
  bestAsiatic: boolean;
  bestMediterranean: boolean;
  bestContinental: boolean;
  bestEnglish: boolean;
  bestGame: boolean;
  bestAllOtherStandardBreeds: boolean;
  bestBantam: boolean;
  bestInShow: boolean;
  reserveInShow: boolean;
};

const emptyEntryForm: EntryFormState = {
  showId: "",
  birdId: "",
  entryType: "Poultry",
  species: "Chicken",
  sizeClass: "Large Fowl",
  sexClass: "",
  ageClass: "Adult",
  breed: "",
  variety: "",
  apaClass: "",
  varietyClassification: "",
  division: "",
  specialShowDivision: "",
  entryClass: "",
  specialEntryType: "Single",
  awardTemplateKey: "",
  breedClubAward: "",
  showString: "",
  result: "",
  placement: "",
  pointsEarned: 0,
  judgeName: "",
  judgeNumber: "",
  judgeComments: "",
  customAwardText: "",
  numberInClass: 0,
  numberOfExhibitors: 0,
  isWin: false,
  bestOfBreed: false,
  reserveOfBreed: false,
  bestOfVariety: false,
  reserveOfVariety: false,
  bestAmerican: false,
  bestAsiatic: false,
  bestMediterranean: false,
  bestContinental: false,
  bestEnglish: false,
  bestGame: false,
  bestAllOtherStandardBreeds: false,
  bestBantam: false,
  bestInShow: false,
  reserveInShow: false,
};

export default function ShowsPage() {
  const [data, setData] = useState<ShowsResponse | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [showForm, setShowForm] = useState({
    showName: "",
    location: "",
    date: "",
    standardsProfile: "Open Poultry",
    awardTemplateName: "Default Poultry Awards",
    specialShowDivision: "",
    notes: "",
  });
  const [entryForm, setEntryForm] = useState<EntryFormState>(emptyEntryForm);

  useEffect(() => {
    void loadShows();
  }, []);

  const selectedBird = useMemo(
    () => (data?.birds ?? []).find((bird) => bird.id === entryForm.birdId) ?? null,
    [data?.birds, entryForm.birdId],
  );
  const selectedSpeciesSupport = useMemo(
    () =>
      (data?.standardsSupport.species ?? []).find(
        (speciesSupport) => speciesSupport.species === entryForm.species,
      ) ?? (data?.standardsSupport.species ?? [])[0] ?? null,
    [data?.standardsSupport.species, entryForm.species],
  );

  useEffect(() => {
    if (!selectedBird) {
      return;
    }

    setEntryForm((current) => ({
      ...current,
      breed: current.breed || selectedBird.breed || "",
      variety: current.variety || selectedBird.variety || "",
      sexClass: current.sexClass || defaultSexClassFromBird(selectedBird.sex),
    }));
  }, [selectedBird]);

  async function loadShows() {
    try {
      const response = await fetch("/api/shows", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to load shows.");
      }

      setData((await response.json()) as ShowsResponse);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load shows.");
    }
  }

  async function submitShow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setIsSaving(true);
      const response = await fetch("/api/shows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "createShow", ...showForm }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Failed to create show.");
      }

      setShowForm({
        showName: "",
        location: "",
        date: "",
        standardsProfile: "Open Poultry",
        awardTemplateName: "Default Poultry Awards",
        specialShowDivision: "",
        notes: "",
      });
      await loadShows();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to create show.");
    } finally {
      setIsSaving(false);
    }
  }

  async function submitEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setIsSaving(true);
      const response = await fetch("/api/shows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "createEntry", ...entryForm }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Failed to save show result.");
      }

      setEntryForm(emptyEntryForm);
      await loadShows();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save show result.");
    } finally {
      setIsSaving(false);
    }
  }

  const stats = [
    {
      label: "Upcoming Shows",
      value: String(data?.upcomingShows.length ?? 0),
      detail: "Shows you are actively preparing birds, trios, and displays for.",
    },
    {
      label: "Show Entries",
      value: String(data?.entries.length ?? 0),
      detail: "Recorded poultry entries across singles, pairs, trios, and display groups.",
    },
    {
      label: "Awarded Entries",
      value: String((data?.entries ?? []).filter((entry) => entry.awards.length > 0 || entry.isWin).length),
      detail: "Entries with placements, breed wins, variety wins, or major awards.",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
          Shows
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Poultry exhibition records built for breeders
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
          Log entries, maintain a clean show string, record poultry awards and judge comments, and
          review breed-level results over time.
        </p>
        {error ? <p className="mt-4 text-sm text-[#b34b75]">{error}</p> : null}
        <div className="mt-5 flex flex-wrap gap-2">
          <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>
            Show Desk
          </TabButton>
          <TabButton active={activeTab === "showString"} onClick={() => setActiveTab("showString")}>
            Show String
          </TabButton>
          <TabButton active={activeTab === "report"} onClick={() => setActiveTab("report")}>
            Show Report
          </TabButton>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} detail={card.detail} />
        ))}
      </section>

      <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Standards Foundation
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              Future-ready poultry standards architecture
            </h2>
          </div>
          <span className="rounded-full bg-[#edf7f8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--teal)]">
            No rules engine yet
          </span>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FoundationCard
            title="Profiles"
            detail={(data?.standardsSupport.profiles ?? []).join(" | ") || "Open Poultry"}
          />
          <FoundationCard
            title="APA Mapping"
            detail="APA class, breed, variety, and division fields are now optional entry data."
          />
          <FoundationCard
            title="Species Templates"
            detail={(data?.standardsSupport.species ?? []).map((item) => item.species).join(" | ")}
          />
          <FoundationCard
            title="Award Templates"
            detail={(data?.standardsSupport.awardTemplates ?? []).join(" | ")}
          />
        </div>
      </section>

      {activeTab === "overview" ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Add Show
              </p>
              <form onSubmit={submitShow} className="mt-5 grid gap-4">
                <Field label="Show Name">
                  <input
                    value={showForm.showName}
                    onChange={(event) =>
                      setShowForm((current) => ({ ...current, showName: event.target.value }))
                    }
                    className={inputClassName()}
                    placeholder="Spring Poultry Classic"
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Location">
                    <input
                      value={showForm.location}
                      onChange={(event) =>
                        setShowForm((current) => ({ ...current, location: event.target.value }))
                      }
                      className={inputClassName()}
                      placeholder="Louisville, KY"
                    />
                  </Field>
                  <Field label="Show Date">
                    <input
                      type="date"
                      value={showForm.date}
                      onChange={(event) =>
                        setShowForm((current) => ({ ...current, date: event.target.value }))
                      }
                      className={inputClassName()}
                    />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Standards Profile">
                    <select
                      value={showForm.standardsProfile}
                      onChange={(event) =>
                        setShowForm((current) => ({
                          ...current,
                          standardsProfile: event.target.value,
                        }))
                      }
                      className={inputClassName()}
                    >
                      {(data?.standardsSupport.profiles ?? []).map((profile) => (
                        <option key={profile} value={profile}>
                          {profile}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Award Template">
                    <select
                      value={showForm.awardTemplateName}
                      onChange={(event) =>
                        setShowForm((current) => ({
                          ...current,
                          awardTemplateName: event.target.value,
                        }))
                      }
                      className={inputClassName()}
                    >
                      {(data?.standardsSupport.awardTemplates ?? []).map((template) => (
                        <option key={template} value={template}>
                          {template}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="Special Show Division">
                  <input
                    value={showForm.specialShowDivision}
                    onChange={(event) =>
                      setShowForm((current) => ({
                        ...current,
                        specialShowDivision: event.target.value,
                      }))
                    }
                    className={inputClassName()}
                    placeholder="Junior Show, Breed Club Meet, District Meet"
                  />
                </Field>
                <Field label="Notes">
                  <textarea
                    value={showForm.notes}
                    onChange={(event) =>
                      setShowForm((current) => ({ ...current, notes: event.target.value }))
                    }
                    rows={3}
                    className={`${inputClassName()} resize-none`}
                    placeholder="Travel notes, coop setup, hotel, cages, or pull list reminders"
                  />
                </Field>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSaving ? "Saving..." : "Add Show"}
                  </button>
                </div>
              </form>
            </section>

            <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                    Enter Result
                  </p>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight">
                    Poultry entry and award record
                  </h2>
                </div>
                <span className="rounded-full bg-[#edf7f8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--teal)]">
                  Mobile friendly
                </span>
              </div>

              <form onSubmit={submitEntry} className="mt-5 grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Show">
                    <select
                      value={entryForm.showId}
                      onChange={(event) => updateEntryField(setEntryForm, "showId", event.target.value)}
                      className={inputClassName()}
                    >
                      <option value="">Select show</option>
                      {(data?.shows ?? []).map((show) => (
                        <option key={show.id} value={show.id}>
                          {show.showName} | {formatDate(show.date)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Bird">
                    <select
                      value={entryForm.birdId}
                      onChange={(event) => updateEntryField(setEntryForm, "birdId", event.target.value)}
                      className={inputClassName()}
                    >
                      <option value="">Select bird</option>
                      {(data?.birds ?? []).map((bird) => (
                        <option key={bird.id} value={bird.id}>
                          {bird.name} | {bird.bandNumber}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="Entry Type">
                    <input
                      value={entryForm.entryType}
                      onChange={(event) => updateEntryField(setEntryForm, "entryType", event.target.value)}
                      className={inputClassName()}
                      placeholder="Poultry"
                    />
                  </Field>
                  <Field label="Species">
                    <input
                      value={entryForm.species}
                      onChange={(event) => updateEntryField(setEntryForm, "species", event.target.value)}
                      className={inputClassName()}
                      placeholder="Chicken"
                    />
                  </Field>
                  <Field label="Size Class">
                    <select
                      value={entryForm.sizeClass}
                      onChange={(event) => updateEntryField(setEntryForm, "sizeClass", event.target.value)}
                      className={inputClassName()}
                    >
                      {(selectedSpeciesSupport?.sizeClasses ?? sizeClassOptions).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Special Entry Type">
                    <select
                      value={entryForm.specialEntryType}
                      onChange={(event) =>
                        updateEntryField(setEntryForm, "specialEntryType", event.target.value)
                      }
                      className={inputClassName()}
                    >
                      {specialEntryTypeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="Sex Class">
                    <select
                      value={entryForm.sexClass}
                      onChange={(event) => updateEntryField(setEntryForm, "sexClass", event.target.value)}
                      className={inputClassName()}
                    >
                      <option value="">Select sex class</option>
                      {(selectedSpeciesSupport?.sexClasses ?? sexClassOptions).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Age Class">
                    <select
                      value={entryForm.ageClass}
                      onChange={(event) => updateEntryField(setEntryForm, "ageClass", event.target.value)}
                      className={inputClassName()}
                    >
                      {(selectedSpeciesSupport?.ageClasses ?? ageClassOptions).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Division">
                    <select
                      value={entryForm.division}
                      onChange={(event) => updateEntryField(setEntryForm, "division", event.target.value)}
                      className={inputClassName()}
                    >
                      <option value="">Select division</option>
                      {(selectedSpeciesSupport?.apaClasses ?? divisionOptions).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Placement">
                    <input
                      value={entryForm.placement}
                      onChange={(event) => updateEntryField(setEntryForm, "placement", event.target.value)}
                      className={inputClassName()}
                      placeholder="1st, 2nd, Champion Row"
                    />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Field label="Breed">
                    <input
                      value={entryForm.breed}
                      onChange={(event) => updateEntryField(setEntryForm, "breed", event.target.value)}
                      className={inputClassName()}
                      placeholder="Rhode Island Red"
                    />
                  </Field>
                  <Field label="Variety">
                    <input
                      value={entryForm.variety}
                      onChange={(event) => updateEntryField(setEntryForm, "variety", event.target.value)}
                      className={inputClassName()}
                      placeholder="Single Comb"
                    />
                  </Field>
                  <Field label="APA Class">
                    <select
                      value={entryForm.apaClass}
                      onChange={(event) => updateEntryField(setEntryForm, "apaClass", event.target.value)}
                      className={inputClassName()}
                    >
                      <option value="">Select APA class</option>
                      {(selectedSpeciesSupport?.apaClasses ?? divisionOptions).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Variety Classification">
                    <input
                      value={entryForm.varietyClassification}
                      onChange={(event) =>
                        updateEntryField(setEntryForm, "varietyClassification", event.target.value)
                      }
                      className={inputClassName()}
                      placeholder="Clean Legged, Feather Legged, Rose Comb"
                    />
                  </Field>
                  <Field label="Class / APA Class">
                    <input
                      value={entryForm.entryClass}
                      onChange={(event) => updateEntryField(setEntryForm, "entryClass", event.target.value)}
                      className={inputClassName()}
                      placeholder="American class pullet"
                    />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Field label="Special Show Division">
                    <select
                      value={entryForm.specialShowDivision}
                      onChange={(event) =>
                        updateEntryField(setEntryForm, "specialShowDivision", event.target.value)
                      }
                      className={inputClassName()}
                    >
                      <option value="">Select special division</option>
                      {(selectedSpeciesSupport?.specialShowDivisions ?? ["Open", "Custom"]).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Award Template">
                    <select
                      value={entryForm.awardTemplateKey}
                      onChange={(event) =>
                        updateEntryField(setEntryForm, "awardTemplateKey", event.target.value)
                      }
                      className={inputClassName()}
                    >
                      <option value="">Use show template</option>
                      {(selectedSpeciesSupport?.awardTemplates ?? data?.standardsSupport.awardTemplates ?? []).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Breed Club Award">
                    <input
                      value={entryForm.breedClubAward}
                      onChange={(event) =>
                        updateEntryField(setEntryForm, "breedClubAward", event.target.value)
                      }
                      className={inputClassName()}
                      placeholder="Club Best of Breed, Meet Award"
                    />
                  </Field>
                </div>

                <Field label="Show String">
                  <input
                    value={entryForm.showString}
                    onChange={(event) => updateEntryField(setEntryForm, "showString", event.target.value)}
                    className={inputClassName()}
                    placeholder="Large Fowl / Rhode Island Red / Hen / Adult"
                  />
                </Field>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="Judge Name">
                    <input
                      value={entryForm.judgeName}
                      onChange={(event) => updateEntryField(setEntryForm, "judgeName", event.target.value)}
                      className={inputClassName()}
                      placeholder="Judge name"
                    />
                  </Field>
                  <Field label="Judge Number">
                    <input
                      value={entryForm.judgeNumber}
                      onChange={(event) => updateEntryField(setEntryForm, "judgeNumber", event.target.value)}
                      className={inputClassName()}
                      placeholder="Judge card no."
                    />
                  </Field>
                  <Field label="Number in Class">
                    <input
                      type="number"
                      min={0}
                      value={entryForm.numberInClass}
                      onChange={(event) =>
                        updateEntryField(setEntryForm, "numberInClass", Number(event.target.value || 0))
                      }
                      className={inputClassName()}
                    />
                  </Field>
                  <Field label="Number of Exhibitors">
                    <input
                      type="number"
                      min={0}
                      value={entryForm.numberOfExhibitors}
                      onChange={(event) =>
                        updateEntryField(
                          setEntryForm,
                          "numberOfExhibitors",
                          Number(event.target.value || 0),
                        )
                      }
                      className={inputClassName()}
                    />
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Field label="Result">
                    <input
                      value={entryForm.result}
                      onChange={(event) => updateEntryField(setEntryForm, "result", event.target.value)}
                      className={inputClassName()}
                      placeholder="Champion row, BV, RV, class win"
                    />
                  </Field>
                  <Field label="Points Earned">
                    <input
                      type="number"
                      min={0}
                      value={entryForm.pointsEarned}
                      onChange={(event) =>
                        updateEntryField(setEntryForm, "pointsEarned", Number(event.target.value || 0))
                      }
                      className={inputClassName()}
                    />
                  </Field>
                  <label className="flex items-center gap-3 rounded-[22px] border border-[color:var(--line)] bg-[#fcfbff] px-4 py-3 text-sm text-[color:var(--muted)]">
                    <input
                      type="checkbox"
                      checked={entryForm.isWin}
                      onChange={(event) => updateEntryField(setEntryForm, "isWin", event.target.checked)}
                    />
                    Mark as awarded entry
                  </label>
                </div>

                <Field label="Judge Comments">
                  <textarea
                    value={entryForm.judgeComments}
                    onChange={(event) =>
                      updateEntryField(setEntryForm, "judgeComments", event.target.value)
                    }
                    rows={4}
                    className={`${inputClassName()} resize-none`}
                    placeholder="Type judge comments, handling notes, condition notes, or breeder follow-up items"
                  />
                </Field>

                <Field label="Custom Award Text">
                  <input
                    value={entryForm.customAwardText}
                    onChange={(event) =>
                      updateEntryField(setEntryForm, "customAwardText", event.target.value)
                    }
                    className={inputClassName()}
                    placeholder="Champion AOCCL, Best Display, Judge's Choice"
                  />
                </Field>

                <div className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                        Awards
                      </p>
                      <p className="mt-1 text-sm text-[color:var(--muted)]">
                        Record common poultry wins without hardcoding one organization&apos;s entire rulebook.
                      </p>
                    </div>
                    <span className="rounded-full bg-[#f5f3fd] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
                      Flexible
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {poultryAwardOptions.map((award) => (
                      <label
                        key={award.key}
                        className="flex items-center gap-3 rounded-[18px] border border-[color:var(--line)] bg-white px-3 py-3 text-sm text-foreground"
                      >
                        <input
                          type="checkbox"
                          checked={entryForm[award.key]}
                          onChange={(event) =>
                            updateEntryField(setEntryForm, award.key, event.target.checked)
                          }
                        />
                        {award.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4f3fa0] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSaving ? "Saving..." : "Save Entry Result"}
                  </button>
                </div>
              </form>
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <ShowSection title="Upcoming Shows" shows={data?.upcomingShows ?? []} />
            <ShowSection title="Past Shows" shows={data?.pastShows ?? []} />
          </div>

          <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                  Entries & Results
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  Poultry placings, awards, and judge comments
                </h2>
              </div>
              <span className="rounded-full bg-[#edf7f8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--teal)]">
                {data?.entries.length ?? 0} entries
              </span>
            </div>
            <div className="mt-5 space-y-4">
              {(data?.entries ?? []).length > 0 ? (
                data?.entries.map((entry) => (
                  <article
                    key={entry.id}
                    className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2">
                          <Tag tone="accent">{entry.showName}</Tag>
                          <Tag tone="teal">{entry.sizeClass || "Open"}</Tag>
                          {entry.placement ? <Tag tone="danger">{entry.placement}</Tag> : null}
                        </div>
                        <p className="mt-3 text-base font-semibold tracking-tight text-foreground">
                          {entry.birdName} | {entry.bandNumber}
                        </p>
                        <p className="mt-2 text-sm text-[color:var(--muted)]">
                          {[entry.showString, entry.division, entry.specialEntryType]
                            .filter(Boolean)
                            .join(" | ") || "Show string not set"}
                        </p>
                        <p className="mt-2 text-sm text-[color:var(--muted)]">
                          {[
                            entry.breed,
                            entry.variety,
                            entry.apaClass,
                            entry.varietyClassification,
                            entry.sexClass,
                            entry.ageClass,
                          ]
                            .filter(Boolean)
                            .join(" | ")}
                        </p>
                        {entry.breedClubAward ? (
                          <p className="mt-2 text-sm text-[color:var(--accent)]">{entry.breedClubAward}</p>
                        ) : null}
                        {entry.awards.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {entry.awards.map((award) => (
                              <Tag key={`${entry.id}-${award}`} tone="accent">
                                {award}
                              </Tag>
                            ))}
                          </div>
                        ) : null}
                        {entry.judgeComments ? (
                          <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
                            {entry.judgeComments}
                          </p>
                        ) : null}
                      </div>
                      <div className="min-w-[180px] space-y-2 text-sm text-[color:var(--muted)]">
                        <p>{formatDate(entry.showDate)}</p>
                        <p>{entry.judgeName || "Judge not recorded"}</p>
                        <p>{entry.pointsEarned} points</p>
                        <p>
                          {entry.numberInClass} in class | {entry.numberOfExhibitors} exhibitors
                        </p>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <EmptyState copy="No poultry show entries have been recorded yet." />
              )}
            </div>
          </section>
        </>
      ) : null}

      {activeTab === "showString" ? (
        <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Show String
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">
                Grouped by size class, breed, variety, sex class, and age class
              </h2>
            </div>
            <span className="rounded-full bg-[#f5f3fd] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
              Poultry view
            </span>
          </div>
          <div className="mt-5 space-y-4">
            {(data?.showStringGroups ?? []).length > 0 ? (
              data?.showStringGroups.map((group) => (
                <article
                  key={group.id}
                  className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-4"
                >
                  <div className="flex flex-wrap gap-2">
                    <Tag tone="teal">{group.sizeClass}</Tag>
                    <Tag tone="accent">{group.breed}</Tag>
                    <Tag tone="accent">{group.variety}</Tag>
                    <Tag tone="accent">{group.sexClass}</Tag>
                    <Tag tone="accent">{group.ageClass}</Tag>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {group.entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-[18px] border border-[color:var(--line)] bg-white px-4 py-3"
                      >
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {entry.birdName} | {entry.bandNumber}
                            </p>
                            <p className="mt-1 text-sm text-[color:var(--muted)]">
                              {entry.showName} | {formatDate(entry.showDate)} |{" "}
                              {entry.specialEntryType || "Single"}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {entry.placement ? <Tag tone="danger">{entry.placement}</Tag> : null}
                            {entry.awards.slice(0, 2).map((award) => (
                              <Tag key={`${entry.id}-${award}`} tone="teal">
                                {award}
                              </Tag>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))
            ) : (
              <EmptyState copy="The show string will populate after poultry entries are added." />
            )}
          </div>
        </section>
      ) : null}

      {activeTab === "report" ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Show Report
            </p>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <ReportList
                title="Entries by Breed"
                items={(data?.report.entriesByBreed ?? []).map((item) => ({
                  label: item.breed ?? "Breed not set",
                  value: item.count,
                }))}
              />
              <ReportList
                title="Entries by Variety"
                items={(data?.report.entriesByVariety ?? []).map((item) => ({
                  label: item.variety ?? "Variety not set",
                  value: item.count,
                }))}
              />
              <ReportList
                title="Entries by Class"
                items={(data?.report.entriesByClass ?? []).map((item) => ({
                  label: item.entryClass ?? "Class not set",
                  value: item.count,
                }))}
              />
              <ReportList
                title="Wins by Bird"
                items={(data?.report.winsByBird ?? []).map((item) => ({
                  label: item.birdName ?? "Bird",
                  value: item.count,
                }))}
              />
              <ReportList
                title="Wins by Breed"
                items={(data?.report.winsByBreed ?? []).map((item) => ({
                  label: item.breed ?? "Breed not set",
                  value: item.count,
                }))}
              />
              <ReportList
                title="Top Performing Varieties"
                items={(data?.report.topPerformingVarieties ?? []).map((item) => ({
                  label: item.variety,
                  value: `${item.wins} wins | ${item.points} pts`,
                }))}
              />
            </div>
          </section>

          <div className="space-y-6">
            <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Best Birds Over Time
              </p>
              <div className="mt-4 space-y-3">
                {(data?.report.bestBirdsOverTime ?? []).length > 0 ? (
                  data?.report.bestBirdsOverTime.map((entry, index) => (
                    <article
                      key={`${entry.bandNumber}-${entry.showDate}-${index}`}
                      className="rounded-[20px] border border-[color:var(--line)] bg-[#fcfbff] p-4"
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {entry.birdName} | {entry.bandNumber}
                      </p>
                      <p className="mt-1 text-sm text-[color:var(--muted)]">
                        {entry.showName} | {formatDate(entry.showDate)}
                      </p>
                      <p className="mt-2 text-sm text-[color:var(--muted)]">
                        {[entry.placement, ...entry.awards].filter(Boolean).join(" | ") || "Awarded"}
                      </p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">
                        {entry.pointsEarned} points
                      </p>
                    </article>
                  ))
                ) : (
                  <EmptyState copy="Winning birds will appear here as results are recorded." />
                )}
              </div>
            </section>

            <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Recent Judge Comments
              </p>
              <div className="mt-4 space-y-3">
                {(data?.report.recentJudgeComments ?? []).length > 0 ? (
                  data?.report.recentJudgeComments.map((comment) => (
                    <article
                      key={comment.id}
                      className="rounded-[20px] border border-[color:var(--line)] bg-[#fcfbff] p-4"
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {comment.birdName} | {comment.showName}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                        {formatDate(comment.showDate)} | {comment.judgeName || "Judge not recorded"}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">
                        {comment.judgeComments}
                      </p>
                    </article>
                  ))
                ) : (
                  <EmptyState copy="Judge comments will appear here as poultry results are entered." />
                )}
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ShowSection({ title, shows }: { title: string; shows: ShowSummary[] }) {
  return (
    <section className="soft-shadow rounded-[28px] border border-[color:var(--line)] bg-white/88 p-5 sm:p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
        {title}
      </p>
      <div className="mt-5 space-y-4">
        {shows.length > 0 ? (
          shows.map((show) => (
            <article
              key={show.id}
              className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-semibold tracking-tight text-foreground">
                    {show.showName}
                  </p>
                  <p className="mt-2 text-sm text-[color:var(--muted)]">
                    {show.location || "Location not set"} | {formatDate(show.date)}
                  </p>
                  <p className="mt-2 text-sm text-[color:var(--muted)]">
                    {[show.standardsProfile, show.awardTemplateName, show.specialShowDivision]
                      .filter(Boolean)
                      .join(" | ")}
                  </p>
                  {show.notes ? (
                    <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{show.notes}</p>
                  ) : null}
                </div>
                <Tag tone="accent">{show.entryCount} entries</Tag>
              </div>
            </article>
          ))
        ) : (
          <EmptyState copy="No shows in this section yet." />
        )}
      </div>
    </section>
  );
}

function ReportList({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; value: string | number }>;
}) {
  return (
    <article className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
        {title}
      </p>
      <div className="mt-4 space-y-3">
        {items.length > 0 ? (
          items.slice(0, 6).map((item) => (
            <div
              key={`${title}-${item.label}`}
              className="flex items-center justify-between gap-4 rounded-[18px] border border-[color:var(--line)] bg-white px-3 py-3 text-sm"
            >
              <span className="text-foreground">{item.label}</span>
              <span className="font-semibold text-[color:var(--accent)]">{item.value}</span>
            </div>
          ))
        ) : (
          <EmptyState copy="No data yet." />
        )}
      </div>
    </article>
  );
}

function FoundationCard({ title, detail }: { title: string; detail: string }) {
  return (
    <article className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-4">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
        {title}
      </p>
      <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{detail || "-"}</p>
    </article>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-[color:var(--teal)] text-white"
          : "border border-[color:var(--line)] bg-white text-[color:var(--muted)] hover:bg-[#f8f7fe]"
      }`}
    >
      {children}
    </button>
  );
}

function Tag({ children, tone }: { children: ReactNode; tone: "accent" | "teal" | "danger" }) {
  const className =
    tone === "accent"
      ? "bg-[#f5f3fd] text-[color:var(--accent)]"
      : tone === "teal"
        ? "bg-[#edf7f8] text-[color:var(--teal)]"
        : "bg-[#fff1f3] text-[#b34b75]";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${className}`}
    >
      {children}
    </span>
  );
}

function EmptyState({ copy }: { copy: string }) {
  return (
    <div className="rounded-[24px] border border-[color:var(--line)] bg-[#fcfbff] p-5 text-sm text-[color:var(--muted)]">
      {copy}
    </div>
  );
}

function inputClassName() {
  return "w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function defaultSexClassFromBird(sex: string) {
  if (sex === "Male") {
    return "Cock";
  }

  if (sex === "Female") {
    return "Hen";
  }

  return "";
}

function updateEntryField<K extends keyof EntryFormState>(
  setEntryForm: Dispatch<SetStateAction<EntryFormState>>,
  key: K,
  value: EntryFormState[K],
) {
  setEntryForm((current) => ({ ...current, [key]: value }));
}
