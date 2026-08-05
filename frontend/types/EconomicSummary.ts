export type Trend =
  | "Improving"
  | "Stable"
  | "Weakening";

export type EconomicStatus =
  | "Expansion"
  | "Contraction";

export interface EconomicSummary {
  name: string;

  value: number;

  previous: number;

  change: number;

  trend: Trend;

  status: EconomicStatus;

  confidence: number;

  assessment: string;

  reportPeriod: string;
}