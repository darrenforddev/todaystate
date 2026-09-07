import type { EvidenceUnit } from "@/engine/confidence/confidenceEvidence";
import type { EvidenceSourceType } from "@/engine/confidence/confidenceSourceRules";

export interface IndicatorCatalogEntry {
  indicatorKey: string;
  name: string;
  source: string;
  sourceType: EvidenceSourceType;
  unit: EvidenceUnit;
  maxAgeDays: number;
}

export const indicatorCatalog: Record<
  string,
  IndicatorCatalogEntry
> = {
  "ism-manufacturing-pmi": {
    indicatorKey: "ism-manufacturing-pmi",
    name: "ISM Manufacturing PMI",
    source: "Institute for Supply Management",
    sourceType: "primary",
    unit: "index",
    maxAgeDays: 35,
  },

  "ism-services-pmi": {
    indicatorKey: "ism-services-pmi",
    name: "ISM Services PMI",
    source: "Institute for Supply Management",
    sourceType: "primary",
    unit: "index",
    maxAgeDays: 35,
  },

  "ism-services-employment": {
    indicatorKey: "ism-services-employment",
    name: "ISM Services Employment Index",
    source: "Institute for Supply Management",
    sourceType: "primary",
    unit: "index",
    maxAgeDays: 35,
  },
};

export function getIndicatorCatalogEntry(
  indicatorKey: string
): IndicatorCatalogEntry | undefined {
  return indicatorCatalog[indicatorKey];
}