import {
  calculateReturn,
  measureOutcome,
} from "./outcomeEngine";

import type {
  SelectionSnapshot,
} from "./types";

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

const successfulLong = measureOutcome({
  selection: baseSelection,
  horizon: "one-month",
  measurementDate: "2026-09-01",
  companyPrice: 110,
  benchmarkPrice: 5250,
});

const successfulShort = measureOutcome({
  selection: {
    ...baseSelection,
    selectionId: "selection-short-001",
    decision: "short",
  },
  horizon: "three-month",
  measurementDate: "2026-11-01",
  companyPrice: 90,
  benchmarkPrice: 5100,
});

const unsuccessfulLong = measureOutcome({
  selection: baseSelection,
  horizon: "six-month",
  measurementDate: "2027-02-01",
  companyPrice: 95,
  benchmarkPrice: 5500,
});

const pendingOutcome = measureOutcome({
  selection: baseSelection,
  horizon: "twelve-month",
  measurementDate: "2027-08-01",
});

let invalidPriceProtected = false;

try {
  calculateReturn(0, 100);
} catch {
  invalidPriceProtected = true;
}

export interface OutcomeEngineTestResults {
  successfulLongPassed: boolean;
  successfulShortPassed: boolean;
  unsuccessfulLongPassed: boolean;
  pendingOutcomePassed: boolean;
  invalidPriceProtectionPassed: boolean;
  allPassed: boolean;
}

const successfulLongPassed =
  successfulLong.companyReturn === 10 &&
  successfulLong.benchmarkReturn === 5 &&
  successfulLong.relativeReturn === 5 &&
  successfulLong.status === "successful";

const successfulShortPassed =
  successfulShort.companyReturn === -10 &&
  successfulShort.benchmarkReturn === 2 &&
  successfulShort.relativeReturn === -12 &&
  successfulShort.status === "successful";

const unsuccessfulLongPassed =
  unsuccessfulLong.companyReturn === -5 &&
  unsuccessfulLong.benchmarkReturn === 10 &&
  unsuccessfulLong.relativeReturn === -15 &&
  unsuccessfulLong.status === "unsuccessful";

const pendingOutcomePassed =
  pendingOutcome.status === "pending" &&
  pendingOutcome.companyReturn === undefined &&
  pendingOutcome.relativeReturn === undefined;

export const outcomeEngineTestResults: OutcomeEngineTestResults = {
  successfulLongPassed,
  successfulShortPassed,
  unsuccessfulLongPassed,
  pendingOutcomePassed,
  invalidPriceProtectionPassed: invalidPriceProtected,

  allPassed:
    successfulLongPassed &&
    successfulShortPassed &&
    unsuccessfulLongPassed &&
    pendingOutcomePassed &&
    invalidPriceProtected,
};

if (!outcomeEngineTestResults.allPassed) {
  throw new Error("Outcome engine tests failed.");
}