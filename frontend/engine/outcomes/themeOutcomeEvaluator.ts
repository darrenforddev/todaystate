import {
  calculateRelativeReturn,
  calculateReturn,
  evaluateOutcomeStatus,
} from "./outcomeEngine";

import type {
  OutcomeHorizon,
  OutcomeStatus,
  SelectionDecision,
} from "./types";

import type {
  ThemeHorizonOutcome,
  ThemeSignalDirection,
  ThemeSignalSnapshot,
} from "./themeOutcomeBuilder";

/**
 * Relative performance inside this range is
 * treated as market noise rather than a decisive result.
 */
export const DEFAULT_THEME_MATERIALITY_THRESHOLD = 1;

function themeDirectionToDecision(
  direction: ThemeSignalDirection,
): SelectionDecision {
  if (direction === "positive") {
    return "long";
  }

  if (direction === "negative") {
    return "short";
  }

  return "watch";
}

export function evaluateThemeOutcomeStatus(
  direction: ThemeSignalDirection,
  relativeReturn: number,
  materialityThreshold =
    DEFAULT_THEME_MATERIALITY_THRESHOLD,
): OutcomeStatus {
  if (
    !Number.isFinite(
      materialityThreshold,
    ) ||
    materialityThreshold < 0
  ) {
    throw new Error(
      "The materiality threshold must be zero or greater.",
    );
  }

  /**
   * Neutral theme signals do not make a directional
   * outperformance or underperformance forecast.
   */
  if (direction === "neutral") {
    return "inconclusive";
  }

  /**
   * Small relative movements are not sufficiently
   * meaningful to judge the signal as right or wrong.
   */
  if (
    Math.abs(relativeReturn) <=
    materialityThreshold
  ) {
    return "inconclusive";
  }

  const decision =
    themeDirectionToDecision(
      direction,
    );

  return evaluateOutcomeStatus(
    decision,
    relativeReturn,
  );
}

export interface MeasureThemeOutcomeInputs {
  signal: ThemeSignalSnapshot;
  horizon: OutcomeHorizon;

  measurementDate: string;
  reviewedAt?: string;

  instrumentReviewPrice?: number;
  benchmarkReviewPrice?: number;

  /**
   * Minimum absolute relative return required
   * for a decisive successful/unsuccessful result.
   */
  materialityThreshold?: number;
}

export function measureThemeOutcome({
  signal,
  horizon,
  measurementDate,
  reviewedAt,
  instrumentReviewPrice,
  benchmarkReviewPrice,
  materialityThreshold =
    DEFAULT_THEME_MATERIALITY_THRESHOLD,
}: MeasureThemeOutcomeInputs): ThemeHorizonOutcome {
  if (
    instrumentReviewPrice === undefined ||
    benchmarkReviewPrice === undefined
  ) {
    return {
      horizon,
      measurementDate,
      status: "pending",
    };
  }

  const instrumentReturn =
    calculateReturn(
      signal.instrumentEntryPrice,
      instrumentReviewPrice,
    );

  const benchmarkReturn =
    calculateReturn(
      signal.benchmarkEntryPrice,
      benchmarkReviewPrice,
    );

  const relativeReturn =
    calculateRelativeReturn(
      instrumentReturn,
      benchmarkReturn,
    );

  const status =
    evaluateThemeOutcomeStatus(
      signal.direction,
      relativeReturn,
      materialityThreshold,
    );

  return {
    horizon,
    measurementDate,

    reviewedAt:
      reviewedAt ?? measurementDate,

    instrumentReviewPrice,
    benchmarkReviewPrice,

    instrumentReturn,
    benchmarkReturn,
    relativeReturn,

    status,
  };
}