import {
  qualityFactorDefinitions,
  type QualityCategory,
} from "./qualityFactors";

import {
  buildPercentileFactorScore,
  type CompanyFactorValue,
} from "./percentile";

import {
  calculateQualityScore,
  type QualityInputs,
} from "./quality";

import type {
  FactorScore,
  QualityScore,
} from "./types";

export type QualityUniverseData = Record<
  string,
  CompanyFactorValue[]
>;

function createEmptyQualityInputs(): QualityInputs {
  return {
    profitability: [],
    financialStrength: [],
    cashFlowQuality: [],
    earningsStability: [],
  };
}

function addFactorToCategory(
  inputs: QualityInputs,
  category: QualityCategory,
  factor: FactorScore,
): void {
  inputs[category].push(factor);
}

export function buildQualityScore(
  companyId: string,
  universeData: QualityUniverseData,
): QualityScore {
  const inputs = createEmptyQualityInputs();

  for (const definition of qualityFactorDefinitions) {
    const values = universeData[definition.id];

    if (!values) {
      continue;
    }

    const factorScore = buildPercentileFactorScore(
      companyId,
      definition,
      values,
    );

    if (!factorScore) {
      continue;
    }

    addFactorToCategory(
      inputs,
      definition.category,
      factorScore,
    );
  }

  return calculateQualityScore(inputs);
}