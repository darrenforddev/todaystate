import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  fetchHistoricalClose,
} from "@/engine/outcomes/historicalClose";

import {
  getSelectionOutcomeRecord,
} from "@/engine/outcomes/selectionOutcomeRepository";

import type {
  OutcomeHorizon,
} from "@/engine/outcomes/types";

function isValidHorizon(
  value: string | null,
): value is OutcomeHorizon {
  return (
    value === "one-month" ||
    value === "three-month" ||
    value === "six-month" ||
    value === "twelve-month"
  );
}

function requireText(
  value: string | undefined,
  fieldName: string,
): string {
  const result = value?.trim();

  if (!result) {
    throw new Error(
      `${fieldName} is unavailable for this selection.`,
    );
  }

  return result;
}

export async function GET(
  request: NextRequest,
) {
  const selectionId =
    request.nextUrl.searchParams
      .get("selectionId")
      ?.trim() ?? "";

  const horizon =
    request.nextUrl.searchParams
      .get("horizon");

  if (!selectionId) {
    return NextResponse.json(
      {
        success: false,
        error: "Selection ID is required.",
      },
      {
        status: 400,
      },
    );
  }

  if (!isValidHorizon(horizon)) {
    return NextResponse.json(
      {
        success: false,
        error:
          "A valid outcome horizon is required.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const record =
      await getSelectionOutcomeRecord(
        selectionId,
      );

    if (!record) {
      return NextResponse.json(
        {
          success: false,
          error:
            `Selection "${selectionId}" was not found.`,
        },
        {
          status: 404,
        },
      );
    }

    const outcome =
      record.outcomes.find(
        (candidate) =>
          candidate.horizon === horizon,
      );

    if (!outcome) {
      return NextResponse.json(
        {
          success: false,
          error:
            `No ${horizon} outcome exists for ` +
            `selection "${selectionId}".`,
        },
        {
          status: 404,
        },
      );
    }

    if (outcome.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Prices are only retrieved for pending outcomes.",
        },
        {
          status: 409,
        },
      );
    }

    const selection = record.selection;

    const companyExchangeMic =
      requireText(
        selection.exchangeMic,
        "Company exchange MIC",
      );

    const benchmarkTicker =
      requireText(
        selection.benchmarkTicker,
        "Benchmark ticker",
      );

    const benchmarkExchangeMic =
      requireText(
        selection.benchmarkExchangeMic,
        "Benchmark exchange MIC",
      );

    const companyPrice =
      await fetchHistoricalClose(
        {
          companyId: selection.companyId,
          companyName:
            selection.companyName,
          ticker: selection.ticker,
          exchangeMic:
            companyExchangeMic,
        },
        outcome.measurementDate,
        "at-or-before",
      );

    const benchmarkPrice =
      await fetchHistoricalClose(
        {
          companyId:
            selection.benchmarkId,
          companyName:
            selection.benchmarkName,
          ticker: benchmarkTicker,
          exchangeMic:
            benchmarkExchangeMic,
        },
        outcome.measurementDate,
        "at-or-before",
      );

    return NextResponse.json({
      success: true,
      measurementDate:
        outcome.measurementDate,
      companyPrice,
      benchmarkPrice,
    });
  } catch (error) {
    console.error(
      "Unable to retrieve outcome review prices:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Review prices could not be retrieved.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 502,
      },
    );
  }
}