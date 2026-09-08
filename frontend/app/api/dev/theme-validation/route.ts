import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getAvailableEvidencePeriods,
} from "@/data/evidenceSnapshots";

import {
  fetchAllThemeMarketHistories,
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
     * A single-period diagnostic retains the original
     * XLI-only behaviour and requires only two requests.
     */
    if (!isAllPeriods) {
      const marketHistory =
        await fetchThemeMarketHistory();

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

          marketData: {
            provider:
              "Twelve Data",

            adjustedPrices:
              true,

            instrumentCount:
              1,

            fetchedAt:
              marketHistory
                .fetchedAt,
          },
        },
        {
          headers: {
            "Cache-Control":
              "no-store",
          },
        },
      );
    }

    /**
     * The all-period diagnostic loads SPY once and
     * each configured validation instrument once.
     */
    const marketHistories =
      await fetchAllThemeMarketHistories();

    if (
      marketHistories.length === 0
    ) {
      throw new Error(
        "No theme validation instruments were available.",
      );
    }

    /**
     * Group previews by reporting period so each
     * month's ETFs and companies stay together.
     */
    const previews =
      availablePeriods.flatMap(
        (reportPeriod) =>
          marketHistories.map(
            (marketHistory) =>
              buildThemeValidationPreview(
                reportPeriod,
                marketHistory,
              ),
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
          summary.periodCount,

        instrumentCount:
          summary.instrumentCount,

        periods:
          availablePeriods,

        instruments:
          marketHistories.map(
            (history) => ({
              instrumentId:
                history.instrument
                  .companyId,

              ticker:
                history.instrument
                  .ticker,

              name:
                history.instrument
                  .companyName,

              instrumentType:
                history.instrument
                  .instrumentType,

              validationRole:
                history.instrument
                  .validationRole,
            }),
          ),

        summary,
        previews,

        marketData: {
          provider:
            "Twelve Data",

          adjustedPrices:
            true,

          instrumentCount:
            marketHistories.length,

          requestCount:
            marketHistories.length +
            1,

          fetchedAt:
            marketHistories[0]
              .fetchedAt,
        },
      },
      {
        headers: {
          "Cache-Control":
            "no-store",
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