import type { ScoreFactors } from "./scoreFactors";
import { scoreRules } from "./scoreRules";

export interface ScoreBreakdown {
  macroEnvironment: number;
  evidenceStrength: number;
  relationshipStrength: number;
  momentum: number;
  riskAdjustment: number;
}

export interface ScoreResult {
  score: number;
  breakdown: ScoreBreakdown;
}

export function calculateScore(
  factors: ScoreFactors
): ScoreResult {

  const breakdown = {
    macroEnvironment: Math.round(
      factors.macroEnvironment *
        scoreRules.macroEnvironment
    ),

    evidenceStrength: Math.round(
      factors.evidenceStrength *
        scoreRules.evidenceStrength
    ),

    relationshipStrength: Math.round(
      factors.relationshipStrength *
        scoreRules.relationshipStrength
    ),

    momentum: Math.round(
      factors.momentum *
        scoreRules.momentum
    ),

    riskAdjustment: Math.round(
      factors.riskAdjustment *
        scoreRules.riskAdjustment
    ),
  };

  const score =
    breakdown.macroEnvironment +
    breakdown.evidenceStrength +
    breakdown.relationshipStrength +
    breakdown.momentum +
    breakdown.riskAdjustment;

  return {
    score,
    breakdown,
  };
}