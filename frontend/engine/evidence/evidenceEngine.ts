import { indicatorRules } from "./indicatorRules";
import type { Evidence } from "./types";

export function buildEvidence(
  indicatorId: string,
  current: number,
  previous: number
): Evidence {
  const rule = indicatorRules[indicatorId];

  if (!rule) {
    throw new Error(`No rule found for ${indicatorId}`);
  }

  const change = Number((current - previous).toFixed(1));

  const direction: Evidence["direction"] =
    change > 0
      ? "improving"
      : change < 0
      ? "weakening"
      : "unchanged";

  const aboveThreshold = current >= rule.threshold;

  const status = aboveThreshold
    ? rule.statusAbove
    : rule.statusBelow;

  const impact = aboveThreshold
    ? rule.impactAbove
    : rule.impactBelow;

  const explanation = `Current value ${current} is ${
    aboveThreshold ? "above" : "below"
  } the threshold of ${rule.threshold} and is ${
    direction === "improving"
      ? "improving compared with the previous release."
      : direction === "weakening"
      ? "weaker than the previous release."
      : "unchanged from the previous release."
  }`;

  return {
    indicatorId,
    current,
    previous,
    change,
    direction,
    status,
    impact,
    explanation,
  };
}