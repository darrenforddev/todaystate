import type { EvidenceSourceType } from "./confidenceSourceRules";
import type { HistoricalPerformance } from "./historicalPerformance";

export type EvidenceSignal =
  | "supportive"
  | "contradictory"
  | "neutral";

export interface ConfidenceEvidence {
  id: string;
  name: string;
  source: string;
  sourceType?: EvidenceSourceType;

  signal: EvidenceSignal;

  quality?: number;
  historicalAccuracy?: number;
historicalPerformance?: HistoricalPerformance;

  // Temporary fallback while older evidence is migrated.
  freshness?: number;

  // Preferred method: MBIE derives freshness from dates.
  observedAt?: string;
  maxAgeDays?: number;
}