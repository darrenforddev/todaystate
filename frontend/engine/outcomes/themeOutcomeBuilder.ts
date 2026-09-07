import type {
  OutcomeExplanation,
  OutcomeHorizon,
  OutcomeReview,
  OutcomeStatus,
} from "./types";

import {
  addCalendarMonths,
  HORIZON_DEFINITIONS,
} from "./selectionOutcomeBuilder";

export type ThemeSignalDirection =
  | "positive"
  | "negative"
  | "neutral";

export interface ThemeSignalSnapshot {
  signalId: string;

  themeId: string;
  themeName: string;

  reportPeriod: string;

  /**
   * Date when the complete economic evidence
   * became available and the signal was generated.
   */
  signalDate: string;

  /**
   * Actual trading date used to establish the
   * instrument and benchmark entry prices.
   */
  marketEntryDate: string;

  direction: ThemeSignalDirection;

  conviction: number;
  confidence: number;

  /**
   * Instrument expected to express the theme.
   * Example: XLI for Industrial Recovery.
   */
  instrumentId: string;
  instrumentTicker: string;
  instrumentName: string;
  instrumentEntryPrice: number;

  /**
   * Broad comparison benchmark.
   * Example: SPY or an equivalent broad-market ETF.
   */
  benchmarkId: string;
  benchmarkTicker: string;
  benchmarkName: string;
  benchmarkEntryPrice: number;

  thesis: string;
  risks: string[];

  /**
   * Point-in-time evidence records supporting
   * the signal when it was generated.
   */
  evidenceIds: string[];
}

export interface ThemeHorizonOutcome {
  horizon: OutcomeHorizon;
  measurementDate: string;

  reviewedAt?: string;

  instrumentReviewPrice?: number;
  benchmarkReviewPrice?: number;

  instrumentReturn?: number;
  benchmarkReturn?: number;
  relativeReturn?: number;

  status: OutcomeStatus;

  explanation?: string;
  outcomeExplanation?: OutcomeExplanation;
}

export interface ThemeOutcomeRecord {
  signal: ThemeSignalSnapshot;
  outcomes: ThemeHorizonOutcome[];
  review?: OutcomeReview;
}

export interface ApprovedThemeSignalInput {
  themeId: string;
  themeName: string;

  reportPeriod: string;
  signalDate?: string;

  /**
   * Actual trading date used for entry prices.
   * Defaults to signalDate for compatibility.
   */
  marketEntryDate?: string;

  direction: ThemeSignalDirection;

  conviction: number;
  confidence: number;

  instrumentId: string;
  instrumentTicker: string;
  instrumentName: string;
  instrumentEntryPrice: number;

  benchmarkId: string;
  benchmarkTicker: string;
  benchmarkName: string;
  benchmarkEntryPrice: number;

  /**
   * Optional custom thesis. When omitted,
   * directionally correct wording is generated.
   */
  thesis?: string;

  risks: string[];
  evidenceIds: string[];
}

function toDateOnly(
  date: Date,
): string {
  return date.toISOString().slice(0, 10);
}

function validatePercentageScore(
  value: number,
  label: string,
): void {
  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value > 100
  ) {
    throw new Error(
      `${label} must be between 0 and 100.`,
    );
  }
}

function validatePositivePrice(
  value: number,
  label: string,
): void {
  if (
    !Number.isFinite(value) ||
    value <= 0
  ) {
    throw new Error(
      `${label} must be greater than zero.`,
    );
  }
}

