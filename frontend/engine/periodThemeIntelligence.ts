import {
  getEvidenceSnapshotsForPeriod,
  getLatestEvidencePeriod,
} from "@/data/evidenceSnapshots";

import {
  getIndicatorCatalogEntry,
} from "@/data/indicatorCatalog";

import {
  indicatorRelationships,
  type IndicatorRelationship,
} from "./indicatorRelationships";

import {
  getPeriodThemeConviction,
  type PeriodThemeConviction,
} from "./periodTheme";

import {
  convertToConfidenceEvidence,
} from "./confidence/confidenceEvidenceAdapter";

import {
  buildConfidenceFactors,
} from "./confidence/confidenceFactorBuilder";

import {
  calculateConfidence,
  type ConfidenceResult,
} from "./confidence/confidenceEngine";

import type {
  ConfidenceEvidence,
} from "./confidence/confidenceEvidence";

export interface PeriodThemeEvidence {
  snapshotId: string;
  indicatorKey: string;
  name: string;
  source: string;
  strength: number;
  signal: ConfidenceEvidence["signal"];
  explanation: string;
}

export interface PeriodThemeIntelligence {
  themeId: string;
  reportPeriod: string;
  asOf: string;
  conviction: PeriodThemeConviction;
  confidence: ConfidenceResult;
  confidenceEvidence: ConfidenceEvidence[];
  evidence: PeriodThemeEvidence[];
  reasoning: string[];
}

function getThemeRelationships(
  themeId: string,
): IndicatorRelationship[] {
  return indicatorRelationships.filter(
    (relationship) =>
      relationship.targetType === "theme" &&
      relationship.targetId === themeId,
  );
}

function getPointInTimeDate(
  observedDates: string[],
): Date {
  const latestObservedAt = [...observedDates].sort(
    (left, right) =>
      new Date(right).getTime() -
      new Date(left).getTime(),
  )[0];

  if (!latestObservedAt) {
    throw new Error(
      "Cannot calculate point-in-time confidence without evidence dates.",
    );
  }

  return new Date(latestObservedAt);
}

export function getPeriodThemeIntelligence(
  themeId: string,
  reportPeriod?: string,
): PeriodThemeIntelligence {
  const selectedPeriod =
    reportPeriod ?? getLatestEvidencePeriod();

  if (!selectedPeriod) {
    throw new Error(
      "No evidence reporting periods are available.",
    );
  }

  const snapshots =
    getEvidenceSnapshotsForPeriod(selectedPeriod);

  const themeRelationships =
    getThemeRelationships(themeId);

  const joinedEvidence = snapshots.flatMap(
    (snapshot) => {
      const relationship =
        themeRelationships.find(
          (candidate) =>
            candidate.indicatorKey ===
            snapshot.indicatorKey,
        );

      if (!relationship) {
        return [];
      }

      const catalogEntry =
        getIndicatorCatalogEntry(
          snapshot.indicatorKey,
        );

      if (!catalogEntry) {
        throw new Error(
          `Indicator catalogue entry not found: ${snapshot.indicatorKey}`,
        );
      }

      const confidenceEvidence =
        convertToConfidenceEvidence(
          snapshot.evidence,
          {
            name: catalogEntry.name,
            source: catalogEntry.source,
            sourceType: catalogEntry.sourceType,
            supportiveImpact:
              relationship.supportiveImpact,
            observedAt: snapshot.observedAt,
            maxAgeDays: catalogEntry.maxAgeDays,
            unit: catalogEntry.unit,
            explanation:
              snapshot.evidence.explanation,
          },
        );

      return [
        {
          snapshot,
          relationship,
          catalogEntry,
          confidenceEvidence: {
            ...confidenceEvidence,
            id: snapshot.id,
          },
        },
      ];
    },
  );

  if (joinedEvidence.length === 0) {
    throw new Error(
      `No evidence is connected to theme ${themeId} for ${selectedPeriod}.`,
    );
  }

  const confidenceEvidence =
    joinedEvidence.map(
      (item) => item.confidenceEvidence,
    );

  const asOfDate = getPointInTimeDate(
    joinedEvidence.map(
      (item) => item.snapshot.observedAt,
    ),
  );

  const confidenceFactors =
    buildConfidenceFactors(
      confidenceEvidence,
      asOfDate,
    );

  const confidence =
    calculateConfidence(confidenceFactors);

  const conviction =
    getPeriodThemeConviction(
      themeId,
      selectedPeriod,
    );

  const evidence: PeriodThemeEvidence[] =
    joinedEvidence.map((item) => ({
      snapshotId: item.snapshot.id,
      indicatorKey:
        item.snapshot.indicatorKey,
      name: item.catalogEntry.name,
      source: item.catalogEntry.source,
      strength: item.relationship.strength,
      signal:
        item.confidenceEvidence.signal,
      explanation:
        item.snapshot.evidence.explanation,
    }));

  const reasoning = evidence.map(
    (item) =>
      `${item.name}: ${item.explanation}`,
  );

  return {
    themeId,
    reportPeriod: selectedPeriod,
    asOf: asOfDate.toISOString(),
    conviction,
    confidence,
    confidenceEvidence,
    evidence,
    reasoning,
  };
}