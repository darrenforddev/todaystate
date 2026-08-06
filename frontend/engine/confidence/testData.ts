import type { ConfidenceFactors } from "./confidenceFactors";
import type { ConfidenceEvidence } from "./confidenceEvidence";
import { buildEvidence } from "../evidence";
import { convertToConfidenceEvidence } from "./confidenceEvidenceAdapter";

export const sampleConfidenceFactors: ConfidenceFactors = {
  evidenceQuality: 95,
  evidenceAgreement: 90,
  evidenceFreshness: 100,
  supportingEvidence: 85,
  historicalAccuracy: 80,
};

const strongManufacturingEvidence =
  convertToConfidenceEvidence(
    buildEvidence(
      "manufacturing-pmi",
      52.4,
      49.8
    ),
    {
      name: "ISM Manufacturing PMI",
      source: "ISM",
      sourceType: "primary",
      supportiveImpact: "positive",
      observedAt: "2026-08-01",
      maxAgeDays: 35,
      historicalPerformance: {
        successfulOutcomes: 42,
        totalOutcomes: 48,
      },
    }
  );

export const strongEvidence: ConfidenceEvidence[] = [
  strongManufacturingEvidence,
  {
    id: "ism-services",
    name: "ISM Services PMI",
    source: "ISM",
    signal: "supportive",
    quality: 95,
    freshness: 98,
    historicalAccuracy: 88,
  },
  {
    id: "employment",
    name: "Employment Data",
    source: "Official Labour Data",
    signal: "supportive",
    quality: 94,
    freshness: 92,
    historicalAccuracy: 86,
  },
  {
    id: "commodities",
    name: "Commodity Signals",
    source: "Market Data",
    signal: "supportive",
    quality: 88,
    freshness: 100,
    historicalAccuracy: 82,
  },
  {
    id: "historical-match",
    name: "Historical Regime Match",
    source: "MBIE History",
    signal: "supportive",
    quality: 90,
    freshness: 85,
    historicalAccuracy: 92,
  },
];

export const mixedEvidence: ConfidenceEvidence[] = [
  {
    id: "ism-manufacturing",
    name: "ISM Manufacturing PMI",
    source: "ISM",
    signal: "supportive",
    quality: 90,
    freshness: 95,
    historicalAccuracy: 84,
  },
  {
    id: "ism-services",
    name: "ISM Services PMI",
    source: "ISM",
    signal: "supportive",
    quality: 88,
    freshness: 92,
    historicalAccuracy: 82,
  },
  {
    id: "employment",
    name: "Employment Data",
    source: "Official Labour Data",
    signal: "contradictory",
    quality: 85,
    freshness: 90,
    historicalAccuracy: 78,
  },
  {
    id: "commodities",
    name: "Commodity Signals",
    source: "Market Data",
    signal: "neutral",
    quality: 70,
    freshness: 75,
    historicalAccuracy: 65,
  },
  {
    id: "historical-match",
    name: "Historical Regime Match",
    source: "MBIE History",
    signal: "supportive",
    quality: 68,
    freshness: 65,
    historicalAccuracy: 70,
  },
];

export const weakEvidence: ConfidenceEvidence[] = [
  {
    id: "ism-manufacturing",
    name: "ISM Manufacturing PMI",
    source: "ISM",
    signal: "contradictory",
    quality: 58,
    freshness: 65,
    historicalAccuracy: 55,
  },
  {
    id: "ism-services",
    name: "ISM Services PMI",
    source: "ISM",
    signal: "contradictory",
    quality: 55,
    freshness: 60,
    historicalAccuracy: 52,
  },
  {
    id: "employment",
    name: "Employment Data",
    source: "Official Labour Data",
    signal: "contradictory",
    quality: 52,
    freshness: 55,
    historicalAccuracy: 50,
  },
  {
    id: "commodities",
    name: "Commodity Signals",
    source: "Market Data",
    signal: "neutral",
    quality: 42,
    freshness: 50,
    historicalAccuracy: 45,
  },
  {
    id: "historical-match",
    name: "Historical Regime Match",
    source: "MBIE History",
    signal: "supportive",
    quality: 40,
    freshness: 45,
    historicalAccuracy: 42,
  },
];