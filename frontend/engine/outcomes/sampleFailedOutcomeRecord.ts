import { measureOutcome } from "./outcomeEngine";
import { buildOutcomeReview } from "./outcomeReviewEngine";

import type {
  SelectionOutcomeRecord,
  SelectionSnapshot,
} from "./types";

const borealisSelection: SelectionSnapshot = {
  selectionId: "selection-borealis-001",
  companyId: "borealis",
  ticker: "BRLS",
  companyName: "Borealis Test Company",

  decision: "long",
  selectedAt: "2026-08-01",
  entryPrice: 100,

  todayScore: 76,
  qualityScore: 82,
  valueScore: 74,
  momentumScore: 72,

  themeId: "industrial-recovery",
  themeName: "Industrial Recovery",
  themeScore: 79,
  themeConfidence: 81,

  benchmarkId: "sp-500",
  benchmarkName: "S&P 500",
  benchmarkEntryPrice: 5000,

  thesis:
    "Strong company quality and an improving industrial theme were expected to support benchmark outperformance.",

  risks: [
    "Customer demand may recover more slowly than expected.",
    "Company margins may weaken.",
    "A small number of customers represent a large share of revenue.",
  ],
};

const oneMonthOutcome = measureOutcome({
  selection: borealisSelection,
  horizon: "one-month",
  measurementDate: "2026-09-01",
  companyPrice: 102,
  benchmarkPrice: 5100,
});

const threeMonthOutcome = measureOutcome({
  selection: borealisSelection,
  horizon: "three-month",
  measurementDate: "2026-11-01",
  companyPrice: 100,
  benchmarkPrice: 5250,
});

const sixMonthOutcome = measureOutcome({
  selection: borealisSelection,
  horizon: "six-month",
  measurementDate: "2027-02-01",
  companyPrice: 92,
  benchmarkPrice: 5400,
});

const twelveMonthOutcome = measureOutcome({
  selection: borealisSelection,
  horizon: "twelve-month",
  measurementDate: "2027-08-01",
  companyPrice: 85,
  benchmarkPrice: 5600,
});

const review = buildOutcomeReview({
  selection: borealisSelection,
  outcome: twelveMonthOutcome,
  reviewedAt: "2027-08-02",

  correctDrivers: [
    "The broader industrial recovery developed as expected.",
  ],

  failureReasons: [
    "Company revenue failed to benefit fully from improving industry demand.",
    "Operating margins deteriorated because costs rose faster than selling prices.",
    "Customer concentration risk was underestimated in the original thesis.",
  ],

  unexpectedEvents: [
    "A major customer cancelled an important contract.",
    "A production disruption delayed deliveries during a critical quarter.",
  ],

  lessons: [
    "A supportive macro theme cannot compensate for severe company-specific execution problems.",
    "Customer concentration and margin resilience require greater weight in future TodayScore evaluations.",
  ],
});

export const sampleFailedOutcomeRecord:
  SelectionOutcomeRecord = {
    selection: borealisSelection,

    outcomes: [
      oneMonthOutcome,
      threeMonthOutcome,
      sixMonthOutcome,
      twelveMonthOutcome,
    ],

    review,
  };