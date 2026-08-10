import type {
  MomentumScore,
  QualityScore,
  ValueScore,
} from "./types";

export interface TodayScoreInputs {
  quality: QualityScore;
  value: ValueScore;
  momentum: MomentumScore;
}

export interface TodayScoreResult {
  score: number;
  quality: number;
  value: number;
  momentum: number;
  weights: {
    quality: number;
    value: number;
    momentum: number;
  };
}

export const todayScoreWeights = {
  quality: 0.4,
  value: 0.3,
  momentum: 0.3,
} as const;

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function calculateTodayScore(
  inputs: TodayScoreInputs,
): TodayScoreResult {
  const quality = clampScore(inputs.quality.score);
  const value = clampScore(inputs.value.score);
  const momentum = clampScore(inputs.momentum.score);

  const score = clampScore(
    quality * todayScoreWeights.quality +
      value * todayScoreWeights.value +
      momentum * todayScoreWeights.momentum,
  );

  return {
    score,
    quality,
    value,
    momentum,
    weights: { ...todayScoreWeights },
  };
}