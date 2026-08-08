import "server-only";

import { sql } from "@/lib/db";

import type {
  ForecastDirection,
  HistoricalOutcome,
  OutcomeDirection,
  OutcomeStatus,
} from "./historicalOutcome";

export interface SaveForecastsResult {
  insertedIds: string[];
  insertedCount: number;
}

interface HistoricalOutcomeRow {
  id: string;
  indicator_id: string;
  indicator_name: string;
  forecast_date: string;
  evaluation_date: string;
  horizon_months: number;
  predicted_direction: ForecastDirection;
  starting_value: number | null;
  actual_direction: OutcomeDirection | null;
  ending_value: number | null;
  status: OutcomeStatus;
  actual_change: number | null;
  forecast_reason: string;
  outcome_explanation: string | null;
  failure_reasons: string[] | null;
  evaluated: boolean;
}

function mapOutcomeRow(
  row: HistoricalOutcomeRow,
): HistoricalOutcome {
  return {
    id: row.id,
    indicatorId: row.indicator_id,
    indicatorName: row.indicator_name,
    forecastDate: row.forecast_date,
    evaluationDate: row.evaluation_date,
    horizonMonths: row.horizon_months,
    predictedDirection: row.predicted_direction,

    startingValue: row.starting_value ?? undefined,
    actualDirection: row.actual_direction ?? undefined,
    endingValue: row.ending_value ?? undefined,

    status: row.status,
    actualChange: row.actual_change ?? undefined,

    forecastReason: row.forecast_reason,
    outcomeExplanation:
      row.outcome_explanation ?? undefined,
    failureReasons:
      row.failure_reasons ?? undefined,

    evaluated: row.evaluated,
  };
}

export async function getHistoricalOutcomes():
Promise<HistoricalOutcome[]> {
  const rows = await sql`
    SELECT
      id,
      indicator_id,
      indicator_name,
      forecast_date::text AS forecast_date,
      evaluation_date::text AS evaluation_date,
      horizon_months,
      predicted_direction,
      starting_value::double precision AS starting_value,
      actual_direction,
      ending_value::double precision AS ending_value,
      status,
      actual_change::double precision AS actual_change,
      forecast_reason,
      outcome_explanation,
      failure_reasons,
      evaluated
    FROM historical_outcomes
    ORDER BY forecast_date DESC;
  `;

  return (rows as HistoricalOutcomeRow[]).map(
    mapOutcomeRow,
  );
}

export async function getHistoricalOutcomesByIndicator(
  indicatorId: string,
): Promise<HistoricalOutcome[]> {
  const outcomes = await getHistoricalOutcomes();

  return outcomes.filter(
    (outcome) =>
      outcome.indicatorId === indicatorId,
  );
}

function validatePendingForecast(
  outcome: HistoricalOutcome,
): void {
  if (
    outcome.status !== "pending" ||
    outcome.evaluated
  ) {
    throw new Error(
      `Outcome "${outcome.id}" is not a pending forecast.`,
    );
  }
}

export async function savePendingForecast(
  outcome: HistoricalOutcome,
): Promise<string | null> {
  validatePendingForecast(outcome);

  const rows = await sql`
    INSERT INTO historical_outcomes (
      id,
      indicator_id,
      indicator_name,
      forecast_date,
      evaluation_date,
      horizon_months,
      predicted_direction,
      starting_value,
      status,
      forecast_reason,
      evaluated
    )
    VALUES (
      ${outcome.id},
      ${outcome.indicatorId},
      ${outcome.indicatorName},
      ${outcome.forecastDate},
      ${outcome.evaluationDate},
      ${outcome.horizonMonths},
      ${outcome.predictedDirection},
      ${outcome.startingValue ?? null},
      ${outcome.status},
      ${outcome.forecastReason},
      ${outcome.evaluated}
    )
    ON CONFLICT (id) DO NOTHING
    RETURNING id;
  `;

  const insertedRow = rows[0] as
    | { id: string }
    | undefined;

  return insertedRow?.id ?? null;
}

export async function savePendingForecasts(
  outcomes: HistoricalOutcome[],
): Promise<SaveForecastsResult> {
  const insertedIds: string[] = [];

  for (const outcome of outcomes) {
    const insertedId =
      await savePendingForecast(outcome);

    if (insertedId) {
      insertedIds.push(insertedId);
    }
  }

  return {
    insertedIds,
    insertedCount: insertedIds.length,
  };
}