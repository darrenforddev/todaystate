import type {
  HorizonOutcome,
  OutcomeReview,
  SelectionSnapshot,
} from "./types";

export interface BuildOutcomeReviewInputs {
  selection: SelectionSnapshot;
  outcome: HorizonOutcome;
  reviewedAt: string;

  correctDrivers?: string[];
  failureReasons?: string[];
  unexpectedEvents?: string[];
  lessons?: string[];
}

function describeExpectedOutcome(
  selection: SelectionSnapshot,
): string {
  if (selection.decision === "long") {
    return (
      `${selection.companyName} was expected to outperform ` +
      `${selection.benchmarkName}.`
    );
  }

  if (selection.decision === "short") {
    return (
      `${selection.companyName} was expected to underperform ` +
      `${selection.benchmarkName}.`
    );
  }

  if (selection.decision === "avoid") {
    return (
      `${selection.companyName} was excluded because its ` +
      `risk-and-reward profile was considered unattractive.`
    );
  }

  return (
    `${selection.companyName} was placed on watch while ` +
    `further evidence developed.`
  );
}

function describeActualOutcome(
  selection: SelectionSnapshot,
  outcome: HorizonOutcome,
): string {
  if (outcome.status === "pending") {
    return (
      `The ${outcome.horizon} outcome is still pending because ` +
      `complete price data is not yet available.`
    );
  }

  if (
    outcome.companyReturn === undefined ||
    outcome.benchmarkReturn === undefined ||
    outcome.relativeReturn === undefined
  ) {
    return (
      `The ${outcome.horizon} outcome could not be fully ` +
      `evaluated because return data is incomplete.`
    );
  }

  const relativeDescription =
    outcome.relativeReturn > 0
      ? `outperformed by ${outcome.relativeReturn}%`
      : outcome.relativeReturn < 0
        ? `underperformed by ${Math.abs(outcome.relativeReturn)}%`
        : "matched the benchmark";

  return (
    `${selection.companyName} returned ` +
    `${outcome.companyReturn}% compared with ` +
    `${outcome.benchmarkReturn}% for ` +
    `${selection.benchmarkName}, and therefore ` +
    `${relativeDescription}. The outcome was classified as ` +
    `${outcome.status}.`
  );
}

export function buildOutcomeReview({
  selection,
  outcome,
  reviewedAt,
  correctDrivers = [],
  failureReasons = [],
  unexpectedEvents = [],
  lessons = [],
}: BuildOutcomeReviewInputs): OutcomeReview {
  return {
    reviewedAt,
    expectedOutcome: describeExpectedOutcome(selection),
    actualOutcome: describeActualOutcome(
      selection,
      outcome,
    ),
    correctDrivers: [...correctDrivers],
    failureReasons: [...failureReasons],
    unexpectedEvents: [...unexpectedEvents],
    lessons: [...lessons],
  };
}