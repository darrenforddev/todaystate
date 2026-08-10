import type { TodayScorePillar } from "./types";
import type { FactorDirection } from "./qualityFactors";
import type {
  ProviderCompanyIdentity,
  ProviderCoverageStatus,
  TodayScoreDataset,
} from "./providers/types";

export type RawFactorStatus = "available" | "rejected" | "unavailable";
export type RawFactorScoreStatus = "percentile-locked";
export type RawFactorUnit = "percent" | "ratio" | "multiple" | "count";

export type RawUnitValidationStatus =
  | "validated"
  | "normalised"
  | "rejected";

export interface RawUnitValidation {
  status: RawUnitValidationStatus;
  quoteCurrency?: string;
  financialCurrency?: string;
  quoteToFinancialScale?: number;
  messages: string[];
  rejectedFactorCount: number;
}

export interface RawFactorEvidence {
  providerId: string;
  providerName: string;
  symbol: string;
  dataset: TodayScoreDataset;
  endpoint: string;
  fetchedAt: string;
  observedAt?: string;
  currency?: string;
}

export interface RawFactorResult {
  factorId: string;
  name: string;
  pillar: TodayScorePillar;
  category: string;
  direction: FactorDirection;
  status: RawFactorStatus;
  scoreStatus: RawFactorScoreStatus;
  rawValue?: number;
  unit?: RawFactorUnit;
  explanation: string;
  evidence: RawFactorEvidence[];
}

export interface RawFactorDatasetStatus {
  dataset: TodayScoreDataset;
  status: ProviderCoverageStatus;
  message: string;
  endpoint: string;
  fetchedAt: string;
  sampleSize?: number;
}

export interface RawFactorPillarReport {
  pillar: TodayScorePillar;
  scoreStatus: RawFactorScoreStatus;
  availableFactorCount: number;
  totalFactorCount: number;
  factors: RawFactorResult[];
}

export interface RawTodayScoreReport {
  company: ProviderCompanyIdentity;
  providerId: string;
  providerName: string;
  symbol: string;
  generatedAt: string;
  scoreStatus: RawFactorScoreStatus;
  scoreMessage: string;
  unitValidation: RawUnitValidation;
  datasets: RawFactorDatasetStatus[];
  pillars: Record<TodayScorePillar, RawFactorPillarReport>;
}
