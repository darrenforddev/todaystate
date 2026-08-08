import type { ConfidenceEvidence } from
  "../confidence/confidenceEvidence";

import { createMissingForecasts } from
  "./forecastGenerator";

import type { HistoricalOutcome } from
  "./historicalOutcome";

export const historicalOutcomes: HistoricalOutcome[] = [
  {
    id: "manufacturing-pmi-2026-08-01-6m",

    indicatorId: "manufacturing-pmi",
    indicatorName: "ISM Manufacturing PMI",

    forecastDate: "2026-08-01",
    evaluationDate: "2027-02-01",
    horizonMonths: 6,

    predictedDirection: "positive",
    startingValue: 55.6,

    status: "pending",
    evaluated: false,

    forecastReason:
      "Manufacturing remains in expansion and is providing a supportive six-month economic signal.",
  },
];

export function getAllOutcomes(): HistoricalOutcome[] {
  return [...historicalOutcomes];
}

export function getOutcomeById(
  id: string,
): HistoricalOutcome | undefined {
  return historicalOutcomes.find(
    (outcome) => outcome.id === id,
  );
}

export function getOutcomesByIndicator(
  indicatorId: string,
): HistoricalOutcome[] {
  return historicalOutcomes.filter(
    (outcome) => outcome.indicatorId === indicatorId,
  );
}

export function getPendingForecasts(): HistoricalOutcome[] {
  return historicalOutcomes.filter(
    (outcome) =>
      !outcome.evaluated &&
      outcome.status === "pending",
  );
}

export function getCompletedOutcomes(): HistoricalOutcome[] {
  return historicalOutcomes.filter(
    (outcome) =>
      outcome.evaluated &&
      outcome.status !== "pending",
  );
}

export function addHistoricalOutcome(
  outcome: HistoricalOutcome,
): HistoricalOutcome[] {
  const duplicate = historicalOutcomes.some(
    (existingOutcome) =>
      existingOutcome.id === outcome.id,
  );

  if (duplicate) {
    throw new Error(
      `Historical outcome "${outcome.id}" already exists.`,
    );
  }

  historicalOutcomes.push(outcome);

  return getAllOutcomes();
}

export function addMissingForecasts(
  evidenceRecords: ConfidenceEvidence[],
  forecastDate: string,
  horizonMonths = 6,
): HistoricalOutcome[] {
  const newForecasts = createMissingForecasts(
    evidenceRecords,
    historicalOutcomes,
    forecastDate,
    horizonMonths,
  );

  historicalOutcomes.push(...newForecasts);

  return newForecasts;
}

export function updateHistoricalOutcome(
  updatedOutcome: HistoricalOutcome,
): HistoricalOutcome {
  const outcomeIndex = historicalOutcomes.findIndex(
    (outcome) => outcome.id === updatedOutcome.id,
  );

  if (outcomeIndex === -1) {
    throw new Error(
      `Historical outcome "${updatedOutcome.id}" was not found.`,
    );
  }

  historicalOutcomes[outcomeIndex] = updatedOutcome;

  return updatedOutcome;
}