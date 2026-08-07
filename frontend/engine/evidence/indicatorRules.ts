import { Status, Impact } from "./types";

export interface IndicatorRule {
  assessmentMode?: "threshold" | "change";

  threshold: number;

  higherIsBetter: boolean;

  statusAbove: Status;
  statusBelow: Status;

  impactAbove: Impact;
  impactBelow: Impact;
}

export const indicatorRules: Record<string, IndicatorRule> = {
  "manufacturing-pmi": {
    assessmentMode: "threshold",
    threshold: 50,

    higherIsBetter: true,

    statusAbove: "expansion",
    statusBelow: "contraction",

    impactAbove: "positive",
    impactBelow: "negative",
  },

  "services-pmi": {
    assessmentMode: "threshold",
    threshold: 50,

    higherIsBetter: true,

    statusAbove: "expansion",
    statusBelow: "contraction",

    impactAbove: "positive",
    impactBelow: "negative",
  },

  "nonfarm-payrolls": {
    assessmentMode: "threshold",
    threshold: 0,

    higherIsBetter: true,

    statusAbove: "expansion",
    statusBelow: "contraction",

    impactAbove: "positive",
    impactBelow: "negative",
  },

  "cpi-inflation": {
    assessmentMode: "threshold",
    threshold: 2,

    higherIsBetter: false,

    statusAbove: "contraction",
    statusBelow: "expansion",

    impactAbove: "negative",
    impactBelow: "positive",
  },

  "building-permits": {
    assessmentMode: "change",
    threshold: 0,

    higherIsBetter: true,

    statusAbove: "expansion",
    statusBelow: "contraction",

    impactAbove: "positive",
    impactBelow: "negative",
  },
};