function validateInput(
  input: ApprovedThemeSignalInput,
): void {
  if (!input.themeId.trim()) {
    throw new Error(
      "A theme ID is required.",
    );
  }

  if (!input.themeName.trim()) {
    throw new Error(
      "A theme name is required.",
    );
  }

  if (
    !/^\d{4}-\d{2}$/.test(
      input.reportPeriod,
    )
  ) {
    throw new Error(
      "The report period must use YYYY-MM format.",
    );
  }

  if (!input.instrumentId.trim()) {
    throw new Error(
      "An instrument ID is required.",
    );
  }

  if (!input.instrumentTicker.trim()) {
    throw new Error(
      "An instrument ticker is required.",
    );
  }

  if (!input.instrumentName.trim()) {
    throw new Error(
      "An instrument name is required.",
    );
  }

  if (!input.benchmarkId.trim()) {
    throw new Error(
      "A benchmark ID is required.",
    );
  }

  if (!input.benchmarkTicker.trim()) {
    throw new Error(
      "A benchmark ticker is required.",
    );
  }

  if (!input.benchmarkName.trim()) {
    throw new Error(
      "A benchmark name is required.",
    );
  }

  if (
    input.thesis !== undefined &&
    !input.thesis.trim()
  ) {
    throw new Error(
      "A custom theme thesis cannot be empty.",
    );
  }

  validatePercentageScore(
    input.conviction,
    "Theme conviction",
  );

  validatePercentageScore(
    input.confidence,
    "Theme confidence",
  );

  validatePositivePrice(
    input.instrumentEntryPrice,
    "Instrument entry price",
  );

  validatePositivePrice(
    input.benchmarkEntryPrice,
    "Benchmark entry price",
  );
}

function createSignalId(
  input: ApprovedThemeSignalInput,
): string {
  const themeSlug =
    input.themeId
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const instrumentSlug =
    input.instrumentTicker
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  return [
    themeSlug || "theme",
    input.reportPeriod,
    instrumentSlug || "instrument",
  ].join("-");
}

function buildDefaultThesis(
  input: ApprovedThemeSignalInput,
): string {
  const instrumentTicker =
    input.instrumentTicker
      .trim()
      .toUpperCase();

  const benchmarkTicker =
    input.benchmarkTicker
      .trim()
      .toUpperCase();

  if (input.direction === "positive") {
    return (
      `The positive ${input.themeName.trim()} signal expected ` +
      `${instrumentTicker} to outperform ${benchmarkTicker}.`
    );
  }

  if (input.direction === "negative") {
    return (
      `The negative ${input.themeName.trim()} signal expected ` +
      `${instrumentTicker} to underperform ${benchmarkTicker}.`
    );
  }

  return (
    `The neutral ${input.themeName.trim()} signal expected ` +
    `${instrumentTicker} to perform broadly in line with ` +
    `${benchmarkTicker}.`
  );
}

export function buildThemeOutcomeRecord(
  input: ApprovedThemeSignalInput,
): ThemeOutcomeRecord {
  validateInput(input);

  const signalDate =
    input.signalDate ??
    toDateOnly(new Date());

  const marketEntryDate =
    input.marketEntryDate ??
    signalDate;

  /**
   * Reuse the existing date validator through
   * the shared calendar-month function.
   */
  addCalendarMonths(signalDate, 0);
  addCalendarMonths(marketEntryDate, 0);

  if (marketEntryDate < signalDate) {
    throw new Error(
      "The market entry date cannot be earlier than the signal date.",
    );
  }

  const signalId =
  createSignalId(input);

  const thesis =
    input.thesis?.trim() ??
    buildDefaultThesis(input);

  return {
    signal: {
      signalId,

      themeId: input.themeId.trim(),
      themeName: input.themeName.trim(),

      reportPeriod:
        input.reportPeriod,

      signalDate,
      marketEntryDate,
      direction: input.direction,

      conviction: input.conviction,
      confidence: input.confidence,

      instrumentId:
        input.instrumentId.trim(),

      instrumentTicker:
        input.instrumentTicker
          .trim()
          .toUpperCase(),

      instrumentName:
        input.instrumentName.trim(),

      instrumentEntryPrice:
        input.instrumentEntryPrice,

      benchmarkId:
        input.benchmarkId.trim(),

      benchmarkTicker:
        input.benchmarkTicker
          .trim()
          .toUpperCase(),

      benchmarkName:
        input.benchmarkName.trim(),

      benchmarkEntryPrice:
        input.benchmarkEntryPrice,

      thesis,

      risks: input.risks
        .map((risk) => risk.trim())
        .filter(Boolean),

      evidenceIds:
        input.evidenceIds
          .map((id) => id.trim())
          .filter(Boolean),
    },

    outcomes:
      HORIZON_DEFINITIONS.map(
        ({ horizon, months }) => ({
          horizon,
          measurementDate:
            addCalendarMonths(
              marketEntryDate,
              months,
            ),
          status: "pending",
        }),
      ),
  };
}