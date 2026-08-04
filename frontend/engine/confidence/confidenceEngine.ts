import type { ConfidenceFactors } from "./confidenceFactors";
import { confidenceRules } from "./confidenceRules";

export interface ConfidenceBreakdown {
  evidenceQuality: number;
  evidenceAgreement: number;
  evidenceFreshness: number;
  supportingEvidence: number;
  historicalAccuracy: number;
}

export interface ConfidenceResult {
  confidence: number;
  breakdown: ConfidenceBreakdown;
}

export function calculateConfidence(
  factors: ConfidenceFactors
): ConfidenceResult {
  const breakdown: ConfidenceBreakdown = {
    evidenceQuality: Math.round(
      factors.evidenceQuality * confidenceRules.evidenceQuality
    ),

    evidenceAgreement: Math.round(
      factors.evidenceAgreement * confidenceRules.evidenceAgreement
    ),

    evidenceFreshness: Math.round(
      factors.evidenceFreshness * confidenceRules.evidenceFreshness
    ),

    supportingEvidence: Math.round(
      factors.supportingEvidence * confidenceRules.supportingEvidence
    ),

    historicalAccuracy: Math.round(
      factors.historicalAccuracy * confidenceRules.historicalAccuracy
    ),
  };

  const confidence =
    breakdown.evidenceQuality +
    breakdown.evidenceAgreement +
    breakdown.evidenceFreshness +
    breakdown.supportingEvidence +
    breakdown.historicalAccuracy;

  return {
    confidence,
    breakdown,
  };
}