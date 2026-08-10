import { measureOutcome } from "./outcomeEngine";
import { buildOutcomeReview } from "./outcomeReviewEngine";

import type { SelectionSnapshot } from "./types";

const baseSelection: SelectionSnapshot = {
  selectionId: "selection-atlas-001",
  companyId: "atlas",
  ticker: "ATLS",
  companyName: "Atlas Test Company",

  decision: "long",
  selectedAt: "2026-08-01",
  entryPrice: 100,

  todayScore: 80,
  qualityScore: 80,
  valueScore: 83,
  momentumScore: 76,

  themeId: "manufacturing-recovery",
  themeName: "Manufacturing Recovery",
  themeScore: 82,
  themeConfidence: 84,

  benchmarkId: "sp-500",
  benchmarkName: "S&P 500",
  benchmarkEntryPrice: 5000,

  thesis:
    "Strong TodayScore supported by an improving manufacturing theme.",

  risks: [
    "Manufacturing recovery may weaken.",
    "Company earnings may disappoint.",
  ],
};

const successfulOutcome = measureOutcome({
  selection: baseSelection,
  horizon: "three-month",
  measurementDate: "2026-11-01",
  reviewedAt: "2026-11-02",

  companyReviewPrice: 115,
  benchmarkReviewPrice: 5250,
});

const successfulReview = buildOutcomeReview({
  selection: baseSelection,
  outcome: successfulOutcome,
  reviewedAt: "2026-11-02",

  correctDrivers: [
    "Manufacturing demand continued to improve.",
    "Company earnings exceeded expectations.",
  ],

  lessons: [
    "Improving macro conditions combined with a strong TodayScore produced a successful selection.",
  ],
});

const unsuccessfulOutcome = measureOutcome({
  selection: baseSelection,
  horizon: "six-month",
  measurementDate: "2027-02-01",
  reviewedAt: "2027-02-02",

  companyReviewPrice: 90,
  benchmarkReviewPrice: 5500,
});

const unsuccessfulReview = buildOutcomeReview({
  selection: baseSelection,
  outcome: unsuccessfulOutcome,
  reviewedAt: "2027-02-02",

  failureReasons: [
    "Company margins deteriorated despite improving industry demand.",
  ],

  unexpectedEvents: [
    "A major customer cancelled an important contract.",
  ],

  lessons: [
    "Industry strength did not protect the company from company-specific execution risk.",
  ],
});

const pendingOutcome = measureOutcome({
  selection: baseSelection,
  horizon: "twelve-month",
  measurementDate: "2027-08-01",
});

const pendingReview = buildOutcomeReview({
  selection: baseSelection,
  outcome: pendingOutcome,
  reviewedAt: "2027-08-01",
});

const successfulReviewPassed =
  successfulReview.expectedOutcome.includes(
    "expected to outperform",
  ) &&
  successfulReview.actualOutcome.includes(
    "outperformed by 10%",
  ) &&
  successfulReview.correctDrivers.length === 2 &&
  successfulReview.failureReasons.length === 0;

const unsuccessfulReviewPassed =
  unsuccessfulReview.actualOutcome.includes(
    "underperformed by 20%",
  ) &&
  unsuccessfulReview.failureReasons.length === 1 &&
  unsuccessfulReview.unexpectedEvents.length === 1 &&
  unsuccessfulReview.lessons.length === 1;

const pendingReviewPassed =
  pendingReview.actualOutcome.includes(
    "still pending",
  ) &&
  pendingReview.correctDrivers.length === 0 &&
  pendingReview.failureReasons.length === 0 &&
  pendingReview.unexpectedEvents.length === 0 &&
  pendingReview.lessons.length === 0;

export interface OutcomeReviewEngineTestResults {
  successfulReviewPassed: boolean;
  unsuccessfulReviewPassed: boolean;
  pendingReviewPassed: boolean;
  allPassed: boolean;
}

export const outcomeReviewEngineTestResults:
  OutcomeReviewEngineTestResults = {
    successfulReviewPassed,
    unsuccessfulReviewPassed,
    pendingReviewPassed,

    allPassed:
      successfulReviewPassed &&
      unsuccessfulReviewPassed &&
      pendingReviewPassed,
  };

if (!outcomeReviewEngineTestResults.allPassed) {
  throw new Error(
    "Outcome review engine tests failed.",
  );
}