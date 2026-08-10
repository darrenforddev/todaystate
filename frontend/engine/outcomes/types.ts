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

export type OutcomeExplanationCause =
  | "theme"
  | "today-score"
  | "company"
  | "macro"
  | "timing"
  | "market"
  | "unexpected-event"
  | "insufficient-evidence";

export type OutcomeExplanationImpact =
  | "supportive"
  | "contradictory"
  | "neutral";

export interface OutcomeExplanationFactor {
  cause: OutcomeExplanationCause;
  impact: OutcomeExplanationImpact;
  title: string;
  explanation: string;
}

export interface OutcomeExplanation {
  summary: string;
  predictionWasCorrect: boolean;
  primaryCause: OutcomeExplanationCause;

  supportingFactors: OutcomeExplanationFactor[];
  contradictoryFactors: OutcomeExplanationFactor[];

  unexpectedEvents: string[];
  lessons: string[];

  confidenceAdjustment: number;
  generatedAt: string;
}

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

  reviewedAt?: string;

  companyReviewPrice?: number;
  benchmarkReviewPrice?: number;

  companyReturn?: number;
  benchmarkReturn?: number;
  relativeReturn?: number;

  status: OutcomeStatus;

  explanation?: string;
  outcomeExplanation?: OutcomeExplanation;
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