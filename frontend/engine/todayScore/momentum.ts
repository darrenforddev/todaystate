import type {
  FactorScore,
  MomentumScore,
} from "./types";

export interface MomentumInputs {
  priceMomentum: FactorScore[];
  earningsMomentum: FactorScore[];
  trendStrength: FactorScore[];
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

export function calculateMomentumScore(
  inputs: MomentumInputs,
): MomentumScore {
  const priceMomentum = averageFactorScores(
    inputs.priceMomentum,
  );

  const earningsMomentum = averageFactorScores(
    inputs.earningsMomentum,
  );

  const trendStrength = averageFactorScores(
    inputs.trendStrength,
  );

  const score = clampScore(
    (
      priceMomentum +
      earningsMomentum +
      trendStrength
    ) / 3,
  );

  return {
    score,

    priceMomentum,
    earningsMomentum,
    trendStrength,

    factors: [
      ...inputs.priceMomentum,
      ...inputs.earningsMomentum,
      ...inputs.trendStrength,
    ],
  };
}