import type {
  HorizonOutcome,
  SelectionOutcomeRecord,
} from "./types";

import type {
  OutcomeReviewResult,
} from "./outcomeReview";

import {
  generateOutcomeExplanation,
} from "./outcomeExplanation";

export function applyOutcomeReview(
  record: SelectionOutcomeRecord,
  review: OutcomeReviewResult,
): SelectionOutcomeRecord {
  if (
    record.selection.selectionId !==
    review.selectionId
  ) {
    throw new Error(
      `Review selection ID "${review.selectionId}" does not match record "${record.selection.selectionId}".`,
    );
  }

  const matchingOutcomes = record.outcomes.filter(
    (outcome) =>
      outcome.horizon === review.horizon,
  );

  if (matchingOutcomes.length === 0) {
    throw new Error(
      `No ${review.horizon} outcome exists for selection "${record.selection.selectionId}".`,
    );
  }

  if (matchingOutcomes.length > 1) {
    throw new Error(
      `Selection "${record.selection.selectionId}" contains duplicate ${review.horizon} outcomes.`,
    );
  }

  const matchingOutcome = matchingOutcomes[0];

  if (matchingOutcome.status !== "pending") {
    throw new Error(
      `The ${review.horizon} outcome has already been reviewed.`,
    );
  }

  if (
    matchingOutcome.measurementDate !==
    review.measurementDate
  ) {
    throw new Error(
      `Review measurement date "${review.measurementDate}" does not match scheduled date "${matchingOutcome.measurementDate}".`,
    );
  }

  const completedOutcome: HorizonOutcome = {
    ...matchingOutcome,

    reviewedAt: review.reviewedAt,

    companyReviewPrice:
      review.companyReviewPrice,

    benchmarkReviewPrice:
      review.benchmarkReviewPrice,

    companyReturn: review.companyReturn,
    benchmarkReturn: review.benchmarkReturn,
    relativeReturn: review.relativeReturn,

    status: review.status,
    explanation: review.explanation,
  };

  const outcomeExplanation =
    generateOutcomeExplanation({
      selection: record.selection,
      outcome: completedOutcome,
      generatedAt: review.reviewedAt,
    });

  return {
    ...record,

    outcomes: record.outcomes.map((outcome) => {
      if (outcome.horizon !== review.horizon) {
        return outcome;
      }

      return {
        ...completedOutcome,
        outcomeExplanation,
      };
    }),
  };
}