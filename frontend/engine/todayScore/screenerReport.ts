import { momentumFactorDefinitions } from "./momentumFactors";
import { qualityFactorDefinitions } from "./qualityFactors";
import type { ScreenerCompany } from "./screener";
import type { FactorScore } from "./types";
import { valueFactorDefinitions } from "./valueFactors";

export interface FactorCoverage {
  available: number;
  expected: number;
  percentage: number;
  missingFactorIds: string[];
}

export interface ScreenerCompanyReport {
  company: ScreenerCompany;
  coverage: {
    quality: FactorCoverage;
    value: FactorCoverage;
    momentum: FactorCoverage;
    overall: FactorCoverage;
  };
  dataWarnings: string[];
}

function calculateCoverage(
  factors: FactorScore[],
  expectedFactorIds: string[],
): FactorCoverage {
  const availableIds = new Set(factors.map((factor) => factor.id));
  const missingFactorIds = expectedFactorIds.filter(
    (factorId) => !availableIds.has(factorId),
  );
  const available = expectedFactorIds.length - missingFactorIds.length;

  return {
    available,
    expected: expectedFactorIds.length,
    percentage:
      expectedFactorIds.length === 0
        ? 100
        : Math.round((available / expectedFactorIds.length) * 100),
    missingFactorIds,
  };
}

export function findScreenerCompanyByTicker(
  companies: ScreenerCompany[],
  ticker: string,
): ScreenerCompany | undefined {
  return companies.find(
    (company) => company.ticker.toLowerCase() === ticker.toLowerCase(),
  );
}

export function buildScreenerCompanyReport(
  company: ScreenerCompany,
): ScreenerCompanyReport {
  const { breakdown } = company.result;
  const quality = calculateCoverage(
    breakdown.quality.factors,
    qualityFactorDefinitions.map((factor) => factor.id),
  );
  const value = calculateCoverage(
    breakdown.value.factors,
    valueFactorDefinitions.map((factor) => factor.id),
  );
  const momentum = calculateCoverage(
    breakdown.momentum.factors,
    momentumFactorDefinitions.map((factor) => factor.id),
  );
  const overallExpected = quality.expected + value.expected + momentum.expected;
  const overallAvailable =
    quality.available + value.available + momentum.available;
  const overall: FactorCoverage = {
    available: overallAvailable,
    expected: overallExpected,
    percentage: Math.round((overallAvailable / overallExpected) * 100),
    missingFactorIds: [
      ...quality.missingFactorIds,
      ...value.missingFactorIds,
      ...momentum.missingFactorIds,
    ],
  };
  const dataWarnings: string[] = [];

  if (overall.missingFactorIds.length > 0) {
    dataWarnings.push(
      `${overall.missingFactorIds.length} expected factors are missing, so this report requires additional data-quality review.`,
    );
  }

  if (
    company.result.todayScore.score === 0 &&
    overall.percentage === 100
  ) {
    dataWarnings.push(
      "The zero score reflects bottom-of-universe percentile rankings across the development cohort; it is not caused by missing data.",
    );
  }

  return {
    company,
    coverage: { quality, value, momentum, overall },
    dataWarnings,
  };
}
