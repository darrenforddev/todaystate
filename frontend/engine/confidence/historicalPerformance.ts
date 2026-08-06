export interface HistoricalPerformance {
  successfulOutcomes: number;
  totalOutcomes: number;
}

const PRIOR_SUCCESSFUL_OUTCOMES = 5;
const PRIOR_TOTAL_OUTCOMES = 10;

export function calculateHistoricalAccuracy(
  performance: HistoricalPerformance
): number {
  const totalOutcomes = Math.max(
    0,
    Math.floor(performance.totalOutcomes)
  );

  const successfulOutcomes = Math.min(
    totalOutcomes,
    Math.max(
      0,
      Math.floor(performance.successfulOutcomes)
    )
  );

  const adjustedSuccessfulOutcomes =
    successfulOutcomes + PRIOR_SUCCESSFUL_OUTCOMES;

  const adjustedTotalOutcomes =
    totalOutcomes + PRIOR_TOTAL_OUTCOMES;

  return Math.round(
    (adjustedSuccessfulOutcomes /
      adjustedTotalOutcomes) *
      100
  );
}