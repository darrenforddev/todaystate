import { measureOutcome } from "./outcomeEngine";
import { buildOutcomeReview } from "./outcomeReviewEngine";

import type {
  SelectionOutcomeRecord,
  SelectionSnapshot,
} from "./types";

const cinderSelection: SelectionSnapshot = {
  selectionId: "selection-cinder-001",
  companyId: "cinder",
  ticker: "CNDR",
  companyName: "Cinder Test Company",

  decision: "short",
  selectedAt: "2026-08-01",
  entryPrice: 100,

  todayScore: 34,
  qualityScore: 38,
  valueScore: 46,
  momentumScore: 18,

  themeId: "construction-slowdown",
  themeName: "Construction Slowdown",
  themeScore: 82,
  themeConfidence: 86,

  benchmarkId: "sp-500",
  benchmarkName: "S&P 500",
  benchmarkEntryPrice: 5000,

  thesis:
    "Weak company quality, deteriorating momentum and slowing construction demand were expected to cause the shares to underperform the benchmark.",

  risks: [
    "Construction demand may recover sooner than expected.",
    "Interest-rate cuts could improve market sentiment.",
    "The company may announce a restructuring or takeover approach.",
  ],
};

const oneMonthOutcome = measureOutcome({
  selection: cinderSelection,
  horizon: "one-month",
  measurementDate: "2026-09-01",
  companyReviewPrice: 97,
  benchmarkReviewPrice: 5050,
});

const threeMonthOutcome = measureOutcome({
  selection: cinderSelection,
  horizon: "three-month",
  measurementDate: "2026-11-01",
  companyReviewPrice:90,
  benchmarkReviewPrice: 5100,
});

const sixMonthOutcome = measureOutcome({
  selection: cinderSelection,
  horizon: "six-month",
  measurementDate: "2027-02-01",
  companyReviewPrice: 81,
  benchmarkReviewPrice: 5200,
});

const twelveMonthOutcome = measureOutcome({
  selection: cinderSelection,
  horizon: "twelve-month",
  measurementDate: "2027-08-01",
  companyReviewPrice: 70,
  benchmarkReviewPrice: 5300,
});

const review = buildOutcomeReview({
  selection: cinderSelection,
  outcome: twelveMonthOutcome,
  reviewedAt: "2027-08-02",

  correctDrivers: [
    "Construction activity weakened as expected.",
    "The company continued to lose orders and market share.",
    "Negative earnings revisions sustained the downward price momentum.",
  ],

  failureReasons: [],

  unexpectedEvents: [
    "Management attempted a restructuring, but it did not restore investor confidence.",
  ],

  lessons: [
    "Weak company fundamentals combined with a deteriorating industry theme can identify strong short candidates.",
    "Negative earnings revisions and weak momentum were useful confirmation signals.",
    "Short positions still require strict risk controls because takeover activity or policy changes can reverse the trade quickly.",
  ],
});

export const sampleShortOutcomeRecord:
  SelectionOutcomeRecord = {
  selection: cinderSelection,

  outcomes: [
    oneMonthOutcome,
    threeMonthOutcome,
    sixMonthOutcome,
    twelveMonthOutcome,
  ],

  review,
};