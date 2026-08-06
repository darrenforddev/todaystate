import type { Evidence } from "../evidence/types";
import type { EvidenceSourceType } from "./confidenceSourceRules";
import type { HistoricalPerformance } from "./historicalPerformance";
import type { ConfidenceEvidence } from "./confidenceEvidence";
import {
  deriveEvidenceSignal,
  type SupportiveImpact,
} from "./confidenceSignal";

export interface ConfidenceEvidenceMetadata {
  name: string;
  source: string;
  sourceType: EvidenceSourceType;

  supportiveImpact: SupportiveImpact;

  observedAt: string;
  maxAgeDays: number;

  historicalPerformance?: HistoricalPerformance;
}

export function convertToConfidenceEvidence(
  evidence: Evidence,
  metadata: ConfidenceEvidenceMetadata
): ConfidenceEvidence {
  return {
    id: evidence.indicatorId,
    name: metadata.name,
    source: metadata.source,
    sourceType: metadata.sourceType,

    signal: deriveEvidenceSignal(
      evidence.impact,
      metadata.supportiveImpact
    ),

    observedAt: metadata.observedAt,
    maxAgeDays: metadata.maxAgeDays,

    historicalPerformance:
      metadata.historicalPerformance,
  };
}