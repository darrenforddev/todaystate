import type { EvidenceSourceType } from "./confidenceSourceRules";
import type { HistoricalPerformance } from "./historicalPerformance";

export type EvidenceSignal =
  | "supportive"
  | "contradictory"
  | "neutral";

export type EvidenceUnit =
  | "index"
  | "thousands"
  | "percent"
  | "millions";

export interface ConfidenceEvidence {
  id: string;
  name: string;
  source: string;
  sourceType?: EvidenceSourceType;

  signal: EvidenceSignal;

  current?: number;
  previous?: number;
  change?: number;

  unit?: EvidenceUnit;

  direction?: "improving" | "weakening" | "unchanged";
  status?: "expansion" | "contraction" | "neutral";
  impact?: "positive" | "negative" | "neutral";

  explanation?: string;

  quality?: number;
  historicalAccuracy?: number;
  historicalPerformance?: HistoricalPerformance;

  // Temporary fallback while older evidence is migrated.
  freshness?: number;

  // Preferred method: MBIE derives freshness from dates.
  observedAt?: string;
  maxAgeDays?: number;
}