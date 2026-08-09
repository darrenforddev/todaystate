export type SelectionDecision =
  | "long"
  | "short"
  | "watch"
  | "avoid";

export type OutcomeHorizon =
  | "one-month"
  | "three-month"
  | "six-month"
  | "twelve-month";

export type OutcomeStatus =
  | "pending"
  | "successful"
  | "unsuccessful"
  | "inconclusive";

export interface SelectionSnapshot {
  selectionId: string;
  companyId: string;
  ticker: string;
  companyName: string;

  decision: SelectionDecision;
  selectedAt: string;
  entryPrice: number;

  todayScore: number;
  qualityScore: number;
  valueScore: number;
  momentumScore: number;

  themeId?: string;
  themeName?: string;
  themeScore?: number;
  themeConfidence?: number;

  benchmarkId: string;
  benchmarkName: string;
  benchmarkEntryPrice: number;

  thesis: string;
  risks: string[];
}

export interface HorizonOutcome {
  horizon: OutcomeHorizon;
  measurementDate: string;

  companyPrice?: number;
  benchmarkPrice?: number;

  companyReturn?: number;
  benchmarkReturn?: number;
  relativeReturn?: number;

  status: OutcomeStatus;
}

export interface OutcomeReview {
  reviewedAt: string;
  expectedOutcome: string;
  actualOutcome: string;

  correctDrivers: string[];
  failureReasons: string[];
  unexpectedEvents: string[];
  lessons: string[];
}

export interface SelectionOutcomeRecord {
  selection: SelectionSnapshot;
  outcomes: HorizonOutcome[];
  review?: OutcomeReview;
}