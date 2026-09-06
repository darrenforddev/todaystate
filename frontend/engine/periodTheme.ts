import {
  getAvailableEvidencePeriods,
  getLatestEvidencePeriod,
} from "@/data/evidenceSnapshots";

import {
  getRelationshipScoreBreakdown,
  type RelationshipScoreBreakdown,
} from "./scoring";

import {
  getPeriodRelationships,
} from "./periodRelationships";

export interface PeriodThemeConviction {
  themeId: string;
  reportPeriod: string;
  score: number;
  breakdown: RelationshipScoreBreakdown;
}

export function getPeriodThemeConviction(
  themeId: string,
  reportPeriod?: string,
): PeriodThemeConviction {
  const selectedPeriod =
    reportPeriod ?? getLatestEvidencePeriod();

  if (!selectedPeriod) {
    throw new Error(
      "No evidence reporting periods are available.",
    );
  }

  const availablePeriods =
    getAvailableEvidencePeriods();

  if (!availablePeriods.includes(selectedPeriod)) {
    throw new Error(
      `Evidence reporting period not found: ${selectedPeriod}`,
    );
  }

  const periodRelationships =
    getPeriodRelationships(selectedPeriod);

  const breakdown =
    getRelationshipScoreBreakdown(
      "theme",
      themeId,
      periodRelationships,
    );

  return {
    themeId,
    reportPeriod: selectedPeriod,
    score: breakdown.score,
    breakdown,
  };
}