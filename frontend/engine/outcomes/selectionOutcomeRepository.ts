import "server-only";

import { sql } from "@/lib/db";

import type {
  HorizonOutcome,
  OutcomeHorizon,
  OutcomeReview,
  OutcomeStatus,
  SelectionDecision,
  SelectionOutcomeRecord,
  SelectionSnapshot,
} from "./types";

interface SelectionSnapshotRow {
  selection_id: string;
  company_id: string;
  ticker: string;
  company_name: string;

  decision: SelectionDecision;
  selected_at: string;
  entry_price: number;

  today_score: number;
  quality_score: number;
  value_score: number;
  momentum_score: number;

  theme_id: string | null;
  theme_name: string | null;
  theme_score: number | null;
  theme_confidence: number | null;

  benchmark_id: string;
  benchmark_name: string;
  benchmark_entry_price: number;

  thesis: string;
  risks: string[];
}

interface HorizonOutcomeRow {
  selection_id: string;
  horizon: OutcomeHorizon;
  measurement_date: string;

  company_price: number | null;
  benchmark_price: number | null;

  company_return: number | null;
  benchmark_return: number | null;
  relative_return: number | null;

  status: OutcomeStatus;
}

interface OutcomeReviewRow {
  selection_id: string;
  reviewed_at: string;
  expected_outcome: string;
  actual_outcome: string;

  correct_drivers: string[];
  failure_reasons: string[];
  unexpected_events: string[];
  lessons: string[];
}

export interface SaveSelectionOutcomeResult {
  selectionId: string;
  selectionInserted: boolean;
  outcomesSaved: number;
  reviewSaved: boolean;
}

function mapSelectionSnapshot(
  row: SelectionSnapshotRow,
): SelectionSnapshot {
  return {
    selectionId: row.selection_id,
    companyId: row.company_id,
    ticker: row.ticker,
    companyName: row.company_name,

    decision: row.decision,
    selectedAt: row.selected_at,
    entryPrice: row.entry_price,

    todayScore: row.today_score,
    qualityScore: row.quality_score,
    valueScore: row.value_score,
    momentumScore: row.momentum_score,

    themeId: row.theme_id ?? undefined,
    themeName: row.theme_name ?? undefined,
    themeScore: row.theme_score ?? undefined,
    themeConfidence:
      row.theme_confidence ?? undefined,

    benchmarkId: row.benchmark_id,
    benchmarkName: row.benchmark_name,
    benchmarkEntryPrice:
      row.benchmark_entry_price,

    thesis: row.thesis,
    risks: row.risks ?? [],
  };
}

function mapHorizonOutcome(
  row: HorizonOutcomeRow,
): HorizonOutcome {
  return {
    horizon: row.horizon,
    measurementDate: row.measurement_date,

   companyReviewPrice:
  row.company_price ?? undefined,
benchmarkReviewPrice:
  row.benchmark_price ?? undefined,

    companyReturn:
      row.company_return ?? undefined,
    benchmarkReturn:
      row.benchmark_return ?? undefined,
    relativeReturn:
      row.relative_return ?? undefined,

    status: row.status,
  };
}

function mapOutcomeReview(
  row: OutcomeReviewRow,
): OutcomeReview {
  return {
    reviewedAt: row.reviewed_at,
    expectedOutcome: row.expected_outcome,
    actualOutcome: row.actual_outcome,

    correctDrivers: row.correct_drivers ?? [],
    failureReasons: row.failure_reasons ?? [],
    unexpectedEvents:
      row.unexpected_events ?? [],
    lessons: row.lessons ?? [],
  };
}

export async function getSelectionOutcomeRecords():
Promise<SelectionOutcomeRecord[]> {
  const selectionRows = await sql`
    SELECT
      selection_id,
      company_id,
      ticker,
      company_name,
      decision,
      selected_at::text AS selected_at,
      entry_price::double precision AS entry_price,
      today_score::double precision AS today_score,
      quality_score::double precision AS quality_score,
      value_score::double precision AS value_score,
      momentum_score::double precision AS momentum_score,
      theme_id,
      theme_name,
      theme_score::double precision AS theme_score,
      theme_confidence::double precision
        AS theme_confidence,
      benchmark_id,
      benchmark_name,
      benchmark_entry_price::double precision
        AS benchmark_entry_price,
      thesis,
      risks
    FROM selection_snapshots
    ORDER BY selected_at DESC, selection_id;
  `;

  const outcomeRows = await sql`
    SELECT
      selection_id,
      horizon,
      measurement_date::text AS measurement_date,
      company_price::double precision
        AS company_price,
      benchmark_price::double precision
        AS benchmark_price,
      company_return::double precision
        AS company_return,
      benchmark_return::double precision
        AS benchmark_return,
      relative_return::double precision
        AS relative_return,
      status
    FROM selection_horizon_outcomes
    ORDER BY measurement_date, horizon;
  `;

  const reviewRows = await sql`
    SELECT
      selection_id,
      reviewed_at::text AS reviewed_at,
      expected_outcome,
      actual_outcome,
      correct_drivers,
      failure_reasons,
      unexpected_events,
      lessons
    FROM selection_outcome_reviews;
  `;

  const outcomesBySelection = new Map<
    string,
    HorizonOutcome[]
  >();

  for (const row of outcomeRows as HorizonOutcomeRow[]) {
    const outcomes =
      outcomesBySelection.get(row.selection_id) ?? [];

    outcomes.push(mapHorizonOutcome(row));

    outcomesBySelection.set(
      row.selection_id,
      outcomes,
    );
  }

  const reviewsBySelection = new Map<
    string,
    OutcomeReview
  >();

  for (const row of reviewRows as OutcomeReviewRow[]) {
    reviewsBySelection.set(
      row.selection_id,
      mapOutcomeReview(row),
    );
  }

  return (selectionRows as SelectionSnapshotRow[]).map(
    (row) => {
      const selection = mapSelectionSnapshot(row);
      const review = reviewsBySelection.get(
        selection.selectionId,
      );

      return {
        selection,
        outcomes:
          outcomesBySelection.get(
            selection.selectionId,
          ) ?? [],
        ...(review ? { review } : {}),
      };
    },
  );
}

