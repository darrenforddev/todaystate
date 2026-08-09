import type {
  SelectionOutcomeRecord,
} from "./types";

import {
  calculateOutcomeReview,
  type OutcomeReviewResult,
} from "./outcomeReview";

import {
  applyOutcomeReview,
} from "./applyOutcomeReview";

const selectionId =
  "atlas-long-2026-08-09-test";

const baseRecord = {
  selectionId,

  companyId: "atlas",
  ticker: "ATL",
  companyName: "Atlas Industries",

  decision: "long",
  selectedAt: "2026-08-09",
  entryPrice: 100,

  todayScore: 80,
  qualityScore: 83,
  valueScore: 83,
  momentumScore: 73,

  themeId: "manufacturing-recovery",
  themeName: "Manufacturing Recovery",
  themeScore: 82,
  themeConfidence: 84,

  benchmarkId: "sp500",
  benchmarkName: "S&P 500",
  benchmarkEntryPrice: 100,

  thesis:
    "Atlas qualifies because its scores support a long selection.",

  risks: [
    "Economic recovery weakens",
    "Company earnings deteriorate",
  ],

  outcomes: [
    {
      horizon: "1-month",
      measurementDate: "2026-09-09",
      status: "pending",
    },
    {
      horizon: "3-month",
      measurementDate: "2026-11-09",
      status: "pending",
    },
    {
      horizon: "6-month",
      measurementDate: "2027-02-09",
      status: "pending",
    },
    {
      horizon: "12-month",
      measurementDate: "2027-08-09",
      status: "pending",
    },
  ],
} as SelectionOutcomeRecord;

const successfulReview =
  calculateOutcomeReview({
    selectionId,
    decision: "long",
    horizon: "1-month",

    measurementDate: "2026-09-09",
    reviewedAt: "2026-09-09",

    companyEntryPrice: 100,
    companyReviewPrice: 110,

    benchmarkEntryPrice: 100,
    benchmarkReviewPrice: 105,
  });

function assertEqual<T>(
  actual: T,
  expected: T,
  message: string,
): void {
  if (actual !== expected) {
    throw new Error(
      `${message}: expected ${String(
        expected,
      )}, received ${String(actual)}.`,
    );
  }
}

function assertThrows(
  action: () => void,
  expectedMessage: string,
): void {
  try {
    action();
  } catch (error) {
    const actualMessage =
      error instanceof Error
        ? error.message
        : String(error);

    if (!actualMessage.includes(expectedMessage)) {
      throw new Error(
        `Expected error containing "${expectedMessage}", received "${actualMessage}".`,
      );
    }

    return;
  }

  throw new Error(
    `Expected an error containing "${expectedMessage}".`,
  );
}

function replaceReview(
  review: OutcomeReviewResult,
  changes: Partial<OutcomeReviewResult>,
): OutcomeReviewResult {
  return {
    ...review,
    ...changes,
  };
}

export function runApplyOutcomeReviewTests(): void {
  const updatedRecord = applyOutcomeReview(
    baseRecord,
    successfulReview,
  );

  const reviewedOutcome =
    updatedRecord.outcomes.find(
      (outcome) =>
        outcome.horizon === "1-month",
    );

  if (!reviewedOutcome) {
    throw new Error(
      "Updated 1-month outcome was not found.",
    );
  }

  assertEqual(
    reviewedOutcome.status,
    "successful",
    "Reviewed outcome status",
  );

  assertEqual(
    reviewedOutcome.companyReviewPrice,
    110,
    "Reviewed company price",
  );

  assertEqual(
    reviewedOutcome.benchmarkReviewPrice,
    105,
    "Reviewed benchmark price",
  );

  assertEqual(
    reviewedOutcome.companyReturn,
    10,
    "Reviewed company return",
  );

  assertEqual(
    reviewedOutcome.benchmarkReturn,
    5,
    "Reviewed benchmark return",
  );

  assertEqual(
    reviewedOutcome.relativeReturn,
    5,
    "Reviewed relative return",
  );

  const remainingPendingOutcomes =
    updatedRecord.outcomes.filter(
      (outcome) =>
        outcome.horizon !== "1-month" &&
        outcome.status === "pending",
    );

  assertEqual(
    remainingPendingOutcomes.length,
    3,
    "Other horizons should remain pending",
  );

  assertEqual(
    baseRecord.outcomes[0].status,
    "pending",
    "Original record must remain unchanged",
  );

  assertThrows(
    () => {
      applyOutcomeReview(
        baseRecord,
        replaceReview(successfulReview, {
          selectionId:
            "different-selection-id",
        }),
      );
    },
    "does not match record",
  );

  assertThrows(
    () => {
      applyOutcomeReview(
        baseRecord,
        replaceReview(successfulReview, {
          measurementDate: "2026-09-10",
        }),
      );
    },
    "does not match scheduled date",
  );

  const recordWithoutOneMonth = {
    ...baseRecord,

    outcomes: baseRecord.outcomes.filter(
      (outcome) =>
        outcome.horizon !== "1-month",
    ),
  };

  assertThrows(
    () => {
      applyOutcomeReview(
        recordWithoutOneMonth,
        successfulReview,
      );
    },
    "No 1-month outcome exists",
  );

  const duplicateOutcomeRecord = {
    ...baseRecord,

    outcomes: [
      ...baseRecord.outcomes,
      {
        ...baseRecord.outcomes[0],
      },
    ],
  };

  assertThrows(
    () => {
      applyOutcomeReview(
        duplicateOutcomeRecord,
        successfulReview,
      );
    },
    "contains duplicate 1-month outcomes",
  );

  assertThrows(
    () => {
      applyOutcomeReview(
        updatedRecord,
        successfulReview,
      );
    },
    "has already been reviewed",
  );
}

export const appliedOutcomeReviewTestResult =
  applyOutcomeReview(
    baseRecord,
    successfulReview,
  );

runApplyOutcomeReviewTests();