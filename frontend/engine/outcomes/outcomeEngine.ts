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
  if (entryPrice <= 0) {
    throw new Error(
      "Entry price must be greater than zero.",
    );
  }

  return roundPercentage(
    ((currentPrice - entryPrice) / entryPrice) * 100,
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
  if (decision === "watch" || decision === "avoid") {
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
  companyPrice?: number;
  benchmarkPrice?: number;
}

export function measureOutcome({
  selection,
  horizon,
  measurementDate,
  companyPrice,
  benchmarkPrice,
}: MeasureOutcomeInputs): HorizonOutcome {
  if (
    companyPrice === undefined ||
    benchmarkPrice === undefined
  ) {
    return {
      horizon,
      measurementDate,
      companyPrice,
      benchmarkPrice,
      status: "pending",
    };
  }

  const companyReturn = calculateReturn(
    selection.entryPrice,
    companyPrice,
  );

  const benchmarkReturn = calculateReturn(
    selection.benchmarkEntryPrice,
    benchmarkPrice,
  );

  const relativeReturn = calculateRelativeReturn(
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
    companyPrice,
    benchmarkPrice,
    companyReturn,
    benchmarkReturn,
    relativeReturn,
    status,
  };
}