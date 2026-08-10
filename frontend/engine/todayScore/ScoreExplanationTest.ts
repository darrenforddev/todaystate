import type { TodayScoreResult } from "./todayScore";

import {
  classifyTodayScore,
  type TodayScoreClassification,
} from "./scoreBands";

import {
  explainTodayScore,
  type TodayScoreExplanation,
} from "./todayScoreExplanation";

export interface TodayScoreExplanationTestResult {
  companyId: string;
  todayScore: TodayScoreResult;
  classification: TodayScoreClassification;
  explanation: TodayScoreExplanation;
  passed: boolean;
}

const safeguardTestScore: TodayScoreResult = {
  score: 73,
  quality: 100,
  value: 100,
  momentum: 10,
  weights: {
    quality: 0.4,
    value: 0.3,
    momentum: 0.3,
  },
};

const classification = classifyTodayScore(
  safeguardTestScore,
);

const explanation = explainTodayScore(
  safeguardTestScore,
  classification,
);

const passed =
  classification.originalBand === "Strong" &&
  classification.band === "Weak" &&
  classification.safeguardApplied &&
  explanation.warnings.length === 1 &&
  explanation.weaknesses.some((weakness) =>
    weakness.includes("Momentum is critically weak"),
  );

if (!passed) {
  throw new Error(
    "TodayScore safeguard explanation test failed.",
  );
}

export const todayScoreExplanationTest:
  TodayScoreExplanationTestResult = {
    companyId: "safeguard-test",
    todayScore: safeguardTestScore,
    classification,
    explanation,
    passed,
  };