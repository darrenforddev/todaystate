import { Status, Impact } from "./types";

export interface IndicatorRule {
  threshold: number;

  higherIsBetter: boolean;

  statusAbove: Status;

  statusBelow: Status;

  impactAbove: Impact;

  impactBelow: Impact;
}

export const indicatorRules: Record<string, IndicatorRule> = {
  "manufacturing-pmi": {
    threshold: 50,

    higherIsBetter: true,

    statusAbove: "expansion",

    statusBelow: "contraction",

    impactAbove: "positive",

    impactBelow: "negative",
  },

  "services-pmi": {
    threshold: 50,

    higherIsBetter: true,

    statusAbove: "expansion",

    statusBelow: "contraction",

    impactAbove: "positive",

    impactBelow: "negative",
  },
};