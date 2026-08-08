import { buildEvidence } from "@/engine/evidence";
import {
  convertToConfidenceEvidence,
} from "@/engine/confidence/confidenceEvidenceAdapter";
import { calculateMacroState } from "@/engine/macroState";
import {
  buildHistoricalPerformance,
} from "@/engine/outcomes/outcomeEvaluator";

import type {
  HistoricalOutcome,
} from "@/engine/outcomes/historicalOutcome";

import {
  ismManufacturingHistory,
} from "@/data/evidence/ismManufacturing";
import {
  ismServicesHistory,
} from "@/data/evidence/ismServices";
import {
  employmentHistory,
} from "@/data/evidence/employment";
import {
  inflationHistory,
} from "@/data/evidence/inflation";
import {
  housingHistory,
} from "@/data/evidence/housing";

const manufacturing = ismManufacturingHistory[0];
const services = ismServicesHistory[0];
const employment = employmentHistory[0];
const inflation = inflationHistory[0];
const housing = housingHistory[0];

export function buildMacroEvidence(
  historicalOutcomes: HistoricalOutcome[],
) {
  return [
    convertToConfidenceEvidence(
      buildEvidence(
        "manufacturing-pmi",
        manufacturing.manufacturingPMI,
        manufacturing.previousManufacturingPMI,
      ),
      {
        name: "ISM Manufacturing PMI",
        source: "ISM",
        sourceType: "primary",

        supportiveImpact: "positive",

        observedAt: manufacturing.releasedAt,
        maxAgeDays: 35,

        unit: manufacturing.unit,
        explanation: manufacturing.mbieAssessment,

        historicalPerformance: buildHistoricalPerformance(
          historicalOutcomes,
          "manufacturing-pmi",
        ),
      },
    ),

    convertToConfidenceEvidence(
      buildEvidence(
        "services-pmi",
        services.servicesPMI,
        services.previousServicesPMI,
      ),
      {
        name: "ISM Services PMI",
        source: "ISM",
        sourceType: "primary",

        supportiveImpact: "positive",

        observedAt: services.releasedAt,
        maxAgeDays: 35,

        unit: services.unit,
        explanation: services.mbieAssessment,

        historicalPerformance: buildHistoricalPerformance(
          historicalOutcomes,
          "services-pmi",
        ),
      },
    ),

    convertToConfidenceEvidence(
      buildEvidence(
        "nonfarm-payrolls",
        employment.nonfarmPayrolls,
        employment.previousNonfarmPayrolls,
      ),
      {
        name: "US Nonfarm Payrolls",
        source: "BLS",
        sourceType: "primary",

        supportiveImpact: "positive",

        observedAt: employment.releasedAt,
        maxAgeDays: 35,

        unit: employment.unit,
        explanation: employment.mbieAssessment,

        historicalPerformance: buildHistoricalPerformance(
          historicalOutcomes,
          "nonfarm-payrolls",
        ),
      },
    ),

    convertToConfidenceEvidence(
      buildEvidence(
        "cpi-inflation",
        inflation.cpiYearOverYear,
        inflation.previousCpiYearOverYear,
      ),
      {
        name: "US CPI Inflation",
        source: "BLS",
        sourceType: "primary",

        supportiveImpact: "positive",

        observedAt: inflation.releasedAt,
        maxAgeDays: 35,

        unit: inflation.unit,
        explanation: inflation.mbieAssessment,

        historicalPerformance: buildHistoricalPerformance(
          historicalOutcomes,
          "cpi-inflation",
        ),
      },
    ),

    convertToConfidenceEvidence(
      buildEvidence(
        "building-permits",
        housing.buildingPermits,
        housing.previousBuildingPermits,
      ),
      {
        name: "US Building Permits",
        source: "US Census Bureau",
        sourceType: "primary",

        supportiveImpact: "positive",

        observedAt: housing.releasedAt,
        maxAgeDays: 35,

        unit: housing.unit,
        explanation: housing.mbieAssessment,

        historicalPerformance: buildHistoricalPerformance(
          historicalOutcomes,
          "building-permits",
        ),
      },
    ),
  ];
}

// Temporary compatibility exports while remaining consumers
// are migrated to the database-backed builder.
export const macroEvidence = buildMacroEvidence([]);
export const macroState = calculateMacroState(macroEvidence);