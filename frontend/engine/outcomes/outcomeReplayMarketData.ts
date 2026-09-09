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
  buildOutcomeReplaySeries,
  type OutcomeReplayPoint,
} from "./outcomeReplay";

import type {
  HorizonOutcome,
  SelectionSnapshot,
} from "./types";

export interface OutcomeReplayInstrument {
  id: string;
  name: string;
  ticker: string;
  exchangeMic: string;
  quoteCurrency: string;
  entryPrice: number;
}

export interface OutcomeReplayMarketData {
  selectionId: string;
  horizon: HorizonOutcome["horizon"];
  startDate: string;
  endDate: string;

  company: OutcomeReplayInstrument;
  benchmark: OutcomeReplayInstrument;

  companySeries: OutcomeReplayPoint[];
  benchmarkSeries: OutcomeReplayPoint[];

  providerName: string;
  fetchedAt: string;
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

function calculateOutputSize(
  startDate: string,
  endDate: string,
): number {
  const startTimestamp = Date.parse(
    `${startDate}T00:00:00Z`,
  );

  const endTimestamp = Date.parse(
    `${endDate}T00:00:00Z`,
  );

  const calendarDays = Math.max(
    1,
    Math.ceil(
      (endTimestamp - startTimestamp) /
        (24 * 60 * 60 * 1000),
    ),
  );

  const estimatedTradingDays =
    Math.ceil((calendarDays * 5) / 7);

  return Math.min(
    5_000,
    Math.max(
      40,
      estimatedTradingDays + 30,
    ),
  );
}

async function fetchPriceHistory(
  provider: TwelveDataProvider,
  identity: ProviderCompanyIdentity,
  outputSize: number,
): Promise<{
  result: ProviderDatasetResult;
  prices: PricePoint[];
}> {
  const result = await provider.fetchDataset(
    identity,
    "price-history",
    {
      priceHistoryOutputSize: outputSize,
    },
  );

  if (result.status !== "available") {
    throw new Error(
      `${identity.ticker} price history is unavailable: ${result.message}`,
    );
  }

  const prices = parsePricePoints(result);

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

export async function fetchOutcomeReplayMarketData(
  selection: SelectionSnapshot,
  outcome: HorizonOutcome,
): Promise<OutcomeReplayMarketData> {
  const provider = createTwelveDataProvider();

  if (!provider) {
    throw new Error(
      "TWELVE_DATA_API_KEY is not configured.",
    );
  }

  const companyExchangeMic = requireText(
    selection.exchangeMic,
    "Company exchange MIC",
  );

  const companyQuoteCurrency = requireText(
    selection.quoteCurrency,
    "Company quote currency",
  );

  const benchmarkTicker = requireText(
    selection.benchmarkTicker,
    "Benchmark ticker",
  );

  const benchmarkExchangeMic = requireText(
    selection.benchmarkExchangeMic,
    "Benchmark exchange MIC",
  );

  const benchmarkQuoteCurrency = requireText(
    selection.benchmarkQuoteCurrency,
    "Benchmark quote currency",
  );

  const company: OutcomeReplayInstrument = {
    id: selection.companyId,
    name: selection.companyName,
    ticker: selection.ticker,
    exchangeMic: companyExchangeMic,
    quoteCurrency: companyQuoteCurrency,
    entryPrice: selection.entryPrice,
  };

  const benchmark: OutcomeReplayInstrument = {
    id: selection.benchmarkId,
    name: selection.benchmarkName,
    ticker: benchmarkTicker,
    exchangeMic: benchmarkExchangeMic,
    quoteCurrency: benchmarkQuoteCurrency,
    entryPrice: selection.benchmarkEntryPrice,
  };

  const outputSize = calculateOutputSize(
    selection.selectedAt,
    outcome.measurementDate,
  );

  /*
   * Keep these requests sequential to avoid a burst
   * against the provider's request limits.
   */
  const companyHistory = await fetchPriceHistory(
    provider,
    {
      companyId: company.id,
      companyName: company.name,
      ticker: company.ticker,
      exchangeMic: company.exchangeMic,
    },
    outputSize,
  );

  const benchmarkHistory = await fetchPriceHistory(
    provider,
    {
      companyId: benchmark.id,
      companyName: benchmark.name,
      ticker: benchmark.ticker,
      exchangeMic: benchmark.exchangeMic,
    },
    outputSize,
  );

  const companySeries = buildOutcomeReplaySeries({
    prices: companyHistory.prices,
    entryPrice: company.entryPrice,
    startDate: selection.selectedAt,
    endDate: outcome.measurementDate,
  });

  const benchmarkSeries = buildOutcomeReplaySeries({
    prices: benchmarkHistory.prices,
    entryPrice: benchmark.entryPrice,
    startDate: selection.selectedAt,
    endDate: outcome.measurementDate,
  });

  if (companySeries.length === 0) {
    throw new Error(
      `${company.ticker} has no price data within the outcome period.`,
    );
  }

  if (benchmarkSeries.length === 0) {
    throw new Error(
      `${benchmark.ticker} has no price data within the outcome period.`,
    );
  }

  return {
    selectionId: selection.selectionId,
    horizon: outcome.horizon,
    startDate: selection.selectedAt,
    endDate: outcome.measurementDate,

    company,
    benchmark,

    companySeries,
    benchmarkSeries,

    providerName: provider.name,
    fetchedAt: new Date().toISOString(),
  };
}