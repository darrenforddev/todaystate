import type {
  ConfidenceEvidence,
} from "./confidence/confidenceEvidence";
import { getMarketExplanation } from "./explainEngine";

export interface MorningBrief {
  headline: string;
  summary: string;
  opportunity: string;
  opportunityText: string;
  risk: string;
  riskText: string;
  focus: string;
}

export function getMorningBrief(
  evidenceRecords: ConfidenceEvidence[],
): MorningBrief {
  const explanation =
    getMarketExplanation(evidenceRecords);

  return {
    headline: "Expansion Continues",

    summary: explanation.conclusion,

    opportunity: "Industrial Recovery",

    opportunityText:
      "Manufacturing strength continues to support industrial businesses.",

    risk: "Persistent Inflation",

    riskText:
      "Inflation remains the principal macroeconomic headwind.",

    focus:
      "Watch the next CPI release for signs of easing price pressures.",
  };
}