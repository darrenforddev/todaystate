import {
  NextResponse,
} from "next/server";

import {
  calculateOutcomeReview,
  type OutcomeReviewInput,
} from "@/engine/outcomes/outcomeReview";

import {
  generateOutcomeExplanation,
} from "@/engine/outcomes/outcomeExplanation";

import {
  saveOutcomeExplanation,
} from "@/engine/outcomes/selectionOutcomeRepository";

import type {
  OutcomeExplanationCause,
  OutcomeExplanationFactor,
} from "@/engine/outcomes/types";

import {
  sql,
} from "@/lib/db";

interface ReviewRequestBody {
  selectionId?: unknown;
  horizon?: unknown;
  companyReviewPrice?: unknown;
  benchmarkReviewPrice?: unknown;
  reviewedAt?: unknown;
  explanationCause?: unknown;
  explanationNotes?: unknown;
  unexpectedEvents?: unknown;
  lessons?: unknown;
}
interface SelectionSnapshotRow {
  selection_id: string;
  company_name: string;
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

function isValidExplanationCause(
  value: unknown,
): value is OutcomeExplanationCause {
  return (
    value === "theme" ||
    value === "market" ||
    value === "company" ||
    value === "today-score" ||
    value === "macro" ||
    value === "timing" ||
    value === "unexpected-event" ||
    value === "insufficient-evidence"
  );
}

function readOptionalText(
  value: unknown,
  fieldName: string,
): string {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be text.`);
  }

  const result = value.trim();

  if (result.length > 2_000) {
    throw new Error(
      `${fieldName} must not exceed 2,000 characters.`,
    );
  }

  return result;
}

function readTextList(
  value: unknown,
  fieldName: string,
): string[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be a list.`);
  }

  if (value.length > 20) {
    throw new Error(
      `${fieldName} must not contain more than 20 items.`,
    );
  }

  return value.map((item, index) => {
    if (typeof item !== "string") {
      throw new Error(
        `${fieldName} item ${index + 1} must be text.`,
      );
    }

    const result = item.trim();

    if (!result) {
      throw new Error(
        `${fieldName} item ${index + 1} must not be empty.`,
      );
    }

    if (result.length > 500) {
      throw new Error(
        `${fieldName} item ${index + 1} must not exceed 500 characters.`,
      );
    }

    return result;
  });
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

    const explanationCauseInput =
      body.explanationCause;

    if (
      explanationCauseInput !== undefined &&
      !isValidExplanationCause(
        explanationCauseInput,
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A valid explanation cause is required.",
        },
        { status: 400 },
      );
    }

    const explanationCause:
      OutcomeExplanationCause =
        explanationCauseInput === undefined
          ? "insufficient-evidence"
          : explanationCauseInput;

    const explanationNotes = readOptionalText(
      body.explanationNotes,
      "Explanation notes",
    );

    const unexpectedEvents = readTextList(
      body.unexpectedEvents,
      "Unexpected events",
    );

    const lessons = readTextList(
      body.lessons,
      "Lessons",
    );

    if (
      explanationCause !== "insufficient-evidence" &&
      !explanationNotes
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Explanation notes are required for the selected cause.",
        },
        { status: 400 },
      );
    }

    const selectionRows = await sql`
      SELECT
        selection_id,
        company_name,
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

    const reviewedFactorImpact =
      review.status === "successful" ||
      (review.status === "inconclusive" &&
        review.relativeReturn > 0)
        ? "supportive"
        : review.status === "unsuccessful" ||
            (review.status === "inconclusive" &&
              review.relativeReturn < 0)
          ? "contradictory"
          : null;

    const reviewedFactor:
      OutcomeExplanationFactor | null =
        explanationCause !==
          "insufficient-evidence" &&
        explanationNotes &&
        reviewedFactorImpact
          ? {
              cause: explanationCause,
              impact: reviewedFactorImpact,
              title: "Outcome review evidence",
              explanation: explanationNotes,
            }
          : null;

    const supportingFactors =
      reviewedFactor?.impact === "supportive"
        ? [reviewedFactor]
        : [];

    const contradictoryFactors =
      reviewedFactor?.impact === "contradictory"
        ? [reviewedFactor]
        : [];

    const outcomeExplanation =
      generateOutcomeExplanation({
        selection: {
          companyName: selection.company_name,
          decision: selection.decision,
        },
        outcome: {
          horizon: review.horizon,
          measurementDate:
            review.measurementDate,
          reviewedAt: review.reviewedAt,
          companyReviewPrice:
            review.companyReviewPrice,
          benchmarkReviewPrice:
            review.benchmarkReviewPrice,
          companyReturn: review.companyReturn,
          benchmarkReturn:
            review.benchmarkReturn,
          relativeReturn: review.relativeReturn,
          status: review.status,
          explanation: review.explanation,
        },
        supportingFactors,
        contradictoryFactors,
        unexpectedEvents,
        lessons,
        generatedAt: review.reviewedAt,
      });

    await saveOutcomeExplanation(
      review.selectionId,
      review.horizon,
      outcomeExplanation,
    );

    return NextResponse.json({
      success: true,
      review,
      outcome: updatedRows[0],
      outcomeExplanation,
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