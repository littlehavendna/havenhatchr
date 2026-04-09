import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { createShow, createShowEntry, getShowsData } from "@/lib/db";
import {
  readBoolean,
  readIsoDateString,
  readJsonObject,
  readNumber,
  readString,
  validateAuthenticatedMutation,
  getClientErrorMessage,
  getErrorStatus,
} from "@/lib/security";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getShowsData(userId);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    validateAuthenticatedMutation(request);
    const body = await readJsonObject(request);
    const action = readString(body, "action", { required: true, maxLength: 20 });

    if (action === "createShow") {
      const show = await createShow(userId, {
        showName: readString(body, "showName", { required: true, maxLength: 160 }),
        location: readString(body, "location", { maxLength: 160 }),
        date: readIsoDateString(body, "date", { required: true }),
        standardsProfile: readString(body, "standardsProfile", {
          maxLength: 120,
          defaultValue: "Open Poultry",
        }),
        awardTemplateName: readString(body, "awardTemplateName", {
          maxLength: 120,
          defaultValue: "Default Poultry Awards",
        }),
        specialShowDivision: readString(body, "specialShowDivision", { maxLength: 120 }),
        notes: readString(body, "notes", { maxLength: 2000 }),
      });

      return NextResponse.json({ show });
    }

    if (action === "createEntry") {
      const entry = await createShowEntry(userId, {
        showId: readString(body, "showId", { required: true, maxLength: 40 }),
        birdId: readString(body, "birdId", { required: true, maxLength: 40 }),
        entryType: readString(body, "entryType", { maxLength: 80, defaultValue: "Poultry" }),
        species: readString(body, "species", { maxLength: 80, defaultValue: "Chicken" }),
        sizeClass: readString(body, "sizeClass", { maxLength: 80 }),
        sexClass: readString(body, "sexClass", { maxLength: 80 }),
        ageClass: readString(body, "ageClass", { maxLength: 80 }),
        breed: readString(body, "breed", { maxLength: 120 }),
        variety: readString(body, "variety", { maxLength: 120 }),
        apaClass: readString(body, "apaClass", { maxLength: 120 }),
        varietyClassification: readString(body, "varietyClassification", { maxLength: 160 }),
        division: readString(body, "division", { maxLength: 120 }),
        specialShowDivision: readString(body, "specialShowDivision", { maxLength: 120 }),
        entryClass: readString(body, "entryClass", { maxLength: 160 }),
        specialEntryType: readString(body, "specialEntryType", { maxLength: 80 }),
        awardTemplateKey: readString(body, "awardTemplateKey", { maxLength: 120 }),
        breedClubAward: readString(body, "breedClubAward", { maxLength: 160 }),
        showString: readString(body, "showString", { maxLength: 240 }),
        result: readString(body, "result", { maxLength: 160 }),
        placement: readString(body, "placement", { maxLength: 120 }),
        pointsEarned: readNumber(body, "pointsEarned", { min: 0, max: 999, defaultValue: 0 }),
        judgeName: readString(body, "judgeName", { maxLength: 160 }),
        judgeNumber: readString(body, "judgeNumber", { maxLength: 80 }),
        judgeComments: readString(body, "judgeComments", { maxLength: 2000 }),
        customAwardText: readString(body, "customAwardText", { maxLength: 200 }),
        numberInClass: readNumber(body, "numberInClass", { min: 0, max: 500, defaultValue: 0 }),
        numberOfExhibitors: readNumber(body, "numberOfExhibitors", {
          min: 0,
          max: 500,
          defaultValue: 0,
        }),
        bestOfBreed: readBoolean(body, "bestOfBreed", false),
        reserveOfBreed: readBoolean(body, "reserveOfBreed", false),
        bestOfVariety: readBoolean(body, "bestOfVariety", false),
        reserveOfVariety: readBoolean(body, "reserveOfVariety", false),
        bestAmerican: readBoolean(body, "bestAmerican", false),
        bestAsiatic: readBoolean(body, "bestAsiatic", false),
        bestMediterranean: readBoolean(body, "bestMediterranean", false),
        bestContinental: readBoolean(body, "bestContinental", false),
        bestEnglish: readBoolean(body, "bestEnglish", false),
        bestGame: readBoolean(body, "bestGame", false),
        bestAllOtherStandardBreeds: readBoolean(body, "bestAllOtherStandardBreeds", false),
        bestBantam: readBoolean(body, "bestBantam", false),
        bestInShow: readBoolean(body, "bestInShow", false),
        reserveInShow: readBoolean(body, "reserveInShow", false),
        isWin: readBoolean(body, "isWin", false),
      });

      return NextResponse.json({ entry });
    }

    return NextResponse.json({ error: "Invalid show action." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to save show data.") },
      { status: getErrorStatus(error) },
    );
  }
}
