import { NextResponse } from "next/server";

import { sql } from "@/lib/db";

import {
  calculateOutcomeReview,
  type OutcomeReviewInput,
} from "@/engine/outcomes/outcomeReview";

interface ReviewRequestBody {
  selectionId?: unknown;
  horizon?: unknown;
  companyReviewPrice?: unknown;
  benchmarkReviewPrice?: unknown;
  reviewedAt?: unknown;
}

interface SelectionSnapshotRow {
  selection_id: string;
  decision: OutcomeReviewInput["decision"];
  entry_price: number;
  benchmark_entry_price: number;
}

interface PendingOutcomeRow {
  measurement_date: string;
  status: string;
}

function getTodayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function isValidHorizon(
  value: unknown,
): value is OutcomeReviewInput["horizon"] {
  return (
    value === "one-month" ||
    value === "three-month" ||
    value === "six-month" ||
    value === "twelve-month"
  );
}

function readPositiveNumber(
  value: unknown,
  fieldName: string,
): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(
      `${fieldName} must be greater than zero.`,
    );
  }

  return parsed;
}

export async function PATCH(request: Request) {
  try {
    const body =
      (await request.json()) as ReviewRequestBody;

    const selectionId =
      typeof body.selectionId === "string"
        ? body.selectionId.trim()
        : "";

    if (!selectionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Selection ID is required.",
        },
        { status: 400 },
      );
    }

    if (!isValidHorizon(body.horizon)) {
      return NextResponse.json(
        {
          success: false,
          error: "A valid outcome horizon is required.",
        },
        { status: 400 },
      );
    }

    const companyReviewPrice = readPositiveNumber(
      body.companyReviewPrice,
      "Company review price",
    );

  const benchmarkReviewPrice = readPositiveNumber(
  body.benchmarkReviewPrice,
  "Benchmark review price",
);
    const reviewedAt =
      typeof body.reviewedAt === "string" &&
      body.reviewedAt.trim()
        ? body.reviewedAt.trim()
        : getTodayUtc();

    const selectionRows = await sql`
      SELECT
        selection_id,
        decision,
        entry_price::double precision
          AS entry_price,
        benchmark_entry_price::double precision
          AS benchmark_entry_price
      FROM selection_snapshots
      WHERE selection_id = ${selectionId}
      LIMIT 1;
    `;

    const selection =
      selectionRows[0] as
        | SelectionSnapshotRow
        | undefined;

    if (!selection) {
      return NextResponse.json(
        {
          success: false,
          error:
            `Selection "${selectionId}" was not found.`,
        },
        { status: 404 },
      );
    }

    const outcomeRows = await sql`
      SELECT
        measurement_date::text
          AS measurement_date,
        status
      FROM selection_horizon_outcomes
      WHERE selection_id = ${selectionId}
        AND horizon = ${body.horizon}
      LIMIT 1;
    `;

    const pendingOutcome =
      outcomeRows[0] as
        | PendingOutcomeRow
        | undefined;

    if (!pendingOutcome) {
      return NextResponse.json(
        {
          success: false,
          error:
            `No ${body.horizon} outcome exists for ` +
            `selection "${selectionId}".`,
        },
        { status: 404 },
      );
    }

    if (pendingOutcome.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          error:
            `The ${body.horizon} outcome has already ` +
            "been reviewed.",
        },
        { status: 409 },
      );
    }

    const review = calculateOutcomeReview({
      selectionId,
      decision: selection.decision,
      horizon: body.horizon,

      measurementDate:
        pendingOutcome.measurement_date,
      reviewedAt,

      companyEntryPrice:
        selection.entry_price,
      companyReviewPrice,

      benchmarkEntryPrice:
        selection.benchmark_entry_price,
      benchmarkReviewPrice,
    });

    const updatedRows = await sql`
      UPDATE selection_horizon_outcomes
      SET
        company_price =
          ${review.companyReviewPrice},
        benchmark_price =
          ${review.benchmarkReviewPrice},
        company_return =
          ${review.companyReturn},
        benchmark_return =
          ${review.benchmarkReturn},
        relative_return =
          ${review.relativeReturn},
        status =
          ${review.status},
        updated_at = now()
      WHERE selection_id =
        ${review.selectionId}
        AND horizon =
          ${review.horizon}
        AND status = 'pending'
      RETURNING
        selection_id,
        horizon,
        measurement_date::text
          AS measurement_date,
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
        status;
    `;

    if (updatedRows.length !== 1) {
      return NextResponse.json(
        {
          success: false,
          error:
            "The outcome changed before the review " +
            "could be saved. Refresh and try again.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({
      success: true,
      review,
      outcome: updatedRows[0],
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The outcome review could not be saved.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 },
    );
  }
}