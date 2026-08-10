import type { TodayScorePillar } from "../types";

export type TodayScoreDataset =
  | "price-history"
  | "statistics"
  | "income-statement"
  | "balance-sheet"
  | "cash-flow"
  | "eps-trend"
  | "eps-revisions";

export interface TodayScoreDataRequirement {
  id: TodayScoreDataset;
  label: string;
  pillars: readonly TodayScorePillar[];
  purpose: string;
}

export interface ProviderCompanyIdentity {
  companyId: string;
  companyName: string;
  ticker: string;
  exchangeMic: string;
}

export type ProviderCoverageStatus =
  | "available"
  | "plan-restricted"
  | "authentication-error"
  | "rate-limited"
  | "unavailable"
  | "provider-error";

export interface ProviderCoverageProbe {
  providerId: string;
  providerName: string;
  companyId: string;
  companyName: string;
  symbol: string;
  dataset: TodayScoreDataset;
  endpoint: string;
  status: ProviderCoverageStatus;
  message: string;
  checkedAt: string;
  httpStatus?: number;
  sampleSize?: number;
}

export interface FinancialDataProvider {
  readonly id: string;
  readonly name: string;
  probeCoverage(
    company: ProviderCompanyIdentity,
    dataset: TodayScoreDataset,
  ): Promise<ProviderCoverageProbe>;
}
