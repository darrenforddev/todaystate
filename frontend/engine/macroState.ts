import type { ConfidenceEvidence } from "./confidence/confidenceEvidence";

export type MacroStateDirection =
  | "Expansionary tilt"
  | "Mixed"
  | "Contractionary tilt";

export interface MacroStateResult {
  direction: MacroStateDirection;
  supportive: ConfidenceEvidence[];
  contradictory: ConfidenceEvidence[];
  neutral: ConfidenceEvidence[];
  explanation: string;
}

export function calculateMacroState(
  evidence: ConfidenceEvidence[],
): MacroStateResult {
  const supportive = evidence.filter(
    (item) => item.signal === "supportive",
  );

  const contradictory = evidence.filter(
    (item) => item.signal === "contradictory",
  );

  const neutral = evidence.filter(
    (item) => item.signal === "neutral",
  );

  let direction: MacroStateDirection = "Mixed";

  if (supportive.length > contradictory.length) {
    direction = "Expansionary tilt";
  }

  if (contradictory.length > supportive.length) {
    direction = "Contractionary tilt";
  }

  const explanation =
    direction === "Expansionary tilt"
      ? `${supportive.length} indicators support expansion while ${contradictory.length} currently act as headwinds.`
      : direction === "Contractionary tilt"
        ? `${contradictory.length} indicators point toward contraction while ${supportive.length} remain supportive.`
        : "The economic evidence is evenly balanced between supportive and contradictory signals.";

  return {
    direction,
    supportive,
    contradictory,
    neutral,
    explanation,
  };
}