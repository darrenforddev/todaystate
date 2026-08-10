import {
  momentumFactorDefinitions,
  type MomentumCategory,
} from "./momentumFactors";

import {
  buildPercentileFactorScore,
  type CompanyFactorValue,
} from "./percentile";

import {
  calculateMomentumScore,
  type MomentumInputs,
} from "./momentum";

import type {
  FactorScore,
  MomentumScore,
} from "./types";

export type MomentumUniverseData = Record<
  string,
  CompanyFactorValue[]
>;

function createEmptyMomentumInputs(): MomentumInputs {
  return {
    priceMomentum: [],
    earningsMomentum: [],
    trendStrength: [],
  };
}

function addFactorToCategory(
  inputs: MomentumInputs,
  category: MomentumCategory,
  factor: FactorScore,
): void {
  inputs[category].push(factor);
}

export function buildMomentumScore(
  companyId: string,
  universeData: MomentumUniverseData,
): MomentumScore {
  const inputs = createEmptyMomentumInputs();

  for (const definition of momentumFactorDefinitions) {
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

  return calculateMomentumScore(inputs);
}