import { NextResponse } from "next/server";
import { trackFirstRunMilestone } from "@/lib/admin";
import { createChick } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import { validateAuthenticatedMutation } from "@/lib/security";
import { getCurrentUserId } from "@/lib/auth";

const MAX_IMPORT_ROWS = 500;
const MAX_FILE_SIZE_BYTES = 1024 * 1024;
const chickStatuses = ["Available", "Reserved", "Sold", "Holdback", "Deceased"] as const;
const birdSexes = ["Male", "Female", "Unknown"] as const;

type ChickStatus = (typeof chickStatuses)[number];
type BirdSex = (typeof birdSexes)[number];
type CsvRow = Record<string, string>;

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    validateAuthenticatedMutation(request);

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "CSV file is required." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "CSV file must be 1 MB or smaller." }, { status: 400 });
    }

    const rows = parseCsv(await file.text());

    if (rows.length === 0) {
      return NextResponse.json({ error: "CSV file does not contain any chick rows." }, { status: 400 });
    }

    if (rows.length > MAX_IMPORT_ROWS) {
      return NextResponse.json(
        { error: `CSV file can include ${MAX_IMPORT_ROWS} chicks or fewer.` },
        { status: 400 },
      );
    }

    const [flocks, hatchGroups] = await Promise.all([
      prisma.flock.findMany({ where: { userId }, select: { id: true, name: true } }),
      prisma.hatchGroup.findMany({ where: { userId }, select: { id: true, name: true } }),
    ]);

    const flockIds = new Set(flocks.map((flock) => flock.id));
    const flockNameMap = new Map(flocks.map((flock) => [normalizeLookup(flock.name), flock.id]));
    const hatchGroupIds = new Set(hatchGroups.map((group) => group.id));
    const hatchGroupNameMap = new Map(
      hatchGroups.map((group) => [normalizeLookup(group.name), group.id]),
    );
    const errors: Array<{ row: number; message: string }> = [];
    let importedCount = 0;

    for (const [index, row] of rows.entries()) {
      const rowNumber = index + 2;

      try {
        const bandNumber = getCell(row, ["bandNumber", "band_number", "band", "id"]);
        const hatchDate = getCell(row, ["hatchDate", "hatch_date", "date"]);
        const flockValue = getCell(row, ["flockId", "flock_id", "flock"]);
        const hatchGroupValue = getCell(row, [
          "hatchGroupId",
          "hatch_group_id",
          "hatchGroup",
          "hatch_group",
        ]);
        const status = normalizeStatus(getCell(row, ["status"]) || "Available");
        const sex = normalizeSex(getCell(row, ["sex"]) || "Unknown");

        if (!bandNumber) throw new Error("Band number is required.");
        if (!hatchDate || !/^\d{4}-\d{2}-\d{2}$/.test(hatchDate)) {
          throw new Error("Hatch date is required in YYYY-MM-DD format.");
        }

        const flockId = resolveReference(flockValue, flockIds, flockNameMap);
        if (!flockId) {
          throw new Error("Flock is required and must match an existing flock ID or name.");
        }

        const hatchGroupId = hatchGroupValue
          ? resolveReference(hatchGroupValue, hatchGroupIds, hatchGroupNameMap)
          : undefined;
        if (hatchGroupValue && !hatchGroupId) {
          throw new Error("Hatch group must match an existing hatch group ID or name.");
        }

        await createChick(userId, {
          bandNumber,
          hatchDate,
          flockId,
          hatchGroupId,
          status,
          sex,
          color: getCell(row, ["color"]),
          observedTraits: splitTraits(getCell(row, ["observedTraits", "observed_traits", "traits"])),
          notes: getCell(row, ["notes"]),
        });
        importedCount += 1;
      } catch (error) {
        errors.push({
          row: rowNumber,
          message: error instanceof Error ? error.message : "Unable to import this chick.",
        });
      }
    }

    if (importedCount > 0) {
      await trackFirstRunMilestone(userId, "first_chick_created");
    }

    return NextResponse.json({
      importedCount,
      failedCount: errors.length,
      errors: errors.slice(0, 25),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to import chicks." },
      { status: 400 },
    );
  }
}

function parseCsv(input: string) {
  const records: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const nextChar = input[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field.trim());
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") index += 1;
      row.push(field.trim());
      if (row.some(Boolean)) records.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  row.push(field.trim());
  if (row.some(Boolean)) records.push(row);

  const [headers, ...dataRows] = records;
  if (!headers || headers.length === 0) return [];

  const normalizedHeaders = headers.map(normalizeHeader);
  return dataRows.map((record) =>
    Object.fromEntries(
      normalizedHeaders.map((header, index) => [header, record[index]?.trim() ?? ""]),
    ),
  );
}

function getCell(row: CsvRow, names: string[]) {
  for (const name of names) {
    const value = row[normalizeHeader(name)];
    if (value) return value.trim();
  }

  return "";
}

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeLookup(value: string) {
  return value.trim().toLowerCase();
}

function resolveReference(value: string, ids: Set<string>, names: Map<string, string>) {
  const normalized = value.trim();
  if (ids.has(normalized)) return normalized;
  return names.get(normalizeLookup(normalized)) ?? "";
}

function normalizeStatus(value: string): ChickStatus {
  const status = chickStatuses.find((option) => option.toLowerCase() === value.toLowerCase());
  if (!status) {
    throw new Error(`Status must be one of: ${chickStatuses.join(", ")}.`);
  }
  return status;
}

function normalizeSex(value: string): BirdSex {
  const sex = birdSexes.find((option) => option.toLowerCase() === value.toLowerCase());
  if (!sex) {
    throw new Error(`Sex must be one of: ${birdSexes.join(", ")}.`);
  }
  return sex;
}

function splitTraits(value: string) {
  return value
    .split(/[|;]/)
    .flatMap((part) => part.split(","))
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}
