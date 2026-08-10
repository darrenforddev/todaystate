import type { TodayScoreResult } from "./todayScore";
import type { TodayScoreClassification } from "./scoreBands";

export interface TodayScoreExplanation {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  warnings: string[];
}

function describePillar(
  name: string,
  score: number,
): {
  strength?: string;
  weakness?: string;
} {
  if (score >= 80) {
    return {
      strength: `${name} is a major strength with a score of ${score}.`,
    };
  }

  if (score >= 65) {
    return {
      strength: `${name} is strong with a score of ${score}.`,
    };
  }

  if (score < 20) {
    return {
      weakness: `${name} is critically weak with a score of ${score}.`,
    };
  }

  if (score < 40) {
    return {
      weakness: `${name} is weak with a score of ${score}.`,
    };
  }

  if (score < 45) {
    return {
      weakness: `${name} is below average with a score of ${score}.`,
    };
  }

  return {};
}

export function explainTodayScore(
  result: TodayScoreResult,
  classification: TodayScoreClassification,
): TodayScoreExplanation {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const warnings: string[] = [];

  const pillars = [
    { name: "Quality", score: result.quality },
    { name: "Value", score: result.value },
    { name: "Momentum", score: result.momentum },
  ];

  for (const pillar of pillars) {
    const explanation = describePillar(
      pillar.name,
      pillar.score,
    );

    if (explanation.strength) {
      strengths.push(explanation.strength);
    }

    if (explanation.weakness) {
      weaknesses.push(explanation.weakness);
    }
  }

  if (
    classification.safeguardApplied &&
    classification.safeguardReason
  ) {
    warnings.push(classification.safeguardReason);
  }

  const strongestPillar = pillars.reduce((strongest, current) =>
    current.score > strongest.score ? current : strongest,
  );

  const weakestPillar = pillars.reduce((weakest, current) =>
    current.score < weakest.score ? current : weakest,
  );

  const summary =
    `TodayScore ${result.score}/100 is classified as ` +
    `${classification.band}. ` +
    `${strongestPillar.name} is the strongest pillar at ` +
    `${strongestPillar.score}, while ${weakestPillar.name} ` +
    `is the weakest at ${weakestPillar.score}.`;

  return {
    summary,
    strengths,
    weaknesses,
    warnings,
  };
}