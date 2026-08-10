import type {
  FactorScore,
  ValueScore,
} from "./types";

export interface ValueInputs {
  relativeValuation: FactorScore[];
  cashFlowValuation: FactorScore[];
  historicalValuation: FactorScore[];
}

function clampScore(score: number): number {
  return Math.max(
    0,
    Math.min(100, Math.round(score)),
  );
}

function averageFactorScores(
  factors: FactorScore[],
): number {
  if (factors.length === 0) {
    return 50;
  }

  const total = factors.reduce(
    (sum, factor) => sum + factor.score,
    0,
  );

  return clampScore(total / factors.length);
}

export function calculateValueScore(
  inputs: ValueInputs,
): ValueScore {
  const relativeValuation = averageFactorScores(
    inputs.relativeValuation,
  );

  const cashFlowValuation = averageFactorScores(
    inputs.cashFlowValuation,
  );

  const historicalValuation = averageFactorScores(
    inputs.historicalValuation,
  );

  const score = clampScore(
    (
      relativeValuation +
      cashFlowValuation +
      historicalValuation
    ) / 3,
  );

  return {
    score,

    relativeValuation,
    cashFlowValuation,
    historicalValuation,

    factors: [
      ...inputs.relativeValuation,
      ...inputs.cashFlowValuation,
      ...inputs.historicalValuation,
    ],
  };
}