import type { Impact } from "../evidence/types";
import type { EvidenceSignal } from "./confidenceEvidence";

export type SupportiveImpact =
  | "positive"
  | "negative";

export function deriveEvidenceSignal(
  impact: Impact,
  supportiveImpact: SupportiveImpact
): EvidenceSignal {
  if (impact === "neutral") {
    return "neutral";
  }

  if (impact === supportiveImpact) {
    return "supportive";
  }

  return "contradictory";
}