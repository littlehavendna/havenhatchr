import { NextResponse } from "next/server";
import { applyDnaResultsUpdate } from "@/lib/dna-sync";
import { getDnaResultsWebhookSecret } from "@/lib/dna-server";
import {
  getClientErrorMessage,
  getErrorStatus,
  logServerError,
  readJsonObject,
  readNumber,
  readString,
} from "@/lib/security";

export async function POST(request: Request) {
  try {
    const secret = request.headers.get("x-dna-results-secret")?.trim();

    if (!secret || secret !== getDnaResultsWebhookSecret()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await readJsonObject(request);
    const rawResults = body.results;

    if (!Array.isArray(rawResults) || rawResults.length === 0) {
      return NextResponse.json({ error: "results is required." }, { status: 400 });
    }

    const result = await applyDnaResultsUpdate({
      externalOrderId: readString(body, "externalOrderId", { maxLength: 120 }),
      externalOrderCode: readString(body, "externalOrderCode", { maxLength: 120 }),
      completedAt: readString(body, "completedAt", { maxLength: 80 }),
      results: rawResults.map((entry, index) => {
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
          throw new Error(`results[${index}] is invalid.`);
        }

        const record = entry as Record<string, unknown>;

        return {
          sampleNumber: readNumber(record, "sampleNumber", { required: true, min: 1, max: 1000 }),
          status: readString(record, "status", { maxLength: 20 }) as "Pending" | "Completed" | "Cancelled",
          externalSampleId: readString(record, "externalSampleId", { maxLength: 120 }),
          resultSummary: readString(record, "resultSummary", { maxLength: 1000 }),
          resultPayload:
            record.resultPayload && typeof record.resultPayload === "object" && !Array.isArray(record.resultPayload)
              ? (record.resultPayload as Record<string, unknown>)
              : undefined,
        };
      }),
    });

    return NextResponse.json({ result });
  } catch (error) {
    const status = getErrorStatus(error);

    if (status >= 500) {
      logServerError("dna.results", error);
    }

    return NextResponse.json(
      { error: getClientErrorMessage(error, "Unable to apply DNA results.") },
      { status },
    );
  }
}
