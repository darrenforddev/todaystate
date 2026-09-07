import {
  getPeriodThemeIntelligence,
} from "../periodThemeIntelligence";

import {
  getThemeSignal,
  type ThemeSignalLabel,
} from "../theme";

import {
  buildThemeOutcomeRecord,
  type ThemeOutcomeRecord,
  type ThemeSignalDirection,
} from "./themeOutcomeBuilder";

import {
  measureThemeOutcome,
} from "./themeOutcomeEvaluator";

import type {
  ThemeMarketHistory,
} from "./themeMarketData";

import {
  pointAtOrAfter,
} from "../todayScore/providers/priceHistory";

export interface ThemeValidationPreview {
  signalLabel: ThemeSignalLabel;

  signalDate: string;
  marketEntryDate: string;

  record: ThemeOutcomeRecord;
}

function signalLabelToDirection(
  signal: ThemeSignalLabel,
): ThemeSignalDirection {
  if (signal.includes("Positive")) {
    return "positive";
  }

  if (signal.includes("Negative")) {
    return "negative";
  }

  return "neutral";
}

export function buildThemeValidationPreview(
  reportPeriod: string,
  marketHistory: ThemeMarketHistory,
): ThemeValidationPreview {
  const intelligence =
    getPeriodThemeIntelligence(
      "industrial-recovery",
      reportPeriod,
    );

  const signalLabel =
    getThemeSignal(
      intelligence.conviction.score,
    );

  const direction =
    signalLabelToDirection(
      signalLabel,
    );

  /**
   * Date when the complete economic evidence
   * for the reporting period was available.
   */
  const signalDate =
    intelligence.asOf.slice(0, 10);

  /**
   * Use the first available trading close on or
   * after the complete signal became available.
   */
  const instrumentEntry =
    pointAtOrAfter(
      marketHistory.instrumentPrices,
      signalDate,
    );

  const benchmarkEntry =
    pointAtOrAfter(
      marketHistory.benchmarkPrices,
      signalDate,
    );

  if (
    !instrumentEntry ||
    !benchmarkEntry
  ) {
    throw new Error(
      `No market entry prices were available for ${reportPeriod} on or after ${signalDate}.`,
    );
  }

  if (
    instrumentEntry.date !==
    benchmarkEntry.date
  ) {
    throw new Error(
      `XLI and SPY do not have a matching entry date for ${reportPeriod}.`,
    );
  }

  const marketEntryDate =
    instrumentEntry.date;

  const initialRecord =
    buildThemeOutcomeRecord({
      themeId:
        intelligence.themeId,

      themeName:
        "Industrial Recovery",

      reportPeriod,
      signalDate,
      marketEntryDate,

      direction,

      conviction:
        intelligence.conviction.score,

      confidence:
        intelligence.confidence
          .confidence,

      instrumentId:
        marketHistory.instrument
          .companyId,

      instrumentTicker:
        marketHistory.instrument
          .ticker,

      instrumentName:
        marketHistory.instrument
          .companyName,

      instrumentEntryPrice:
        instrumentEntry.close,

      benchmarkId:
        marketHistory.benchmark
          .companyId,

      benchmarkTicker:
        marketHistory.benchmark
          .ticker,

      benchmarkName:
        marketHistory.benchmark
          .companyName,

      benchmarkEntryPrice:
        benchmarkEntry.close,

      risks: [
        "Inflation pressure",
        "Weak employment",
        "Unexpected market events",
        "Sector-specific valuation changes",
      ],

      evidenceIds:
        intelligence.evidence.map(
          (item) =>
            item.snapshotId,
        ),
    });

  const outcomes =
    initialRecord.outcomes.map(
      (outcome) => {
        const instrumentReview =
          pointAtOrAfter(
            marketHistory.instrumentPrices,
            outcome.measurementDate,
          );

        const benchmarkReview =
          pointAtOrAfter(
            marketHistory.benchmarkPrices,
            outcome.measurementDate,
          );

        /**
         * A future measurement date has no market
         * price yet and must remain pending.
         */
        if (
          !instrumentReview ||
          !benchmarkReview
        ) {
          return outcome;
        }

        /**
         * Do not compare prices from different
         * trading sessions.
         */
        if (
          instrumentReview.date !==
          benchmarkReview.date
        ) {
          return outcome;
        }

        return measureThemeOutcome({
          signal:
            initialRecord.signal,

          horizon:
            outcome.horizon,

          measurementDate:
            outcome.measurementDate,

          reviewedAt:
            instrumentReview.date,

          instrumentReviewPrice:
            instrumentReview.close,

          benchmarkReviewPrice:
            benchmarkReview.close,
        });
      },
    );

  return {
    signalLabel,
    signalDate,
    marketEntryDate,

    record: {
      ...initialRecord,
      outcomes,
    },
  };
}