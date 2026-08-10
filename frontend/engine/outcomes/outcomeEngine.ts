import type {
  HorizonOutcome,
  OutcomeHorizon,
  OutcomeStatus,
  SelectionDecision,
  SelectionSnapshot,
} from "./types";

function roundPercentage(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateReturn(
  entryPrice: number,
  currentPrice: number,
): number {
  if (
    !Number.isFinite(entryPrice) ||
    entryPrice <= 0
  ) {
    throw new Error(
      "Entry price must be greater than zero.",
    );
  }

  if (
    !Number.isFinite(currentPrice) ||
    currentPrice <= 0
  ) {
    throw new Error(
      "Current price must be greater than zero.",
    );
  }

  return roundPercentage(
    ((currentPrice - entryPrice) / entryPrice) *
      100,
  );
}

export function calculateRelativeReturn(
  companyReturn: number,
  benchmarkReturn: number,
): number {
  return roundPercentage(
    companyReturn - benchmarkReturn,
  );
}

export function evaluateOutcomeStatus(
  decision: SelectionDecision,
  relativeReturn: number,
): OutcomeStatus {
  if (
    decision === "watch" ||
    decision === "avoid"
  ) {
    return "inconclusive";
  }

  if (relativeReturn === 0) {
    return "inconclusive";
  }

  if (decision === "long") {
    return relativeReturn > 0
      ? "successful"
      : "unsuccessful";
  }

  return relativeReturn < 0
    ? "successful"
    : "unsuccessful";
}

export interface MeasureOutcomeInputs {
  selection: SelectionSnapshot;
  horizon: OutcomeHorizon;

  measurementDate: string;
  reviewedAt?: string;

  companyReviewPrice?: number;
  benchmarkReviewPrice?: number;
}

export function measureOutcome({
  selection,
  horizon,
  measurementDate,
  reviewedAt,
  companyReviewPrice,
  benchmarkReviewPrice,
}: MeasureOutcomeInputs): HorizonOutcome {
  if (
    companyReviewPrice === undefined ||
    benchmarkReviewPrice === undefined
  ) {
    return {
      horizon,
      measurementDate,
      status: "pending",
    };
  }

  const companyReturn = calculateReturn(
    selection.entryPrice,
    companyReviewPrice,
  );

  const benchmarkReturn = calculateReturn(
    selection.benchmarkEntryPrice,
    benchmarkReviewPrice,
  );

  const relativeReturn =
    calculateRelativeReturn(
      companyReturn,
      benchmarkReturn,
    );

  const status = evaluateOutcomeStatus(
    selection.decision,
    relativeReturn,
  );

  return {
    horizon,
    measurementDate,
    reviewedAt:
      reviewedAt ?? measurementDate,

    companyReviewPrice,
    benchmarkReviewPrice,

    companyReturn,
    benchmarkReturn,
    relativeReturn,

    status,
  };
}