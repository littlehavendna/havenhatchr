"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StatCard } from "@/components/stat-card";
import { formatList } from "@/lib/genetics";
import type { Bird, Pairing, Trait } from "@/lib/types";

type GeneticsResponse = {
  birds: Bird[];
  pairings: Pairing[];
  traits: Trait[];
};

export default function GeneticsPage() {
  const router = useRouter();
  const [birds, setBirds] = useState<Bird[]>([]);
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [traits, setTraits] = useState<Trait[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [requestError, setRequestError] = useState("");
  const [traitFilter, setTraitFilter] = useState("All Traits");
  const [projectTagFilter, setProjectTagFilter] = useState("All Project Tags");
  const [breedFilter, setBreedFilter] = useState("All Breeds");
  const [sexFilter, setSexFilter] = useState("All Sexes");
  const [search, setSearch] = useState("");

  useEffect(() => {
    void loadGenetics();
  }, []);

  async function loadGenetics() {
    try {
      setRequestError("");
      const response = await fetch("/api/genetics", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Failed to load genetics overview.");
      }

      const data = (await response.json()) as GeneticsResponse;
      setBirds(data.birds);
      setPairings(data.pairings);
      setTraits(data.traits);
    } catch (error) {
      setRequestError(
        error instanceof Error ? error.message : "Failed to load genetics overview.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  const allTraitOptions = useMemo(
    () => ["All Traits", ...new Set(traits.map((trait) => trait.name))],
    [traits],
  );
  const projectTagOptions = useMemo(
    () => ["All Project Tags", ...new Set(birds.flatMap((bird) => bird.projectTags))],
    [birds],
  );
  const breedOptions = useMemo(
    () => ["All Breeds", ...new Set(birds.map((bird) => bird.breed))],
    [birds],
  );
  const sexOptions = ["All Sexes", "Male", "Female", "Unknown"];

  const filteredBirds = useMemo(() => {
    const query = search.trim().toLowerCase();

    return birds.filter((bird) => {
      const matchesSearch =
        !query ||
        bird.name.toLowerCase().includes(query) ||
        bird.bandNumber.toLowerCase().includes(query) ||
        bird.genotypeNotes.toLowerCase().includes(query) ||
        bird.projectTags.some((tag) => tag.toLowerCase().includes(query));
      const matchesTrait =
        traitFilter === "All Traits" ||
        bird.visualTraits.includes(traitFilter) ||
        bird.carriedTraits.includes(traitFilter);
      const matchesProjectTag =
        projectTagFilter === "All Project Tags" || bird.projectTags.includes(projectTagFilter);
      const matchesBreed = breedFilter === "All Breeds" || bird.breed === breedFilter;
      const matchesSex = sexFilter === "All Sexes" || bird.sex === sexFilter;

      return (
        matchesSearch &&
        matchesTrait &&
        matchesProjectTag &&
        matchesBreed &&
        matchesSex
      );
    });
  }, [birds, breedFilter, projectTagFilter, search, sexFilter, traitFilter]);

  const trackedTraitsCount = new Set(
    birds.flatMap((bird) => [...bird.visualTraits, ...bird.carriedTraits]),
  ).size;
  const birdsWithGeneticsNotes = birds.filter((bird) => bird.genotypeNotes.trim()).length;
  const activeProjectsCount = new Set(birds.flatMap((bird) => bird.projectTags)).size;
  const pairingsWithGoals = pairings.filter((pairing) => pairing.projectGoal.trim()).length;

  return (
    <div className="space-y-6">
      <section className="soft-shadow rounded-[32px] border border-[color:var(--line)] bg-white/90 p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              Breeder Tools
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Genetics Overview</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
              Review visual traits, carried traits, active projects, and genotype notes in one
              breeder-focused workspace.
            </p>
          </div>
          <div className="rounded-[26px] border border-[color:var(--line)] bg-[#fcfbff] px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Matching Birds
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{filteredBirds.length}</p>
          </div>
        </div>
        {requestError ? <p className="mt-4 text-sm text-[#b34b75]">{requestError}</p> : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tracked Traits"
          value={String(trackedTraitsCount)}
          detail="Visual and carried traits currently linked to active birds"
        />
        <StatCard
          label="Birds With Genetics Notes"
          value={String(birdsWithGeneticsNotes)}
          detail="Profiles with genotype observations already documented"
        />
        <StatCard
          label="Active Projects"
          value={String(activeProjectsCount)}
          detail="Distinct project tags shaping this season's breeder decisions"
        />
        <StatCard
          label="Pairings With Goals"
          value={String(pairingsWithGoals)}
          detail="Active breeding combinations with explicit genetic direction"
        />
      </section>

      <section className="soft-shadow rounded-[32px] border border-[color:var(--line)] bg-white/90 p-6">
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-5">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
              Search
            </span>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Bird, band number, notes, or tag"
              className="w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
            />
          </label>

          <FilterSelect
            label="Trait"
            value={traitFilter}
            onChange={setTraitFilter}
            options={allTraitOptions}
          />
          <FilterSelect
            label="Project Tag"
            value={projectTagFilter}
            onChange={setProjectTagFilter}
            options={projectTagOptions}
          />
          <FilterSelect
            label="Breed"
            value={breedFilter}
            onChange={setBreedFilter}
            options={breedOptions}
          />
          <FilterSelect
            label="Sex"
            value={sexFilter}
            onChange={setSexFilter}
            options={sexOptions}
          />
        </div>
      </section>

      <section className="soft-shadow overflow-hidden rounded-[32px] border border-[color:var(--line)] bg-[color:var(--panel-strong)]">
        <div className="border-b border-[color:var(--line)] px-6 py-5">
          <h2 className="text-lg font-semibold tracking-tight">Bird Genetics Table</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">
            Open a bird profile to review related pairings, offspring, and editable genetics notes.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-[#f5f3fd]">
              <tr>
                {[
                  "Bird",
                  "Visual Traits",
                  "Carried Traits",
                  "Project Tags",
                  "Genotype Notes",
                ].map((label) => (
                  <th
                    key={label}
                    className="px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredBirds.map((bird) => (
                <tr
                  key={bird.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => router.push(`/birds/${bird.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(`/birds/${bird.id}`);
                    }
                  }}
                  className="cursor-pointer border-t border-[color:var(--line)] transition hover:bg-[#faf8ff] focus:bg-[#faf8ff] focus:outline-none"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">
                    <Link href={`/birds/${bird.id}`} className="block">
                      <div>
                        <p>{bird.name}</p>
                        <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-[color:var(--muted)]">
                          {bird.bandNumber} · {bird.breed} · {bird.sex}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{formatList(bird.visualTraits)}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{formatList(bird.carriedTraits)}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{formatList(bird.projectTags)}</td>
                  <td className="px-6 py-4 text-sm leading-7 text-[color:var(--muted)]">
                    {bird.genotypeNotes || "No genotype notes recorded yet."}
                  </td>
                </tr>
              ))}
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-[color:var(--muted)]"
                  >
                    Loading genetics data...
                  </td>
                </tr>
              ) : null}
              {!isLoading && filteredBirds.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-[color:var(--muted)]"
                  >
                    No birds match the current genetics filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent-soft)]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