export async function getSelectionOutcomeRecord(
  selectionId: string,
): Promise<SelectionOutcomeRecord | null> {
  const records = await getSelectionOutcomeRecords();

  return (
    records.find(
      (record) =>
        record.selection.selectionId === selectionId,
    ) ?? null
  );
}

export async function getSelectionOutcomesByTheme(
  themeId: string,
): Promise<SelectionOutcomeRecord[]> {
  const records = await getSelectionOutcomeRecords();

  return records.filter(
    (record) =>
      record.selection.themeId === themeId,
  );
}

export async function saveSelectionSnapshot(
  selection: SelectionSnapshot,
): Promise<boolean> {
  const rows = await sql`
    INSERT INTO selection_snapshots (
      selection_id,
      company_id,
      ticker,
      company_name,
      decision,
      selected_at,
      entry_price,
      today_score,
      quality_score,
      value_score,
      momentum_score,
      theme_id,
      theme_name,
      theme_score,
      theme_confidence,
      benchmark_id,
      benchmark_name,
      benchmark_entry_price,
      thesis,
      risks
    )
    VALUES (
      ${selection.selectionId},
      ${selection.companyId},
      ${selection.ticker},
      ${selection.companyName},
      ${selection.decision},
      ${selection.selectedAt},
      ${selection.entryPrice},
      ${selection.todayScore},
      ${selection.qualityScore},
      ${selection.valueScore},
      ${selection.momentumScore},
      ${selection.themeId ?? null},
      ${selection.themeName ?? null},
      ${selection.themeScore ?? null},
      ${selection.themeConfidence ?? null},
      ${selection.benchmarkId},
      ${selection.benchmarkName},
      ${selection.benchmarkEntryPrice},
      ${selection.thesis},
      ${selection.risks}
    )
    ON CONFLICT (selection_id) DO NOTHING
    RETURNING selection_id;
  `;

  return rows.length > 0;
}

export async function saveHorizonOutcome(
  selectionId: string,
  outcome: HorizonOutcome,
): Promise<void> {
  await sql`
    INSERT INTO selection_horizon_outcomes (
      selection_id,
      horizon,
      measurement_date,
      company_price,
      benchmark_price,
      company_return,
      benchmark_return,
      relative_return,
      status
    )
    VALUES (
      ${selectionId},
      ${outcome.horizon},
      ${outcome.measurementDate},
      ${outcome.companyReviewPrice ?? null},
      ${outcome.benchmarkReviewPrice ?? null},
      ${outcome.companyReturn ?? null},
      ${outcome.benchmarkReturn ?? null},
      ${outcome.relativeReturn ?? null},
      ${outcome.status}
    )
    ON CONFLICT (selection_id, horizon)
    DO UPDATE SET
      measurement_date =
        EXCLUDED.measurement_date,
      company_price =
        EXCLUDED.company_price,
      benchmark_price =
        EXCLUDED.benchmark_price,
      company_return =
        EXCLUDED.company_return,
      benchmark_return =
        EXCLUDED.benchmark_return,
      relative_return =
        EXCLUDED.relative_return,
      status =
        EXCLUDED.status,
      updated_at = now();
  `;
}

export async function saveOutcomeReview(
  selectionId: string,
  review: OutcomeReview,
): Promise<void> {
  await sql`
    INSERT INTO selection_outcome_reviews (
      selection_id,
      reviewed_at,
      expected_outcome,
      actual_outcome,
      correct_drivers,
      failure_reasons,
      unexpected_events,
      lessons
    )
    VALUES (
      ${selectionId},
      ${review.reviewedAt},
      ${review.expectedOutcome},
      ${review.actualOutcome},
      ${review.correctDrivers},
      ${review.failureReasons},
      ${review.unexpectedEvents},
      ${review.lessons}
    )
    ON CONFLICT (selection_id)
    DO UPDATE SET
      reviewed_at =
        EXCLUDED.reviewed_at,
      expected_outcome =
        EXCLUDED.expected_outcome,
      actual_outcome =
        EXCLUDED.actual_outcome,
      correct_drivers =
        EXCLUDED.correct_drivers,
      failure_reasons =
        EXCLUDED.failure_reasons,
      unexpected_events =
        EXCLUDED.unexpected_events,
      lessons =
        EXCLUDED.lessons,
      updated_at = now();
  `;
}

export async function saveSelectionOutcomeRecord(
  record: SelectionOutcomeRecord,
): Promise<SaveSelectionOutcomeResult> {
  const selectionInserted =
    await saveSelectionSnapshot(record.selection);

  for (const outcome of record.outcomes) {
    await saveHorizonOutcome(
      record.selection.selectionId,
      outcome,
    );
  }

  if (record.review) {
    await saveOutcomeReview(
      record.selection.selectionId,
      record.review,
    );
  }

  return {
    selectionId: record.selection.selectionId,
    selectionInserted,
    outcomesSaved: record.outcomes.length,
    reviewSaved: Boolean(record.review),
  };
}