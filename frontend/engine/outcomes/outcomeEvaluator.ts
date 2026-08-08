import type { HistoricalPerformance } from
  "../confidence/historicalPerformance";

import type {
  HistoricalOutcome,
  OutcomeDirection,
  OutcomeStatus,
} from "./historicalOutcome";

export interface OutcomeEvaluation {
  status: OutcomeStatus;
  actualDirection: OutcomeDirection;
  actualChange: number;
  outcomeExplanation: string;
  evaluated: boolean;
}

function determineActualDirection(
  actualChange: number,
  neutralThreshold: number,
): OutcomeDirection {
  if (actualChange > neutralThreshold) {
    return "positive";
  }

  if (actualChange < -neutralThreshold) {
    return "negative";
  }

  return "neutral";
}

function determineStatus(
  predictedDirection: HistoricalOutcome["predictedDirection"],
  actualDirection: OutcomeDirection,
): OutcomeStatus {
  if (predictedDirection === actualDirection) {
    return "correct";
  }

  if (
    predictedDirection === "neutral" ||
    actualDirection === "neutral"
  ) {
    return "mixed";
  }

  return "incorrect";
}

function buildOutcomeExplanation(
  outcome: HistoricalOutcome,
  actualDirection: OutcomeDirection,
  actualChange: number,
  status: OutcomeStatus,
): string {
  const changeText = `${actualChange >= 0 ? "+" : ""}${actualChange.toFixed(
    2,
  )}%`;

  if (status === "correct") {
    return (
      `${outcome.indicatorName} predicted a ` +
      `${outcome.predictedDirection} outcome. The measured result was ` +
      `${actualDirection} (${changeText}), so the forecast was correct.`
    );
  }

  if (status === "incorrect") {
    return (
      `${outcome.indicatorName} predicted a ` +
      `${outcome.predictedDirection} outcome, but the measured result was ` +
      `${actualDirection} (${changeText}). The forecast was incorrect and ` +
      `requires a failure explanation.`
    );
  }

  return (
    `${outcome.indicatorName} predicted a ` +
    `${outcome.predictedDirection} outcome. The measured result was ` +
    `${actualDirection} (${changeText}), so the result was classified as mixed.`
  );
}

export function evaluateHistoricalOutcome(
  outcome: HistoricalOutcome,
  endingValue: number,
  neutralThreshold = 0,
): HistoricalOutcome {
  if (outcome.startingValue === undefined) {
    throw new Error(
      `Cannot evaluate outcome "${outcome.id}" without a starting value.`,
    );
  }

  if (outcome.startingValue === 0) {
    throw new Error(
      `Cannot calculate percentage change for outcome "${outcome.id}" ` +
        `because its starting value is zero.`,
    );
  }

  const actualChange =
    ((endingValue - outcome.startingValue) /
      Math.abs(outcome.startingValue)) *
    100;

  const actualDirection = determineActualDirection(
    actualChange,
    Math.abs(neutralThreshold),
  );

  const status = determineStatus(
    outcome.predictedDirection,
    actualDirection,
  );

  return {
    ...outcome,
    endingValue,
    actualChange,
    actualDirection,
    status,
    evaluated: true,
    outcomeExplanation: buildOutcomeExplanation(
      outcome,
      actualDirection,
      actualChange,
      status,
    ),
    failureReasons:
      status === "incorrect"
        ? outcome.failureReasons ?? []
        : undefined,
  };
}

export function buildHistoricalPerformance(
  outcomes: HistoricalOutcome[],
  indicatorId?: string,
): HistoricalPerformance {
  const relevantOutcomes = outcomes.filter(
    (outcome) =>
      outcome.evaluated &&
      outcome.status !== "pending" &&
      (indicatorId === undefined ||
        outcome.indicatorId === indicatorId),
  );

  const decisiveOutcomes = relevantOutcomes.filter(
    (outcome) =>
      outcome.status === "correct" ||
      outcome.status === "incorrect",
  );

  const successfulOutcomes = decisiveOutcomes.filter(
    (outcome) => outcome.status === "correct",
  ).length;

  return {
    successfulOutcomes,
    totalOutcomes: decisiveOutcomes.length,
  };
}

export function getPendingOutcomes(
  outcomes: HistoricalOutcome[],
  asOfDate = new Date(),
): HistoricalOutcome[] {
  return outcomes.filter((outcome) => {
    if (outcome.evaluated || outcome.status !== "pending") {
      return false;
    }

    const evaluationDate = new Date(
      `${outcome.evaluationDate}T00:00:00Z`,
    );

    return evaluationDate <= asOfDate;
  });
}