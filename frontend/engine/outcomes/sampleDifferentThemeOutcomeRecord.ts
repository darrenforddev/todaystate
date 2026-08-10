import { measureOutcome } from "./outcomeEngine";
import { buildOutcomeReview } from "./outcomeReviewEngine";

import type {
  SelectionOutcomeRecord,
  SelectionSnapshot,
} from "./types";

const harbourSelection: SelectionSnapshot = {
  selectionId: "selection-harbour-001",
  companyId: "harbour",
  ticker: "HBR",
  companyName: "Harbour Test Company",

  decision: "long",
  selectedAt: "2026-08-01",
  entryPrice: 100,

  todayScore: 72,
  qualityScore: 79,
  valueScore: 84,
  momentumScore: 53,

  themeId: "energy-supply-tightness",
  themeName: "Energy Supply Tightness",
  themeScore: 76,
  themeConfidence: 78,

  benchmarkId: "sp-500",
  benchmarkName: "S&P 500",
  benchmarkEntryPrice: 5000,

  thesis:
    "Restricted energy supply, resilient demand and an attractive valuation were expected to support benchmark outperformance.",

  risks: [
    "Energy prices may fall as supply increases.",
    "A global economic slowdown may weaken demand.",
    "Higher operating costs may reduce company margins.",
    "Government policy changes may affect profitability.",
  ],
};

const oneMonthOutcome = measureOutcome({
  selection: harbourSelection,
  horizon: "one-month",
  measurementDate: "2026-09-01",
  companyReviewPrice: 101,
  benchmarkReviewPrice: 5050,
});

const threeMonthOutcome = measureOutcome({
  selection: harbourSelection,
  horizon: "three-month",
  measurementDate: "2026-11-01",
  companyReviewPrice: 106,
  benchmarkReviewPrice: 5100,
});

const sixMonthOutcome = measureOutcome({
  selection: harbourSelection,
  horizon: "six-month",
  measurementDate: "2027-02-01",
  companyReviewPrice: 111,
  benchmarkReviewPrice: 5200,
});

const twelveMonthOutcome = measureOutcome({
  selection: harbourSelection,
  horizon: "twelve-month",
  measurementDate: "2027-08-01",
  companyReviewPrice: 120,
  benchmarkReviewPrice: 5300,
});

const review = buildOutcomeReview({
  selection: harbourSelection,
  outcome: twelveMonthOutcome,
  reviewedAt: "2027-08-02",

  correctDrivers: [
    "Energy supply remained constrained for longer than the market expected.",
    "Company cash generation improved as realised energy prices remained strong.",
    "The original valuation provided protection against temporary market weakness.",
  ],

  failureReasons: [],

  unexpectedEvents: [
    "A temporary production outage reduced output during one quarter.",
    "The company increased shareholder distributions earlier than expected.",
  ],

  lessons: [
    "Theme support and attractive valuation can compensate for only moderate price momentum.",
    "Commodity-sensitive selections should be evaluated against both the broad market and a relevant sector benchmark.",
    "Policy, production and commodity-price risks require continuous monitoring.",
  ],
});

export const sampleDifferentThemeOutcomeRecord:
  SelectionOutcomeRecord = {
  selection: harbourSelection,

  outcomes: [
    oneMonthOutcome,
    threeMonthOutcome,
    sixMonthOutcome,
    twelveMonthOutcome,
  ],

  review,
};