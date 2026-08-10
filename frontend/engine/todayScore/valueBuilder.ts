import {
  valueFactorDefinitions,
  type ValueCategory,
} from "./valueFactors";

import {
  buildPercentileFactorScore,
  type CompanyFactorValue,
} from "./percentile";

import {
  calculateValueScore,
  type ValueInputs,
} from "./value";

import type {
  FactorScore,
  ValueScore,
} from "./types";

export type ValueUniverseData = Record<
  string,
  CompanyFactorValue[]
>;

function createEmptyValueInputs(): ValueInputs {
  return {
    relativeValuation: [],
    cashFlowValuation: [],
    historicalValuation: [],
  };
}

function addFactorToCategory(
  inputs: ValueInputs,
  category: ValueCategory,
  factor: FactorScore,
): void {
  inputs[category].push(factor);
}

export function buildValueScore(
  companyId: string,
  universeData: ValueUniverseData,
): ValueScore {
  const inputs = createEmptyValueInputs();

  for (const definition of valueFactorDefinitions) {
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

  return calculateValueScore(inputs);
}