import "server-only";

import {
  createTwelveDataProvider,
} from "../todayScore/providers/twelveData";

import {
  parsePricePoints,
  type PricePoint,
} from "../todayScore/providers/priceHistory";

import type {
  ProviderCompanyIdentity,
  ProviderDatasetResult,
} from "../todayScore/providers/types";

const VALIDATION_PRICE_HISTORY_SIZE =
  400;

export const industrialRecoveryInstrument:
  ProviderCompanyIdentity = {
    companyId: "xli",
    companyName:
      "Industrial Select Sector SPDR Fund",
    ticker: "XLI",
    exchangeMic: "ARCX",
  };

export const broadMarketBenchmark:
  ProviderCompanyIdentity = {
    companyId: "spy",
    companyName:
      "SPDR S&P 500 ETF Trust",
    ticker: "SPY",
    exchangeMic: "ARCX",
  };

export interface ThemeMarketHistory {
  instrument:
    ProviderCompanyIdentity;

  benchmark:
    ProviderCompanyIdentity;

  instrumentResult:
    ProviderDatasetResult;

  benchmarkResult:
    ProviderDatasetResult;

  instrumentPrices:
    PricePoint[];

  benchmarkPrices:
    PricePoint[];

  fetchedAt: string;
}

export async function fetchThemeMarketHistory():
  Promise<ThemeMarketHistory> {
  const provider =
    createTwelveDataProvider();

  if (!provider) {
    throw new Error(
      "TWELVE_DATA_API_KEY is not configured.",
    );
  }

  /**
   * Deliberately sequential to avoid unnecessary
   * request bursts against provider rate limits.
   */
  const instrumentResult =
    await provider.fetchDataset(
      industrialRecoveryInstrument,
      "price-history",
      {
        priceHistoryOutputSize:
          VALIDATION_PRICE_HISTORY_SIZE,
      },
    );

  const benchmarkResult =
    await provider.fetchDataset(
      broadMarketBenchmark,
      "price-history",
      {
        priceHistoryOutputSize:
          VALIDATION_PRICE_HISTORY_SIZE,
      },
    );

  if (
    instrumentResult.status !==
    "available"
  ) {
    throw new Error(
      `XLI price history is unavailable: ${instrumentResult.message}`,
    );
  }

  if (
    benchmarkResult.status !==
    "available"
  ) {
    throw new Error(
      `SPY price history is unavailable: ${benchmarkResult.message}`,
    );
  }

  const instrumentPrices =
    parsePricePoints(
      instrumentResult,
    );

  const benchmarkPrices =
    parsePricePoints(
      benchmarkResult,
    );

  if (
    instrumentPrices.length === 0
  ) {
    throw new Error(
      "XLI returned no usable daily closing prices.",
    );
  }

  if (
    benchmarkPrices.length === 0
  ) {
    throw new Error(
      "SPY returned no usable daily closing prices.",
    );
  }

  return {
    instrument:
      industrialRecoveryInstrument,

    benchmark:
      broadMarketBenchmark,

    instrumentResult,
    benchmarkResult,

    instrumentPrices,
    benchmarkPrices,

    fetchedAt:
      new Date().toISOString(),
  };
}