import type { ConfidenceEvidence } from
  "../confidence/confidenceEvidence";

import type {
  ForecastDirection,
  HistoricalOutcome,
} from "./historicalOutcome";

function addMonths(
  dateText: string,
  months: number,
): string {
  const date = new Date(`${dateText}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error(
      `Invalid forecast date "${dateText}".`,
    );
  }

  const originalDay = date.getUTCDate();

  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);

  const lastDayOfTargetMonth = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      0,
    ),
  ).getUTCDate();

  date.setUTCDate(
    Math.min(originalDay, lastDayOfTargetMonth),
  );

  return date.toISOString().slice(0, 10);
}

function signalToForecastDirection(
  evidence: ConfidenceEvidence,
): ForecastDirection {
  if (evidence.signal === "supportive") {
    return "positive";
  }

  if (evidence.signal === "contradictory") {
    return "negative";
  }

  return "neutral";
}

function buildForecastReason(
  evidence: ConfidenceEvidence,
  predictedDirection: ForecastDirection,
  horizonMonths: number,
): string {
  if (evidence.explanation) {
    return evidence.explanation;
  }

  return (
    `${evidence.name} is generating a ` +
    `${predictedDirection} ${horizonMonths}-month forecast ` +
    `based on its current signal and direction.`
  );
}

export function createForecastFromEvidence(
  evidence: ConfidenceEvidence,
  forecastDate: string,
  horizonMonths = 6,
): HistoricalOutcome {
  if (!evidence.id) {
    throw new Error(
      "Cannot create a forecast without an indicator ID.",
    );
  }

  if (!evidence.name) {
    throw new Error(
      `Cannot create forecast "${evidence.id}" without an indicator name.`,
    );
  }

  if (evidence.current === undefined) {
    throw new Error(
      `Cannot create forecast "${evidence.id}" without a current value.`,
    );
  }

  if (
    !Number.isInteger(horizonMonths) ||
    horizonMonths <= 0
  ) {
    throw new Error(
      "Forecast horizon must be a positive whole number.",
    );
  }

  const predictedDirection =
    signalToForecastDirection(evidence);

  const evaluationDate = addMonths(
    forecastDate,
    horizonMonths,
  );

  return {
    id:
      `${evidence.id}-${forecastDate}-` +
      `${horizonMonths}m`,

    indicatorId: evidence.id,
    indicatorName: evidence.name,

    forecastDate,
    evaluationDate,
    horizonMonths,

    predictedDirection,
    startingValue: evidence.current,

    status: "pending",
    evaluated: false,

    forecastReason: buildForecastReason(
      evidence,
      predictedDirection,
      horizonMonths,
    ),
  };
}

export function createMissingForecasts(
  evidenceRecords: ConfidenceEvidence[],
  existingOutcomes: HistoricalOutcome[],
  forecastDate: string,
  horizonMonths = 6,
): HistoricalOutcome[] {
  return evidenceRecords
    .map((evidence) =>
      createForecastFromEvidence(
        evidence,
        forecastDate,
        horizonMonths,
      ),
    )
    .filter(
      (forecast) =>
        !existingOutcomes.some(
          (outcome) => outcome.id === forecast.id,
        ),
    );
}