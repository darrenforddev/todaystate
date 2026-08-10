import type { FactorScore } from "./types";
import type { FactorDirection } from "./qualityFactors";

export interface CompanyFactorValue {
  companyId: string;
  value: number;
}

export interface PercentileFactorDefinition {
  id: string;
  name: string;
  direction: FactorDirection;
  description: string;
}

function clampScore(score: number): number {
  return Math.max(
    0,
    Math.min(100, Math.round(score)),
  );
}

export function calculatePercentileScore(
  companyId: string,
  values: CompanyFactorValue[],
  direction: FactorDirection,
): number | null {
  const validValues = values.filter(
    (item) => Number.isFinite(item.value),
  );

  const companyValue = validValues.find(
    (item) => item.companyId === companyId,
  );

  if (!companyValue || validValues.length < 2) {
    return null;
  }

  const otherValues = validValues.filter(
    (item) => item.companyId !== companyId,
  );

  const belowCount = otherValues.filter(
    (item) => item.value < companyValue.value,
  ).length;

  const equalCount = otherValues.filter(
    (item) => item.value === companyValue.value,
  ).length;

  const percentile =
    (
      belowCount +
      equalCount * 0.5
    ) /
    otherValues.length *
    100;

  const directedPercentile =
    direction === "higherIsBetter"
      ? percentile
      : 100 - percentile;

  return clampScore(directedPercentile);
}

export function buildPercentileFactorScore(
  companyId: string,
  definition: PercentileFactorDefinition,
  values: CompanyFactorValue[],
): FactorScore | null {
  const companyValue = values.find(
    (item) => item.companyId === companyId,
  );

  if (
    !companyValue ||
    !Number.isFinite(companyValue.value)
  ) {
    return null;
  }

  const percentile = calculatePercentileScore(
    companyId,
    values,
    definition.direction,
  );

  if (percentile === null) {
    return null;
  }

  return {
    id: definition.id,
    name: definition.name,
    score: percentile,
    rawValue: companyValue.value,
    percentile,
    explanation: definition.description,
  };
}