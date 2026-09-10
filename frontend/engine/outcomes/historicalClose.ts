import "server-only";

import {
  createTwelveDataProvider,
} from "../todayScore/providers/twelveData";

import {
  parsePricePoints,
  pointAtOrAfter,
  pointAtOrBefore,
} from "../todayScore/providers/priceHistory";

import type {
  ProviderCompanyIdentity,
} from "../todayScore/providers/types";

export type HistoricalCloseDirection =
  | "at-or-after"
  | "at-or-before";

export interface HistoricalCloseResult {
  requestedDate: string;
  marketDate: string;
  close: number;

  companyId: string;
  companyName: string;
  ticker: string;
  exchangeMic: string;

  providerName: string;
  fetchedAt: string;
}

function assertValidDate(value: string): void {
  const pattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!pattern.test(value)) {
    throw new Error(
      "Historical price date must use YYYY-MM-DD format.",
    );
  }

  const timestamp = Date.parse(
    `${value}T00:00:00Z`,
  );

  if (
    !Number.isFinite(timestamp) ||
    new Date(timestamp)
      .toISOString()
      .slice(0, 10) !== value
  ) {
    throw new Error(
      "Historical price date is invalid.",
    );
  }
}

function calculateOutputSize(
  targetDate: string,
): number {
  const targetTimestamp = Date.parse(
    `${targetDate}T00:00:00Z`,
  );

  const nowTimestamp = Date.now();

  const calendarDays = Math.max(
    1,
    Math.ceil(
      (nowTimestamp - targetTimestamp) /
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

export async function fetchHistoricalClose(
  identity: ProviderCompanyIdentity,
  requestedDate: string,
  direction: HistoricalCloseDirection,
): Promise<HistoricalCloseResult> {
  assertValidDate(requestedDate);

  const provider = createTwelveDataProvider();

  if (!provider) {
    throw new Error(
      "TWELVE_DATA_API_KEY is not configured.",
    );
  }

  const result = await provider.fetchDataset(
    identity,
    "price-history",
    {
      priceHistoryOutputSize:
        calculateOutputSize(requestedDate),
    },
  );

  if (result.status !== "available") {
    throw new Error(
      `${identity.ticker} historical price is unavailable: ${result.message}`,
    );
  }

  const prices = parsePricePoints(result);

  const point =
    direction === "at-or-after"
      ? pointAtOrAfter(
          prices,
          requestedDate,
        )
      : pointAtOrBefore(
          prices,
          requestedDate,
        );

  if (!point) {
    throw new Error(
      `${identity.ticker} has no market close ${direction.replaceAll(
        "-",
        " ",
      )} ${requestedDate}.`,
    );
  }

  return {
    requestedDate,
    marketDate: point.date,
    close: point.close,

    companyId: identity.companyId,
    companyName: identity.companyName,
    ticker: identity.ticker,
    exchangeMic: identity.exchangeMic,

    providerName: provider.name,
    fetchedAt: new Date().toISOString(),
  };
}