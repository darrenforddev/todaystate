import {
  buildQualityScore,
  type QualityUniverseData,
} from "./qualityBuilder";

import {
  buildValueScore,
  type ValueUniverseData,
} from "./valueBuilder";

import {
  buildMomentumScore,
  type MomentumUniverseData,
} from "./momentumBuilder";

import { calculateTodayScore } from "./todayScore";
import { classifyTodayScore } from "./scoreBands";
import { explainTodayScore } from "./todayScoreExplanation";
import type { TodayScoreTestResult } from "./todayScoreTest";

/**
 * SYNTHETIC DEMONSTRATION DATA
 *
 * These profiles are designed only to test the TodayScore interface,
 * ranking engine, filters and classifications.
 *
 * They are not calculated from live company financial data.
 */
const demoProfiles = [
  { companyId: "astrazeneca", quality: 84, value: 42, momentum: 62 },
  { companyId: "bae-systems", quality: 79, value: 45, momentum: 91 },
  { companyId: "hsbc", quality: 61, value: 82, momentum: 66 },
  { companyId: "national-grid", quality: 72, value: 49, momentum: 58 },
  { companyId: "next", quality: 83, value: 64, momentum: 72 },
  { companyId: "relx", quality: 92, value: 31, momentum: 78 },
  { companyId: "rio-tinto", quality: 57, value: 88, momentum: 43 },
  { companyId: "shell", quality: 67, value: 86, momentum: 55 },
  { companyId: "tesco", quality: 75, value: 69, momentum: 74 },
  { companyId: "unilever", quality: 86, value: 47, momentum: 60 },
];

const round = (value: number) =>
  Math.round(value * 100) / 100;

const qualityRows = (
  calculateValue: (quality: number) => number,
) =>
  demoProfiles.map(({ companyId, quality }) => ({
    companyId,
    value: round(calculateValue(quality)),
  }));

const valueRows = (
  calculateValue: (value: number) => number,
) =>
  demoProfiles.map(({ companyId, value }) => ({
    companyId,
    value: round(calculateValue(value)),
  }));

const momentumRows = (
  calculateValue: (momentum: number) => number,
) =>
  demoProfiles.map(({ companyId, momentum }) => ({
    companyId,
    value: round(calculateValue(momentum)),
  }));

const qualityDemoUniverse: QualityUniverseData = {
  "return-on-invested-capital": qualityRows(
    (quality) => -2 + quality * 0.3,
  ),

  "return-on-equity": qualityRows(
    (quality) => quality * 0.32,
  ),

  "operating-margin": qualityRows(
    (quality) => -3 + quality * 0.28,
  ),

  "net-profit-margin": qualityRows(
    (quality) => -5 + quality * 0.25,
  ),

  "net-debt-to-ebitda": qualityRows(
    (quality) => 5.8 - quality * 0.06,
  ),

  "interest-coverage": qualityRows(
    (quality) => -1 + quality * 0.16,
  ),

  "current-ratio": qualityRows(
    (quality) => 0.5 + quality * 0.017,
  ),

  "altman-z-score": qualityRows(
    (quality) => 0.3 + quality * 0.045,
  ),

  "free-cash-flow-margin": qualityRows(
    (quality) => -8 + quality * 0.3,
  ),

  "cash-conversion": qualityRows(
    (quality) => 0.2 + quality * 0.011,
  ),

  "accrual-ratio": qualityRows(
    (quality) => 0.25 - quality * 0.0033,
  ),

  "earnings-volatility": qualityRows(
    (quality) => 46 - quality * 0.45,
  ),

  "revenue-growth-consistency": qualityRows(
    (quality) => 15 + quality * 0.8,
  ),

  "earnings-growth-consistency": qualityRows(
    (quality) => 8 + quality * 0.85,
  ),

  "share-dilution": qualityRows(
    (quality) => 14 - quality * 0.18,
  ),
};

