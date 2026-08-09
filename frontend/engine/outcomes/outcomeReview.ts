import type {
  OutcomeHorizon,
  OutcomeStatus,
  SelectionDecision,
} from "./types";

export interface OutcomeReviewInput {
  selectionId: string;
  decision: SelectionDecision;
  horizon: OutcomeHorizon;

  measurementDate: string;
  reviewedAt: string;

  companyEntryPrice: number;
  companyReviewPrice: number;

  benchmarkEntryPrice: number;
  benchmarkReviewPrice: number;
}

export interface OutcomeReviewResult {
  selectionId: string;
  horizon: OutcomeHorizon;

  measurementDate: string;
  reviewedAt: string;

  companyReviewPrice: number;
  benchmarkReviewPrice: number;

  companyReturn: number;
  benchmarkReturn: number;
  relativeReturn: number;

  status: Exclude<OutcomeStatus, "pending">;
  explanation: string;
}

function assertNonEmpty(
  value: string,
  fieldName: string,
): void {
  if (!value.trim()) {
    throw new Error(`${fieldName} is required.`);
  }
}

function assertValidDate(
  value: string,
  fieldName: string,
): void {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!datePattern.test(value)) {
    throw new Error(
      `${fieldName} must use YYYY-MM-DD format.`,
    );
  }

  const parsed = new Date(`${value}T00:00:00Z`);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    throw new Error(`${fieldName} is invalid.`);
  }
}

function assertPositivePrice(
  value: number,
  fieldName: string,
): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(
      `${fieldName} must be greater than zero.`,
    );
  }
}

function roundPercentage(value: number): number {
  return Math.round(value * 100) / 100;
}

function calculateReturn(
  entryPrice: number,
  reviewPrice: number,
): number {
  return roundPercentage(
    ((reviewPrice - entryPrice) / entryPrice) * 100,
  );
}

export function isOutcomeDue(
  measurementDate: string,
  asOfDate: string,
): boolean {
  assertValidDate(
    measurementDate,
    "Measurement date",
  );

  assertValidDate(asOfDate, "As-of date");

  return measurementDate <= asOfDate;
}

export function calculateOutcomeReview(
  input: OutcomeReviewInput,
): OutcomeReviewResult {
  assertNonEmpty(input.selectionId, "Selection ID");

  assertValidDate(
    input.measurementDate,
    "Measurement date",
  );

  assertValidDate(input.reviewedAt, "Review date");

  if (input.reviewedAt < input.measurementDate) {
    throw new Error(
      "An outcome cannot be reviewed before its measurement date.",
    );
  }

  assertPositivePrice(
    input.companyEntryPrice,
    "Company entry price",
  );

  assertPositivePrice(
    input.companyReviewPrice,
    "Company review price",
  );

  assertPositivePrice(
    input.benchmarkEntryPrice,
    "Benchmark entry price",
  );

  assertPositivePrice(
    input.benchmarkReviewPrice,
    "Benchmark review price",
  );

  const companyReturn = calculateReturn(
    input.companyEntryPrice,
    input.companyReviewPrice,
  );

  const benchmarkReturn = calculateReturn(
    input.benchmarkEntryPrice,
    input.benchmarkReviewPrice,
  );

  const longRelativeReturn = roundPercentage(
    companyReturn - benchmarkReturn,
  );

  const relativeReturn =
    input.decision === "short"
      ? roundPercentage(-longRelativeReturn)
      : longRelativeReturn;

  const status: Exclude<OutcomeStatus, "pending"> =
    relativeReturn > 0
      ? "successful"
      : "unsuccessful";

  const direction =
    input.decision === "long"
      ? "outperformed"
      : "underperformed";

  const explanation =
    status === "successful"
      ? `The ${input.decision} selection succeeded because the company ${direction} the benchmark by ${Math.abs(
          longRelativeReturn,
        ).toFixed(2)} percentage points.`
      : relativeReturn === 0
        ? `The ${input.decision} selection was unsuccessful because the company matched the benchmark and produced no relative advantage.`
        : `The ${input.decision} selection was unsuccessful because the company ${
            input.decision === "long"
              ? "underperformed"
              : "outperformed"
          } the benchmark by ${Math.abs(
            longRelativeReturn,
          ).toFixed(2)} percentage points.`;

  return {
    selectionId: input.selectionId,
    horizon: input.horizon,

    measurementDate: input.measurementDate,
    reviewedAt: input.reviewedAt,

    companyReviewPrice: input.companyReviewPrice,
    benchmarkReviewPrice:
      input.benchmarkReviewPrice,

    companyReturn,
    benchmarkReturn,
    relativeReturn,

    status,
    explanation,
  };
}