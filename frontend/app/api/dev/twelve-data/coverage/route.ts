import {
  NextRequest,
  NextResponse,
} from "next/server";

import { realCompanyUniverse } from "@/data/realCompanyUniverse";

import { isTodayScoreDataset } from "@/engine/todayScore/providers/requirements";

import {
  createTwelveDataProvider,
  twelveDataLseTrialCompany,
} from "@/engine/todayScore/providers/twelveData";

import type {
  ProviderCompanyIdentity,
} from "@/engine/todayScore/providers/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const validationInstruments: Record<
  string,
  ProviderCompanyIdentity
> = {
  xli: {
    companyId: "xli",
    companyName:
      "Industrial Select Sector SPDR Fund",
    ticker: "XLI",
    exchangeMic: "ARCX",
  },

  spy: {
    companyId: "spy",
    companyName:
      "SPDR S&P 500 ETF Trust",
    ticker: "SPY",
    exchangeMic: "ARCX",
  },
};

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
    target?: unknown;
    dataset?: unknown;
  };

  try {
    body =
      (await request.json()) as {
        target?: unknown;
        dataset?: unknown;
      };
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          "A valid diagnostic request is required.",
      },
      { status: 400 },
    );
  }

  const target =
    typeof body.target === "string"
      ? body.target
      : null;

  const dataset =
    typeof body.dataset === "string"
      ? body.dataset
      : null;

  if (
    !isTodayScoreDataset(dataset)
  ) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Choose a valid TodayScore dataset.",
      },
      { status: 400 },
    );
  }

  const company =
    target === "trial"
      ? twelveDataLseTrialCompany
      : target &&
          validationInstruments[target]
        ? validationInstruments[target]
        : realCompanyUniverse.find(
            (candidate) =>
              candidate.companyId ===
              target,
          );

  if (!company) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Choose the Twelve Data trial symbol, XLI, SPY or a pilot company.",
      },
      { status: 400 },
    );
  }

  const provider =
    createTwelveDataProvider();

  if (!provider) {
    return NextResponse.json(
      {
        success: false,
        message:
          "TWELVE_DATA_API_KEY is not configured on the server.",
      },
      { status: 503 },
    );
  }

  try {
    const result =
      await provider.probeCoverage(
        company,
        dataset,
      );

    return NextResponse.json(
      {
        success: true,
        result,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error(
      "Unable to run Twelve Data coverage diagnostic:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to complete the Twelve Data diagnostic.",
      },
      { status: 500 },
    );
  }
}