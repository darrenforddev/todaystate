import "server-only";

import {
  createTwelveDataProvider,
  type TwelveDataProvider,
} from "../todayScore/providers/twelveData";

import {
  parsePricePoints,
  type PricePoint,
} from "../todayScore/providers/priceHistory";

import type {
  ProviderCompanyIdentity,
  ProviderDatasetResult,
} from "../todayScore/providers/types";

import {
  industrialRecoveryValidationInstruments,
  type ThemeValidationInstrument,
} from "./themeValidationUniverse";

const VALIDATION_PRICE_HISTORY_SIZE =
  400;

export const broadMarketBenchmark:
  ProviderCompanyIdentity = {
    companyId: "spy",
    companyName:
      "SPDR S&P 500 ETF Trust",
    ticker: "SPY",
    exchangeMic: "ARCX",
  };

function getPrimaryValidationInstrument():
  ThemeValidationInstrument {
  const instrument =
    industrialRecoveryValidationInstruments.find(
      (candidate) =>
        candidate.companyId ===
        "xli",
    );

  if (!instrument) {
    throw new Error(
      "The primary XLI validation instrument is not configured.",
    );
  }

  return instrument;
}

export const industrialRecoveryInstrument:
  ThemeValidationInstrument =
    getPrimaryValidationInstrument();

export interface ThemeMarketHistory {
  instrument:
    ThemeValidationInstrument;

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

async function fetchPriceHistory(
  provider: TwelveDataProvider,
  identity: ProviderCompanyIdentity,
): Promise<{
  result: ProviderDatasetResult;
  prices: PricePoint[];
}> {
  const result =
    await provider.fetchDataset(
      identity,
      "price-history",
      {
        priceHistoryOutputSize:
          VALIDATION_PRICE_HISTORY_SIZE,
      },
    );

  if (
    result.status !==
    "available"
  ) {
    throw new Error(
      `${identity.ticker} price history is unavailable: ${result.message}`,
    );
  }

  const prices =
    parsePricePoints(
      result,
    );

  if (prices.length === 0) {
    throw new Error(
      `${identity.ticker} returned no usable daily closing prices.`,
    );
  }

  return {
    result,
    prices,
  };
}

async function fetchMarketHistories(
  instruments:
    readonly ThemeValidationInstrument[],
): Promise<ThemeMarketHistory[]> {
  const provider =
    createTwelveDataProvider();

  if (!provider) {
    throw new Error(
      "TWELVE_DATA_API_KEY is not configured.",
    );
  }

  /**
   * Fetch SPY once because every validation
   * instrument uses the same broad benchmark.
   */
  const benchmarkHistory =
    await fetchPriceHistory(
      provider,
      broadMarketBenchmark,
    );

  const fetchedAt =
    new Date().toISOString();

  const histories:
    ThemeMarketHistory[] = [];

  /**
   * Deliberately sequential to avoid request bursts
   * against the provider's rate limits.
   */
  for (
    const instrument of instruments
  ) {
    const instrumentHistory =
      await fetchPriceHistory(
        provider,
        instrument,
      );

    histories.push({
      instrument,
      benchmark:
        broadMarketBenchmark,

      instrumentResult:
        instrumentHistory.result,

      benchmarkResult:
        benchmarkHistory.result,

      instrumentPrices:
        instrumentHistory.prices,

      benchmarkPrices:
        benchmarkHistory.prices,

      fetchedAt,
    });
  }

  return histories;
}

/**
 * Existing single-instrument function retained
 * for compatibility with the current XLI endpoint.
 */
export async function fetchThemeMarketHistory():
  Promise<ThemeMarketHistory> {
  const histories =
    await fetchMarketHistories([
      industrialRecoveryInstrument,
    ]);

  const history =
    histories[0];

  if (!history) {
    throw new Error(
      "XLI market history could not be loaded.",
    );
  }

  return history;
}

/**
 * Fetches every configured Industrial Recovery
 * validation instrument and reuses one SPY history.
 *
 * Current provider-request total:
 * one SPY request plus four instrument requests.
 */
export async function fetchAllThemeMarketHistories():
  Promise<ThemeMarketHistory[]> {
  return fetchMarketHistories(
    industrialRecoveryValidationInstruments,
  );
}