const valueDemoUniverse: ValueUniverseData = {
  "price-to-earnings": valueRows(
    (value) => 32 - value * 0.25,
  ),

  "forward-price-to-earnings": valueRows(
    (value) => 29 - value * 0.23,
  ),

  "price-to-sales": valueRows(
    (value) => 5 - value * 0.043,
  ),

  "price-to-book": valueRows(
    (value) => 4.8 - value * 0.04,
  ),

  "enterprise-value-to-ebitda": valueRows(
    (value) => 18 - value * 0.13,
  ),

  "price-to-free-cash-flow": valueRows(
    (value) => 30 - value * 0.24,
  ),

  "enterprise-value-to-free-cash-flow": valueRows(
    (value) => 34 - value * 0.27,
  ),

  "free-cash-flow-yield": valueRows(
    (value) => 2 + value * 0.1,
  ),

  "shareholder-yield": valueRows(
    (value) => -1 + value * 0.08,
  ),

  "pe-versus-five-year-average": valueRows(
    (value) => 1.45 - value * 0.0075,
  ),

  "ev-ebitda-versus-five-year-average": valueRows(
    (value) => 1.4 - value * 0.007,
  ),

  "price-to-sales-versus-five-year-average": valueRows(
    (value) => 1.5 - value * 0.008,
  ),

  "free-cash-flow-yield-versus-five-year-average":
    valueRows(
      (value) => 0.6 + value * 0.009,
    ),
};

const momentumDemoUniverse: MomentumUniverseData = {
  "one-month-price-return": momentumRows(
    (momentum) => -10 + momentum * 0.2,
  ),

  "three-month-price-return": momentumRows(
    (momentum) => -18 + momentum * 0.42,
  ),

  "six-month-price-return": momentumRows(
    (momentum) => -25 + momentum * 0.7,
  ),

  "twelve-month-price-return": momentumRows(
    (momentum) => -35 + momentum * 1.05,
  ),

  "relative-strength": momentumRows(
    (momentum) => 0.65 + momentum * 0.008,
  ),

  "earnings-estimate-revisions-three-month":
    momentumRows(
      (momentum) => -15 + momentum * 0.27,
    ),

  "earnings-estimate-revisions-six-month":
    momentumRows(
      (momentum) => -22 + momentum * 0.42,
    ),

  "earnings-surprise": momentumRows(
    (momentum) => -12 + momentum * 0.22,
  ),

  "revenue-surprise": momentumRows(
    (momentum) => -8 + momentum * 0.14,
  ),

  "forward-eps-growth": momentumRows(
    (momentum) => -5 + momentum * 0.3,
  ),

  "price-versus-50-day-moving-average": momentumRows(
    (momentum) => -18 + momentum * 0.33,
  ),

  "price-versus-200-day-moving-average": momentumRows(
    (momentum) => -30 + momentum * 0.6,
  ),

  "fifty-day-versus-200-day-moving-average":
    momentumRows(
      (momentum) => -15 + momentum * 0.28,
    ),

  "distance-from-52-week-high": momentumRows(
    (momentum) => -55 + momentum * 0.55,
  ),
};

export const realCompanyDemoResults: TodayScoreTestResult[] =
  demoProfiles.map(({ companyId }) => {
    const quality = buildQualityScore(
      companyId,
      qualityDemoUniverse,
    );

    const value = buildValueScore(
      companyId,
      valueDemoUniverse,
    );

    const momentum = buildMomentumScore(
      companyId,
      momentumDemoUniverse,
    );

    const todayScore = calculateTodayScore({
      quality,
      value,
      momentum,
    });

    const classification = classifyTodayScore(todayScore);

    const explanation = explainTodayScore(
      todayScore,
      classification,
    );

    return {
      companyId,
      todayScore,
      breakdown: {
        quality,
        value,
        momentum,
      },
      classification,
      explanation,
    };
  });