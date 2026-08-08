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

  const rawChange = current - previous;

  const changeDecimals =
    indicatorId === "building-permits" ? 3 : 1;

  const change = Number(rawChange.toFixed(changeDecimals));

  let direction: Evidence["direction"];

  if (rawChange === 0) {
    direction = "unchanged";
  } else if (rule.higherIsBetter) {
    direction = rawChange > 0 ? "improving" : "weakening";
  } else {
    direction = rawChange < 0 ? "improving" : "weakening";
  }

  const favourable =
    rule.assessmentMode === "change"
      ? rule.higherIsBetter
        ? current >= previous
        : current <= previous
      : rule.higherIsBetter
        ? current >= rule.threshold
        : current <= rule.threshold;

  const status = favourable
    ? rule.statusAbove
    : rule.statusBelow;

  const impact = favourable
    ? rule.impactAbove
    : rule.impactBelow;

  const directionText =
    direction === "improving"
      ? "improving compared with the previous release"
      : direction === "weakening"
        ? "weakening compared with the previous release"
        : "unchanged from the previous release";

  const comparisonText =
    rule.assessmentMode === "change"
      ? `Current value ${current} is ${
          current > previous
            ? "higher than"
            : current < previous
              ? "lower than"
              : "equal to"
        } the previous value of ${previous}`
      : `Current value ${current} is ${
          current > rule.threshold
            ? "above"
            : current < rule.threshold
              ? "below"
              : "equal to"
        } the reference level of ${rule.threshold}`;

  const explanation = `${comparisonText} and is ${directionText}.`;

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