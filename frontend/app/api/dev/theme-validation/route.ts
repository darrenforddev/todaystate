import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getAvailableEvidencePeriods,
} from "@/data/evidenceSnapshots";

import {
  fetchThemeMarketHistory,
} from "@/engine/outcomes/themeMarketData";

import {
  buildThemeValidationPreview,
} from "@/engine/outcomes/themeValidation";

import {
  buildThemeValidationSummary,
} from "@/engine/outcomes/themeValidationSummary";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
) {
  if (
    process.env.NODE_ENV ===
    "production"
  ) {
    return new NextResponse(
      null,
      { status: 404 },
    );
  }

  let body: {
    reportPeriod?: unknown;
  };

  try {
    body =
      (await request.json()) as {
        reportPeriod?: unknown;
      };
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "A valid validation request is required.",
      },
      { status: 400 },
    );
  }

  const requestedPeriod =
    typeof body.reportPeriod ===
    "string"
      ? body.reportPeriod
      : null;

  if (!requestedPeriod) {
    return NextResponse.json(
      {
        success: false,
        message:
          "A report period or all is required.",
      },
      { status: 400 },
    );
  }

  const availablePeriods =
    getAvailableEvidencePeriods();

  const isAllPeriods =
    requestedPeriod === "all";

  if (
    !isAllPeriods &&
    !availablePeriods.includes(
      requestedPeriod,
    )
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          `Evidence period not found: ${requestedPeriod}`,
      },
      { status: 404 },
    );
  }

  try {
    /**
     * XLI and SPY are fetched only once.
     * The same point-in-time market history is then
     * reused across every requested evidence period.
     */
    const marketHistory =
      await fetchThemeMarketHistory();

    const marketData = {
      provider: "Twelve Data",
      adjustedPrices: true,
      fetchedAt:
        marketHistory.fetchedAt,
    };

    if (!isAllPeriods) {
      const preview =
        buildThemeValidationPreview(
          requestedPeriod,
          marketHistory,
        );

      return NextResponse.json(
        {
          success: true,
          mode: "single",
          preview,
          marketData,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

       const previews =
      availablePeriods.map(
        (reportPeriod) =>
          buildThemeValidationPreview(
            reportPeriod,
            marketHistory,
          ),
      );

    const summary =
      buildThemeValidationSummary(
        previews,
      );

    return NextResponse.json(
      {
        success: true,
        mode: "all",
          periodCount:
          previews.length,

        periods:
          availablePeriods,

        summary,
        previews,
        marketData,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "Unable to build theme validation:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Unable to build theme validation.",
      },
      { status: 500 },
    );
  }
}