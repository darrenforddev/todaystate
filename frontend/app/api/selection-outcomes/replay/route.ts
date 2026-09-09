import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  fetchOutcomeReplayMarketData,
} from "@/engine/outcomes/outcomeReplayMarketData";

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

    if (outcome.status === "pending") {
      return NextResponse.json(
        {
          success: false,
          error:
            "The outcome must be reviewed before " +
            "its complete price replay is available.",
        },
        {
          status: 409,
        },
      );
    }

    const replay =
      await fetchOutcomeReplayMarketData(
        record.selection,
        outcome,
      );

    return NextResponse.json({
      success: true,
      replay,
    });
  } catch (error) {
    console.error(
      "Unable to load outcome replay:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "The outcome replay could not be loaded.";

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