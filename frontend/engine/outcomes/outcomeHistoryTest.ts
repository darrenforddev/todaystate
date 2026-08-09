import {
  filterOutcomeHistory,
  getOutcomeHistorySummary,
  getSuccessRate,
} from "./outcomeHistory";

import { sampleOutcomeRecord } from "./sampleOutcomeRecord";
import { sampleFailedOutcomeRecord } from "./sampleFailedOutcomeRecord";

import type { SelectionOutcomeRecord } from "./types";

const records: SelectionOutcomeRecord[] = [
  sampleOutcomeRecord,
  sampleFailedOutcomeRecord,
];

const twelveMonthSummary = getOutcomeHistorySummary(
  records,
  "twelve-month",
);

const summaryPassed =
  twelveMonthSummary.total === 2 &&
  twelveMonthSummary.successful === 1 &&
  twelveMonthSummary.unsuccessful === 1 &&
  twelveMonthSummary.inconclusive === 0 &&
  twelveMonthSummary.pending === 0;

const twelveMonthSuccessRate = getSuccessRate(
  records,
  "twelve-month",
);

const successRatePassed = twelveMonthSuccessRate === 50;

const successfulRecords = filterOutcomeHistory(records, {
  horizon: "twelve-month",
  status: "successful",
});

const successfulFilterPassed =
  successfulRecords.length === 1 &&
  successfulRecords[0].selection.companyId === "atlas";

const unsuccessfulRecords = filterOutcomeHistory(records, {
  horizon: "twelve-month",
  status: "unsuccessful",
});

const unsuccessfulFilterPassed =
  unsuccessfulRecords.length === 1 &&
  unsuccessfulRecords[0].selection.companyId === "borealis";

const highTodayScoreRecords = filterOutcomeHistory(records, {
  minimumTodayScore: 80,
});

const todayScoreFilterPassed =
  highTodayScoreRecords.length === 1 &&
  highTodayScoreRecords[0].selection.companyId === "atlas";

const highConfidenceRecords = filterOutcomeHistory(records, {
  minimumThemeConfidence: 82,
});

const confidenceFilterPassed =
  highConfidenceRecords.length === 1 &&
  highConfidenceRecords[0].selection.companyId === "atlas";

const manufacturingThemeRecords = filterOutcomeHistory(
  records,
  {
    themeId: "manufacturing-recovery",
  },
);

const themeFilterPassed =
  manufacturingThemeRecords.length === 1 &&
  manufacturingThemeRecords[0].selection.companyId ===
    "atlas";

const longRecords = filterOutcomeHistory(records, {
  decision: "long",
});

const decisionFilterPassed = longRecords.length === 2;

const combinedFilterRecords = filterOutcomeHistory(records, {
  decision: "long",
  horizon: "twelve-month",
  status: "successful",
  minimumTodayScore: 80,
  minimumThemeConfidence: 80,
  themeId: "manufacturing-recovery",
});

const combinedFilterPassed =
  combinedFilterRecords.length === 1 &&
  combinedFilterRecords[0].selection.companyId === "atlas";

const oneMonthSummary = getOutcomeHistorySummary(
  records,
  "one-month",
);

const inconclusivePassed =
  oneMonthSummary.total === 2 &&
  oneMonthSummary.successful === 1 &&
  oneMonthSummary.unsuccessful === 0 &&
  oneMonthSummary.inconclusive === 1 &&
  oneMonthSummary.pending === 0;

export interface OutcomeHistoryTestResults {
  summaryPassed: boolean;
  successRatePassed: boolean;
  successfulFilterPassed: boolean;
  unsuccessfulFilterPassed: boolean;
  todayScoreFilterPassed: boolean;
  confidenceFilterPassed: boolean;
  themeFilterPassed: boolean;
  decisionFilterPassed: boolean;
  combinedFilterPassed: boolean;
  inconclusivePassed: boolean;
  allPassed: boolean;
}

export const outcomeHistoryTestResults:
  OutcomeHistoryTestResults = {
    summaryPassed,
    successRatePassed,
    successfulFilterPassed,
    unsuccessfulFilterPassed,
    todayScoreFilterPassed,
    confidenceFilterPassed,
    themeFilterPassed,
    decisionFilterPassed,
    combinedFilterPassed,
    inconclusivePassed,

    allPassed:
      summaryPassed &&
      successRatePassed &&
      successfulFilterPassed &&
      unsuccessfulFilterPassed &&
      todayScoreFilterPassed &&
      confidenceFilterPassed &&
      themeFilterPassed &&
      decisionFilterPassed &&
      combinedFilterPassed &&
      inconclusivePassed,
  };

if (!outcomeHistoryTestResults.allPassed) {
  throw new Error(
    "Outcome History validation failed.",
  );
}