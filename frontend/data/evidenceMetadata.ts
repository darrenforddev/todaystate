import type { ConfidenceEvidenceMetadata } from "@/engine/confidence";

export const evidenceMetadata: Record<
  string,
  ConfidenceEvidenceMetadata
> = {
  "ism-manufacturing-july-2026": {
    name: "ISM Manufacturing PMI",
    source: "Institute for Supply Management",
    sourceType: "primary",
    supportiveImpact: "positive",
    observedAt: "2026-08-01",
    maxAgeDays: 35,
    unit: "index",
  },

  "ism-services-july-2026": {
    name: "ISM Services PMI",
    source: "Institute for Supply Management",
    sourceType: "primary",
    supportiveImpact: "positive",
    observedAt: "2026-08-05",
    maxAgeDays: 35,
    unit: "index",
  },

  "ism-services-employment-july-2026": {
    name: "ISM Services Employment Index",
    source: "Institute for Supply Management",
    sourceType: "primary",
    supportiveImpact: "positive",
    observedAt: "2026-08-05",
    maxAgeDays: 35,
    unit: "index",
  },
};