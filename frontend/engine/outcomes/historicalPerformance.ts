import type {
  OutcomeHorizon,
  SelectionOutcomeRecord,
} from "./types";

export type HistoricalSampleStrength =
  | "none"
  | "very-low"
  | "low"
  | "moderate"
  | "strong";

export interface HistoricalPerformanceResult {
  themeId: string;
  horizon: OutcomeHorizon;

  totalSelections: number;
  completedSelections: number;
  successfulSelections: number;
  unsuccessfulSelections: number;
  inconclusiveSelections: number;
  pendingSelections: number;

  rawSuccessRate?: number;
  adjustedSuccessRate?: number;

  sampleStrength: HistoricalSampleStrength;
  sampleWeight: number;
  explanation: string;
}

const NEUTRAL_SUCCESS_RATE = 50;
const FULL_SAMPLE_SIZE = 20;

function round(value: number): number {
  return Math.round(value);
}

function getSampleStrength(
  completedSelections: number,
): HistoricalSampleStrength {
  if (completedSelections === 0) {
    return "none";
  }

  if (completedSelections < 3) {
    return "very-low";
  }

  if (completedSelections < 5) {
    return "low";
  }

  if (completedSelections < 10) {
    return "moderate";
  }

  return "strong";
}

function getSampleWeight(
  completedSelections: number,
): number {
  return Math.min(
    completedSelections / FULL_SAMPLE_SIZE,
    1,
  );
}

function buildExplanation({
  rawSuccessRate,
  adjustedSuccessRate,
  completedSelections,
  sampleStrength,
}: {
  rawSuccessRate?: number;
  adjustedSuccessRate?: number;
  completedSelections: number;
  sampleStrength: HistoricalSampleStrength;
}): string {
  if (
    rawSuccessRate === undefined ||
    adjustedSuccessRate === undefined
  ) {
    return (
      "No completed selections are available for this theme " +
      "and measurement horizon. Historical performance cannot " +
      "yet contribute to confidence."
    );
  }

  if (sampleStrength === "very-low") {
    return (
      `The observed historical success rate is ${rawSuccessRate}%, ` +
      `but it is based on only ${completedSelections} completed ` +
      `${completedSelections === 1 ? "selection" : "selections"}. ` +
      `The sample is too small to justify high confidence, so its ` +
      `evidence contribution is reduced to ${adjustedSuccessRate}%.`
    );
  }

  if (sampleStrength === "low") {
    return (
      `The observed historical success rate is ${rawSuccessRate}% ` +
      `from ${completedSelections} completed selections. The sample ` +
      `remains limited, so its confidence contribution is moderated ` +
      `to ${adjustedSuccessRate}%.`
    );
  }

  if (sampleStrength === "moderate") {
    return (
      `The observed historical success rate is ${rawSuccessRate}% ` +
      `from ${completedSelections} completed selections. This is a ` +
      `moderate sample, producing an adjusted evidence contribution ` +
      `of ${adjustedSuccessRate}%.`
    );
  }

  return (
    `The observed historical success rate is ${rawSuccessRate}% ` +
    `from ${completedSelections} completed selections. The sample ` +
    `is sufficiently developed to make historical performance a ` +
    `stronger confidence input, contributing ${adjustedSuccessRate}%.`
  );
}

export function calculateThemeHistoricalPerformance(
  records: SelectionOutcomeRecord[],
  themeId: string,
  horizon: OutcomeHorizon,
): HistoricalPerformanceResult {
  const themeRecords = records.filter(
    (record) => record.selection.themeId === themeId,
  );

  let successfulSelections = 0;
  let unsuccessfulSelections = 0;
  let inconclusiveSelections = 0;
  let pendingSelections = 0;

  themeRecords.forEach((record) => {
    const outcome = record.outcomes.find(
      (item) => item.horizon === horizon,
    );

    if (!outcome || outcome.status === "pending") {
      pendingSelections += 1;
      return;
    }

    if (outcome.status === "successful") {
      successfulSelections += 1;
      return;
    }

    if (outcome.status === "unsuccessful") {
      unsuccessfulSelections += 1;
      return;
    }

    inconclusiveSelections += 1;
  });

  /*
   * Inconclusive and pending outcomes are excluded from the
   * success-rate denominator because neither provides a definite
   * successful or unsuccessful result.
   */
  const completedSelections =
    successfulSelections + unsuccessfulSelections;

  const rawSuccessRate =
    completedSelections === 0
      ? undefined
      : round(
          (successfulSelections / completedSelections) * 100,
        );

  /*
   * Small samples are pulled towards a neutral 50% rate.
   *
   * At 20 completed selections the sample receives full weight.
   * Before then, its influence increases gradually as more evidence
   * becomes available.
   */
  const sampleWeight = getSampleWeight(
    completedSelections,
  );

  const adjustedSuccessRate =
    rawSuccessRate === undefined
      ? undefined
      : round(
          NEUTRAL_SUCCESS_RATE +
            (rawSuccessRate - NEUTRAL_SUCCESS_RATE) *
              sampleWeight,
        );

  const sampleStrength = getSampleStrength(
    completedSelections,
  );

  return {
    themeId,
    horizon,

    totalSelections: themeRecords.length,
    completedSelections,
    successfulSelections,
    unsuccessfulSelections,
    inconclusiveSelections,
    pendingSelections,

    rawSuccessRate,
    adjustedSuccessRate,

    sampleStrength,
    sampleWeight,

    explanation: buildExplanation({
      rawSuccessRate,
      adjustedSuccessRate,
      completedSelections,
      sampleStrength,
    }),
  };
}