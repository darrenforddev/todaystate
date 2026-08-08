import type { Evidence } from "../evidence/types";
import type { EvidenceSourceType } from "./confidenceSourceRules";
import type { HistoricalPerformance } from "./historicalPerformance";
import type {
  ConfidenceEvidence,
  EvidenceUnit,
} from "./confidenceEvidence";
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

  unit?: EvidenceUnit;
  explanation?: string;

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

    current: evidence.current,
    previous: evidence.previous,
    change: evidence.change,

    unit: metadata.unit,

    direction: evidence.direction,
    status: evidence.status,
    impact: evidence.impact,

    explanation:
      metadata.explanation ?? evidence.explanation,

    observedAt: metadata.observedAt,
    maxAgeDays: metadata.maxAgeDays,

    historicalPerformance: metadata.historicalPerformance,
  };
}