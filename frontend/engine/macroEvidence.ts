import { buildEvidence } from "@/engine/evidence";
import { convertToConfidenceEvidence } from "@/engine/confidence/confidenceEvidenceAdapter";

import { ismManufacturingHistory } from "@/data/evidence/ismManufacturing";
import { ismServicesHistory } from "@/data/evidence/ismServices";
import { employmentHistory } from "@/data/evidence/employment";
import { inflationHistory } from "@/data/evidence/inflation";
import { housingHistory } from "@/data/evidence/housing";
import { calculateMacroState } from "@/engine/macroState";

const manufacturing = ismManufacturingHistory[0];
const services = ismServicesHistory[0];
const employment = employmentHistory[0];
const inflation = inflationHistory[0];
const housing = housingHistory[0];

export const macroEvidence = [
  convertToConfidenceEvidence(
    buildEvidence(
      "manufacturing-pmi",
      manufacturing.manufacturingPMI,
      manufacturing.previousManufacturingPMI
    ),
    {
      name: "ISM Manufacturing PMI",
      source: "ISM",
      sourceType: "primary",
      supportiveImpact: "positive",
      observedAt: `${manufacturing.reportPeriod}-01`,
      maxAgeDays: 35,
      historicalPerformance: {
        successfulOutcomes: 42,
        totalOutcomes: 48,
      },
    }
  ),

  convertToConfidenceEvidence(
    buildEvidence(
      "services-pmi",
      services.servicesPMI,
      services.previousServicesPMI
    ),
    {
      name: "ISM Services PMI",
      source: "ISM",
      sourceType: "primary",
      supportiveImpact: "positive",
      observedAt: `${services.reportPeriod}-01`,
      maxAgeDays: 35,
      historicalPerformance: {
        successfulOutcomes: 40,
        totalOutcomes: 47,
      },
    }
  ),

  convertToConfidenceEvidence(
    buildEvidence(
      "nonfarm-payrolls",
      employment.nonfarmPayrolls,
      employment.previousNonfarmPayrolls
    ),
    {
      name: "US Nonfarm Payrolls",
      source: "BLS",
      sourceType: "primary",
      supportiveImpact: "positive",
      observedAt: `${employment.reportPeriod}-01`,
      maxAgeDays: 35,
      historicalPerformance: {
        successfulOutcomes: 0,
        totalOutcomes: 0,
      },
    }
  ),

  convertToConfidenceEvidence(
    buildEvidence(
      "cpi-inflation",
      inflation.cpiYearOverYear,
      inflation.previousCpiYearOverYear
    ),
    {
      name: "US CPI Inflation",
      source: "BLS",
      sourceType: "primary",
      supportiveImpact: "positive",
      observedAt: `${inflation.reportPeriod}-01`,
      maxAgeDays: 35,
      historicalPerformance: {
        successfulOutcomes: 0,
        totalOutcomes: 0,
      },
    }
  ),

  convertToConfidenceEvidence(
    buildEvidence(
      "building-permits",
      housing.buildingPermits,
      housing.previousBuildingPermits
    ),
    {
      name: "US Building Permits",
      source: "US Census Bureau",
      sourceType: "primary",
      supportiveImpact: "positive",
      observedAt: `${housing.reportPeriod}-01`,
      maxAgeDays: 35,
      historicalPerformance: {
        successfulOutcomes: 0,
        totalOutcomes: 0,
      },
    }
  ),
];
export const macroState = calculateMacroState(macroEvidence);