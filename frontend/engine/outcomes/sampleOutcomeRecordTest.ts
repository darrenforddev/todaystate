import { sampleOutcomeRecord } from "./sampleOutcomeRecord";

import type {
  OutcomeHorizon,
} from "./types";

const expectedHorizons: OutcomeHorizon[] = [
  "one-month",
  "three-month",
  "six-month",
  "twelve-month",
];

const expectedRelativeReturns = [
  4,
  10,
  13,
  18,
];

const horizonsPassed =
  sampleOutcomeRecord.outcomes.length ===
    expectedHorizons.length &&
  sampleOutcomeRecord.outcomes.every(
    (outcome, index) =>
      outcome.horizon === expectedHorizons[index],
  );

const relativeReturnsPassed =
  sampleOutcomeRecord.outcomes.every(
    (outcome, index) =>
      outcome.relativeReturn ===
      expectedRelativeReturns[index],
  );

const statusesPassed =
  sampleOutcomeRecord.outcomes.every(
    (outcome) => outcome.status === "successful",
  );

const reviewPassed =
  sampleOutcomeRecord.review !== undefined &&
  sampleOutcomeRecord.review.correctDrivers.length === 3 &&
  sampleOutcomeRecord.review.failureReasons.length === 0 &&
  sampleOutcomeRecord.review.lessons.length === 1 &&
  sampleOutcomeRecord.review.actualOutcome.includes(
    "outperformed by 18%",
  );

const selectionSnapshotPassed =
  sampleOutcomeRecord.selection.companyId === "atlas" &&
  sampleOutcomeRecord.selection.decision === "long" &&
  sampleOutcomeRecord.selection.entryPrice === 100 &&
  sampleOutcomeRecord.selection.todayScore === 80 &&
  sampleOutcomeRecord.selection.themeConfidence === 84 &&
  sampleOutcomeRecord.selection.benchmarkEntryPrice ===
    5000;

export interface SampleOutcomeRecordTestResults {
  horizonsPassed: boolean;
  relativeReturnsPassed: boolean;
  statusesPassed: boolean;
  reviewPassed: boolean;
  selectionSnapshotPassed: boolean;
  allPassed: boolean;
}

export const sampleOutcomeRecordTestResults:
  SampleOutcomeRecordTestResults = {
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

if (!sampleOutcomeRecordTestResults.allPassed) {
  throw new Error(
    "Sample outcome record validation failed.",
  );
}