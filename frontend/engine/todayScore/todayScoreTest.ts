import { qualityTestResults } from "./qualityTest";
import { valueTestResults } from "./valueTest";
import { momentumTestResults } from "./momentumTest";

import {
  calculateTodayScore,
  type TodayScoreResult,
} from "./todayScore";

import {
  classifyTodayScore,
  type TodayScoreClassification,
} from "./scoreBands";

import {
  explainTodayScore,
  type TodayScoreExplanation,
} from "./todayScoreExplanation";
import type {
  MomentumScore,
  QualityScore,
  ValueScore,
} from "./types";

export interface TodayScoreTestBreakdown {
  quality: QualityScore;
  value: ValueScore;
  momentum: MomentumScore;
}

export interface TodayScoreTestResult {
  companyId: string;
  todayScore: TodayScoreResult;
  breakdown: TodayScoreTestBreakdown;
  classification: TodayScoreClassification;
  explanation: TodayScoreExplanation;
}

export const todayScoreTestResults: TodayScoreTestResult[] =
  qualityTestResults.map(({ companyId, quality }) => {
    const valueResult = valueTestResults.find(
      (result) => result.companyId === companyId,
    );

    const momentumResult = momentumTestResults.find(
      (result) => result.companyId === companyId,
    );

    if (!valueResult || !momentumResult) {
      throw new Error(
        `Missing TodayScore test data for company: ${companyId}`,
      );
    }

    const todayScore = calculateTodayScore({
      quality,
      value: valueResult.value,
      momentum: momentumResult.momentum,
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
        value: valueResult.value,
        momentum: momentumResult.momentum,
      },
      classification,
      explanation,
    };
  });
