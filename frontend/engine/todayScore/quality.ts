import type {
  FactorScore,
  QualityScore,
} from "./types";

export interface QualityInputs {
  profitability: FactorScore[];
  financialStrength: FactorScore[];
  cashFlowQuality: FactorScore[];
  earningsStability: FactorScore[];
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

export function calculateQualityScore(
  inputs: QualityInputs,
): QualityScore {
  const profitability = averageFactorScores(
    inputs.profitability,
  );

  const financialStrength = averageFactorScores(
    inputs.financialStrength,
  );

  const cashFlowQuality = averageFactorScores(
    inputs.cashFlowQuality,
  );

  const earningsStability = averageFactorScores(
    inputs.earningsStability,
  );

  const score = clampScore(
    (
      profitability +
      financialStrength +
      cashFlowQuality +
      earningsStability
    ) / 4,
  );

  return {
    score,

    profitability,
    financialStrength,
    cashFlowQuality,
    earningsStability,

    factors: [
      ...inputs.profitability,
      ...inputs.financialStrength,
      ...inputs.cashFlowQuality,
      ...inputs.earningsStability,
    ],
  };
}