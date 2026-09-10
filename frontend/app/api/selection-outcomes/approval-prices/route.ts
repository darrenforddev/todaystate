import {
  NextRequest,
  NextResponse,
} from "next/server";

import { realCompanyUniverse } from "@/data/realCompanyUniverse";

import {
  fetchHistoricalClose,
} from "@/engine/outcomes/historicalClose";

import {
  twelveDataLseTrialCompany,
} from "@/engine/todayScore/providers/twelveData";

import type {
  ProviderCompanyIdentity,
} from "@/engine/todayScore/providers/types";

const BENCHMARKS: Record<
  string,
  ProviderCompanyIdentity
> = {
  sp500: {
    companyId: "sp500",
    companyName:
      "SPDR S&P 500 ETF Trust",
    ticker: "SPY",
    exchangeMic: "ARCX",
  },

  ftse100: {
    companyId: "ftse100",
    companyName:
      "iShares Core FTSE 100 UCITS ETF",
    ticker: "ISF",
    exchangeMic: "XLON",
  },

  nasdaq100: {
    companyId: "nasdaq100",
    companyName: "Invesco QQQ Trust",
    ticker: "QQQ",
    exchangeMic: "XNAS",
  },
};

function isValidDate(
  value: string,
): boolean {
  const pattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!pattern.test(value)) {
    return false;
  }

  const timestamp = Date.parse(
    `${value}T00:00:00Z`,
  );

  return (
    Number.isFinite(timestamp) &&
    new Date(timestamp)
      .toISOString()
      .slice(0, 10) === value
  );
}

export async function GET(
  request: NextRequest,
) {
  const companyId =
    request.nextUrl.searchParams
      .get("companyId")
      ?.trim() ?? "";

  const benchmarkId =
    request.nextUrl.searchParams
      .get("benchmarkId")
      ?.trim() ?? "";

  const selectedAt =
    request.nextUrl.searchParams
      .get("selectedAt")
      ?.trim() ?? "";

  if (
    !companyId ||
    !benchmarkId ||
    !isValidDate(selectedAt)
  ) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Company, benchmark and a valid selection date are required.",
      },
      {
        status: 400,
      },
    );
  }

  const registeredCompany =
    realCompanyUniverse.find(
      (company) =>
        company.companyId === companyId,
    );

  const company:
    ProviderCompanyIdentity | undefined =
      registeredCompany
        ? {
            companyId:
              registeredCompany.companyId,
            companyName:
              registeredCompany.companyName,
            ticker:
              registeredCompany.ticker,
            exchangeMic:
              registeredCompany.exchangeMic,
          }
        : companyId ===
            twelveDataLseTrialCompany.companyId
          ? twelveDataLseTrialCompany
          : undefined;

  if (!company) {
    return NextResponse.json(
      {
        success: false,
        error:
          "The company is not registered for automatic prices.",
      },
      {
        status: 404,
      },
    );
  }

  const benchmark =
    BENCHMARKS[benchmarkId];

  if (!benchmark) {
    return NextResponse.json(
      {
        success: false,
        error:
          "The benchmark is not registered for automatic prices.",
      },
      {
        status: 404,
      },
    );
  }

  try {
    const companyPrice =
      await fetchHistoricalClose(
        company,
        selectedAt,
       "at-or-before",
      );

    const benchmarkPrice =
      await fetchHistoricalClose(
        benchmark,
        selectedAt,
        "at-or-before",
      );

    return NextResponse.json({
      success: true,
      selectedAt,
      companyPrice,
      benchmarkPrice,
    });
  } catch (error) {
    console.error(
      "Unable to retrieve approval prices:",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Approval prices could not be retrieved.";

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