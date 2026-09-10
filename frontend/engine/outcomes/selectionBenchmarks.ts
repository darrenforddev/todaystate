import type {
  ProviderCompanyIdentity,
} from "../todayScore/providers/types";

export type SelectionBenchmarkId =
  | "sp500"
  | "ftse100"
  | "nasdaq100";

export interface SelectionBenchmark
  extends ProviderCompanyIdentity {
  quoteCurrency: string;
}

export const selectionBenchmarks: Record<
  SelectionBenchmarkId,
  SelectionBenchmark
> = {
  sp500: {
    companyId: "sp500",
    companyName: "SPDR S&P 500 ETF Trust",
    ticker: "SPY",
    exchangeMic: "ARCX",
    quoteCurrency: "USD",
  },

  ftse100: {
    companyId: "ftse100",
    companyName: "iShares Core FTSE 100 UCITS ETF",
    ticker: "ISF",
    exchangeMic: "XLON",
    quoteCurrency: "GBX",
  },

  nasdaq100: {
    companyId: "nasdaq100",
    companyName: "Invesco QQQ Trust",
    ticker: "QQQ",
    exchangeMic: "XNAS",
    quoteCurrency: "USD",
  },
};

export function isSelectionBenchmarkId(
  value: string,
): value is SelectionBenchmarkId {
  return value in selectionBenchmarks;
}

export function getSelectionBenchmark(
  value: string,
): SelectionBenchmark | undefined {
  return isSelectionBenchmarkId(value)
    ? selectionBenchmarks[value]
    : undefined;
}

export function getDefaultBenchmarkId(
  exchangeMic: string,
): SelectionBenchmarkId {
  const normalisedMic = exchangeMic
    .trim()
    .toUpperCase();

  if (normalisedMic === "XLON") {
    return "ftse100";
  }

  if (normalisedMic === "XNAS") {
    return "nasdaq100";
  }

  return "sp500";
}