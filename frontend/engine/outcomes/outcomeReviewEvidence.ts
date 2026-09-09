import type {
  OutcomeExplanationCause,
  OutcomeExplanationFactor,
  OutcomeStatus,
} from "./types";

export interface OutcomeReviewEvidenceInput {
  status: Exclude<
    OutcomeStatus,
    "pending"
  >;

  relativeReturn: number;

  cause: OutcomeExplanationCause;
  notes: string;
}

export interface OutcomeReviewEvidence {
  supportingFactors:
    OutcomeExplanationFactor[];

  contradictoryFactors:
    OutcomeExplanationFactor[];
}

export function buildOutcomeReviewEvidence({
  status,
  relativeReturn,
  cause,
  notes,
}: OutcomeReviewEvidenceInput): OutcomeReviewEvidence {
  const explanation = notes.trim();

  if (
    cause ===
      "insufficient-evidence" ||
    !explanation
  ) {
    return {
      supportingFactors: [],
      contradictoryFactors: [],
    };
  }

  const impact =
    status === "successful" ||
    (
      status === "inconclusive" &&
      relativeReturn > 0
    )
      ? "supportive"
      : status === "unsuccessful" ||
          (
            status === "inconclusive" &&
            relativeReturn < 0
          )
        ? "contradictory"
        : null;

  if (!impact) {
    return {
      supportingFactors: [],
      contradictoryFactors: [],
    };
  }

  const factor:
    OutcomeExplanationFactor = {
      cause,
      impact,
      title:
        "Outcome review evidence",
      explanation,
    };

  return impact === "supportive"
    ? {
        supportingFactors: [
          factor,
        ],
        contradictoryFactors: [],
      }
    : {
        supportingFactors: [],
        contradictoryFactors: [
          factor,
        ],
      };
}