import {
  calculateThemeHistoricalPerformance,
} from "./historicalPerformance";

import { sampleOutcomeRecord } from "./sampleOutcomeRecord";
import { sampleFailedOutcomeRecord } from "./sampleFailedOutcomeRecord";
import { sampleShortOutcomeRecord } from "./sampleShortOutcomeRecord";
import { samplePendingOutcomeRecord } from "./samplePendingOutcomeRecord";
import { sampleDifferentThemeOutcomeRecord } from "./sampleDifferentThemeOutcomeRecord";

import type {
  OutcomeHorizon,
  SelectionOutcomeRecord,
} from "./types";

export const sampleHistoricalRecords:
  SelectionOutcomeRecord[] = [
    sampleOutcomeRecord,
    sampleFailedOutcomeRecord,
    sampleShortOutcomeRecord,
    samplePendingOutcomeRecord,
    sampleDifferentThemeOutcomeRecord,
  ];

/*
 * Returns the historical performance for any theme.
 *
 * The measurement horizon defaults to twelve months but can be
 * supplied when another horizon is required.
 */
export function getThemeHistoricalPerformance(
  themeId: string,
  horizon: OutcomeHorizon = "twelve-month",
) {
  return calculateThemeHistoricalPerformance(
    sampleHistoricalRecords,
    themeId,
    horizon,
  );
}

export const industrialRecoveryPerformance =
  getThemeHistoricalPerformance(
    "industrial-recovery",
  );

export const constructionSlowdownPerformance =
  getThemeHistoricalPerformance(
    "construction-slowdown",
  );

export const energySupplyTightnessPerformance =
  getThemeHistoricalPerformance(
    "energy-supply-tightness",
  );

export const aiInfrastructurePerformance =
  getThemeHistoricalPerformance(
    "ai-infrastructure",
  );