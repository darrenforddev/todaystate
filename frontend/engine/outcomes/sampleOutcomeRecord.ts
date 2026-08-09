import { measureOutcome } from "./outcomeEngine";
import { buildOutcomeReview } from "./outcomeReviewEngine";

import type {
  SelectionOutcomeRecord,
  SelectionSnapshot,
} from "./types";

const atlasSelection: SelectionSnapshot = {
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

  themeId: "industrial-recovery",
themeName: "Industrial Recovery",
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

const oneMonthOutcome = measureOutcome({
  selection: atlasSelection,
  horizon: "one-month",
  measurementDate: "2026-09-01",
  companyPrice: 106,
  benchmarkPrice: 5100,
});

const threeMonthOutcome = measureOutcome({
  selection: atlasSelection,
  horizon: "three-month",
  measurementDate: "2026-11-01",
  companyPrice: 115,
  benchmarkPrice: 5250,
});

const sixMonthOutcome = measureOutcome({
  selection: atlasSelection,
  horizon: "six-month",
  measurementDate: "2027-02-01",
  companyPrice: 121,
  benchmarkPrice: 5400,
});

const twelveMonthOutcome = measureOutcome({
  selection: atlasSelection,
  horizon: "twelve-month",
  measurementDate: "2027-08-01",
  companyPrice: 130,
  benchmarkPrice: 5600,
});

const review = buildOutcomeReview({
  selection: atlasSelection,
  outcome: twelveMonthOutcome,
  reviewedAt: "2027-08-02",

  correctDrivers: [
    "Manufacturing demand improved during the measurement period.",
    "Company earnings and margins exceeded expectations.",
    "Positive price momentum remained intact.",
  ],

  lessons: [
    "Strong company fundamentals combined with supportive macro conditions produced sustained benchmark outperformance.",
  ],
});

export const sampleOutcomeRecord: SelectionOutcomeRecord = {
  selection: atlasSelection,

  outcomes: [
    oneMonthOutcome,
    threeMonthOutcome,
    sixMonthOutcome,
    twelveMonthOutcome,
  ],

  review,
};