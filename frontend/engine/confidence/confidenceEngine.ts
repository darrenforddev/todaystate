import type { ConfidenceFactors } from "./confidenceFactors";
import { confidenceRules } from "./confidenceRules";

export interface ConfidenceBreakdown {
  evidenceQuality: number;
  evidenceAgreement: number;
  evidenceFreshness: number;
  supportingEvidence: number;
  historicalAccuracy: number;
}

export type ConfidenceLevel =
  | "Very High Confidence"
  | "High Confidence"
  | "Moderate Confidence"
  | "Low Confidence"
  | "Very Low Confidence";

export interface ConfidenceResult {
  confidence: number;
  level: ConfidenceLevel;
  explanation: string;
  breakdown: ConfidenceBreakdown;
}

function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 85) return "Very High Confidence";
  if (confidence >= 70) return "High Confidence";
  if (confidence >= 55) return "Moderate Confidence";
  if (confidence >= 40) return "Low Confidence";

  return "Very Low Confidence";
}

function getConfidenceExplanation(
  factors: ConfidenceFactors,
  level: ConfidenceLevel
): string {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (factors.evidenceQuality >= 80) {
    strengths.push("evidence quality is strong");
  } else if (factors.evidenceQuality < 60) {
    weaknesses.push("evidence quality is limited");
  }

  if (factors.evidenceAgreement >= 80) {
    strengths.push("indicators broadly agree");
  } else if (factors.evidenceAgreement < 60) {
    weaknesses.push("indicators show contradictory signals");
  }

  if (factors.evidenceFreshness >= 80) {
    strengths.push("the evidence is current");
  } else if (factors.evidenceFreshness < 60) {
    weaknesses.push("some evidence is becoming stale");
  }

  if (factors.supportingEvidence >= 80) {
    strengths.push("there is strong supporting evidence");
  } else if (factors.supportingEvidence < 60) {
    weaknesses.push("supporting evidence is limited");
  }

  if (factors.historicalAccuracy >= 80) {
    strengths.push("historical accuracy is strong");
  } else if (factors.historicalAccuracy < 60) {
    weaknesses.push("historical reliability is weaker");
  }

  let explanation = `${level}.`;

  if (strengths.length > 0) {
    explanation += ` This is supported because ${strengths.join(", ")}.`;
  }

  if (weaknesses.length > 0) {
    explanation += ` Confidence is constrained because ${weaknesses.join(
      ", "
    )}.`;
  }

  return explanation;
}
function clampFactor(value: number): number {
  if (!Number.isFinite(value)) return 0;

  return Math.min(100, Math.max(0, value));
}

export function calculateConfidence(
  factors: ConfidenceFactors
): ConfidenceResult {
  const safeFactors: ConfidenceFactors = {
    evidenceQuality: clampFactor(factors.evidenceQuality),
    evidenceAgreement: clampFactor(factors.evidenceAgreement),
    evidenceFreshness: clampFactor(factors.evidenceFreshness),
    supportingEvidence: clampFactor(factors.supportingEvidence),
    historicalAccuracy: clampFactor(factors.historicalAccuracy),
  };

  const breakdown: ConfidenceBreakdown = {
    evidenceQuality: Math.round(
      safeFactors.evidenceQuality * confidenceRules.evidenceQuality
    ),

    evidenceAgreement: Math.round(
      safeFactors.evidenceAgreement * confidenceRules.evidenceAgreement
    ),

    evidenceFreshness: Math.round(
      safeFactors.evidenceFreshness * confidenceRules.evidenceFreshness
    ),

    supportingEvidence: Math.round(
      safeFactors.supportingEvidence * confidenceRules.supportingEvidence
    ),

    historicalAccuracy: Math.round(
      safeFactors.historicalAccuracy * confidenceRules.historicalAccuracy
    ),
  };

  const confidence =
    breakdown.evidenceQuality +
    breakdown.evidenceAgreement +
    breakdown.evidenceFreshness +
    breakdown.supportingEvidence +
    breakdown.historicalAccuracy;

  const level = getConfidenceLevel(confidence);

  return {
    confidence,
    level,
    explanation: getConfidenceExplanation(safeFactors, level),
    breakdown,
  };
}