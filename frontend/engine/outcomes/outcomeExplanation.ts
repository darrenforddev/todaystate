import type {
  HorizonOutcome,
  OutcomeExplanation,
  OutcomeExplanationCause,
  OutcomeExplanationFactor,
  SelectionSnapshot,
} from "./types";

export interface OutcomeExplanationInput {
  selection: SelectionSnapshot;
  outcome: HorizonOutcome;

  supportingFactors?: OutcomeExplanationFactor[];
  contradictoryFactors?: OutcomeExplanationFactor[];

  unexpectedEvents?: string[];
  lessons?: string[];

  generatedAt?: string;
}

function getTodayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function getPrimaryCause(
  predictionWasCorrect: boolean,
  supportingFactors: OutcomeExplanationFactor[],
  contradictoryFactors: OutcomeExplanationFactor[],
): OutcomeExplanationCause {
  if (
    predictionWasCorrect &&
    supportingFactors.length > 0
  ) {
    return supportingFactors[0].cause;
  }

  if (
    !predictionWasCorrect &&
    contradictoryFactors.length > 0
  ) {
    return contradictoryFactors[0].cause;
  }

  return "insufficient-evidence";
}

function calculateConfidenceAdjustment(
  outcome: HorizonOutcome,
  supportingFactors: OutcomeExplanationFactor[],
  contradictoryFactors: OutcomeExplanationFactor[],
): number {
  if (outcome.status === "inconclusive") {
    return 0;
  }

  const factorBalance =
    supportingFactors.length -
    contradictoryFactors.length;

  if (outcome.status === "successful") {
    return clamp(3 + factorBalance, 1, 10);
  }

  if (outcome.status === "unsuccessful") {
    return clamp(-5 + factorBalance, -10, -1);
  }

  return 0;
}

function buildSummary(
  selection: SelectionSnapshot,
  outcome: HorizonOutcome,
  predictionWasCorrect: boolean,
  primaryCause: OutcomeExplanationCause,
): string {
  const relativeReturn =
    outcome.relativeReturn === undefined
      ? "an unavailable relative return"
      : `${outcome.relativeReturn >= 0 ? "+" : ""}` +
        `${outcome.relativeReturn.toFixed(2)}% relative return`;

  if (outcome.status === "inconclusive") {
    return (
      `${selection.companyName}'s ${outcome.horizon} ` +
      `outcome was inconclusive, with ${relativeReturn}.`
    );
  }

  const resultText = predictionWasCorrect
    ? "was correct"
    : "was incorrect";

  return (
    `${selection.companyName}'s ${selection.decision} ` +
    `selection ${resultText} at the ` +
    `${outcome.horizon} horizon, producing ` +
    `${relativeReturn}. The primary cause was ` +
    `${primaryCause}.`
  );
}

export function generateOutcomeExplanation(
  input: OutcomeExplanationInput,
): OutcomeExplanation {
  if (input.outcome.status === "pending") {
    throw new Error(
      "A pending outcome cannot be explained.",
    );
  }

  const supportingFactors =
    input.supportingFactors ?? [];

  const contradictoryFactors =
    input.contradictoryFactors ?? [];

  const predictionWasCorrect =
    input.outcome.status === "successful";

  const primaryCause = getPrimaryCause(
    predictionWasCorrect,
    supportingFactors,
    contradictoryFactors,
  );

  const confidenceAdjustment =
    calculateConfidenceAdjustment(
      input.outcome,
      supportingFactors,
      contradictoryFactors,
    );

  return {
    summary: buildSummary(
      input.selection,
      input.outcome,
      predictionWasCorrect,
      primaryCause,
    ),

    predictionWasCorrect,
    primaryCause,

    supportingFactors,
    contradictoryFactors,

    unexpectedEvents: input.unexpectedEvents ?? [],
    lessons: input.lessons ?? [],

    confidenceAdjustment,
    generatedAt:
      input.generatedAt?.trim() || getTodayUtc(),
  };
}