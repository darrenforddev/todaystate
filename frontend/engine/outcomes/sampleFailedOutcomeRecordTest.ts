import { sampleFailedOutcomeRecord } from "./sampleFailedOutcomeRecord";

import type {
  OutcomeHorizon,
  OutcomeStatus,
} from "./types";

const expectedHorizons: OutcomeHorizon[] = [
  "one-month",
  "three-month",
  "six-month",
  "twelve-month",
];

const expectedRelativeReturns = [
  0,
  -5,
  -16,
  -27,
];

const expectedStatuses: OutcomeStatus[] = [
  "inconclusive",
  "unsuccessful",
  "unsuccessful",
  "unsuccessful",
];

const horizonsPassed =
  sampleFailedOutcomeRecord.outcomes.length ===
    expectedHorizons.length &&
  sampleFailedOutcomeRecord.outcomes.every(
    (outcome, index) =>
      outcome.horizon === expectedHorizons[index],
  );

const relativeReturnsPassed =
  sampleFailedOutcomeRecord.outcomes.every(
    (outcome, index) =>
      outcome.relativeReturn ===
      expectedRelativeReturns[index],
  );

const statusesPassed =
  sampleFailedOutcomeRecord.outcomes.every(
    (outcome, index) =>
      outcome.status === expectedStatuses[index],
  );

const reviewPassed =
  sampleFailedOutcomeRecord.review !== undefined &&
  sampleFailedOutcomeRecord.review.correctDrivers.length === 1 &&
  sampleFailedOutcomeRecord.review.failureReasons.length === 3 &&
  sampleFailedOutcomeRecord.review.unexpectedEvents.length === 2 &&
  sampleFailedOutcomeRecord.review.lessons.length === 2 &&
  sampleFailedOutcomeRecord.review.actualOutcome.includes(
    "underperformed by 27%",
  );

const selectionSnapshotPassed =
  sampleFailedOutcomeRecord.selection.companyId === "borealis" &&
  sampleFailedOutcomeRecord.selection.decision === "long" &&
  sampleFailedOutcomeRecord.selection.entryPrice === 100 &&
  sampleFailedOutcomeRecord.selection.todayScore === 76 &&
  sampleFailedOutcomeRecord.selection.themeConfidence === 81 &&
  sampleFailedOutcomeRecord.selection.benchmarkEntryPrice ===
    5000;

export interface SampleFailedOutcomeRecordTestResults {
  horizonsPassed: boolean;
  relativeReturnsPassed: boolean;
  statusesPassed: boolean;
  reviewPassed: boolean;
  selectionSnapshotPassed: boolean;
  allPassed: boolean;
}

export const sampleFailedOutcomeRecordTestResults:
  SampleFailedOutcomeRecordTestResults = {
    horizonsPassed,
    relativeReturnsPassed,
    statusesPassed,
    reviewPassed,
    selectionSnapshotPassed,

    allPassed:
      horizonsPassed &&
      relativeReturnsPassed &&
      statusesPassed &&
      reviewPassed &&
      selectionSnapshotPassed,
  };

if (!sampleFailedOutcomeRecordTestResults.allPassed) {
  throw new Error(
    "Failed outcome record validation failed.",
  );
}