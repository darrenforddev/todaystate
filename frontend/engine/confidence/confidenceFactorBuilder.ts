import type { ConfidenceEvidence } from "./confidenceEvidence";
import type { ConfidenceFactors } from "./confidenceFactors";
import { getSourceQuality } from "./confidenceSourceRules";
import { calculateHistoricalAccuracy } from "./historicalPerformance";

function clamp(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function calculateEvidenceQuality(
  evidence: ConfidenceEvidence
): number {
  if (evidence.sourceType) {
    return getSourceQuality(evidence.sourceType);
  }

  return clamp(evidence.quality ?? 0);
}

export function calculateEvidenceHistoricalAccuracy(
  evidence: ConfidenceEvidence
): number {
  if (evidence.historicalPerformance) {
    return calculateHistoricalAccuracy(
      evidence.historicalPerformance
    );
  }

  return clamp(evidence.historicalAccuracy ?? 50);
}

export function calculateEvidenceFreshness(
  evidence: ConfidenceEvidence,
  asOf: Date = new Date()
): number {
  if (evidence.observedAt && evidence.maxAgeDays) {
    const observed = new Date(evidence.observedAt);

    const observedDay = Date.UTC(
      observed.getUTCFullYear(),
      observed.getUTCMonth(),
      observed.getUTCDate()
    );

    const currentDay = Date.UTC(
      asOf.getUTCFullYear(),
      asOf.getUTCMonth(),
      asOf.getUTCDate()
    );

    const ageDays =
      (currentDay - observedDay) /
      (1000 * 60 * 60 * 24);

    if (ageDays <= 0) {
      return 100;
    }

    const freshness =
      100 - (ageDays / evidence.maxAgeDays) * 100;

    return clamp(Math.round(freshness));
  }

  return clamp(evidence.freshness ?? 0);
}

export function buildConfidenceFactors(
  evidence: ConfidenceEvidence[],
  asOf: Date = new Date()
): ConfidenceFactors {
  if (evidence.length === 0) {
    return {
      evidenceQuality: 0,
      evidenceAgreement: 0,
      evidenceFreshness: 0,
      supportingEvidence: 0,
      historicalAccuracy: 0,
    };
  }

  const average = (values: number[]) =>
    values.reduce((total, value) => total + value, 0) /
    values.length;

 const evidenceQuality = average(
  evidence.map((item) =>
    calculateEvidenceQuality(item)
  )
);

  const evidenceFreshness = average(
    evidence.map((item) =>
      calculateEvidenceFreshness(item, asOf)
    )
  );

 const historicalAccuracy = average(
  evidence.map((item) =>
    calculateEvidenceHistoricalAccuracy(item)
  )
);

  const supportiveCount = evidence.filter(
    (item) => item.signal === "supportive"
  ).length;

  const contradictoryCount = evidence.filter(
    (item) => item.signal === "contradictory"
  ).length;

  const supportingEvidence =
    (supportiveCount / evidence.length) * 100;

  const evidenceAgreement =
    ((evidence.length - contradictoryCount) /
      evidence.length) *
    100;

  return {
    evidenceQuality,
    evidenceAgreement,
    evidenceFreshness,
    supportingEvidence,
    historicalAccuracy,
  };
}