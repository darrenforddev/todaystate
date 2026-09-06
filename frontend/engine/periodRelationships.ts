import {
  evidenceSnapshots,
  getLatestEvidencePeriod,
} from "@/data/evidenceSnapshots";

import {
  indicatorRelationships,
} from "./indicatorRelationships";

import type {
  Relationship,
  RelationshipDirection,
} from "./relationships";

import type { Impact } from "./evidence";

function deriveRelationshipDirection(
  evidenceImpact: Impact,
  supportiveImpact: "positive" | "negative",
): RelationshipDirection {
  if (evidenceImpact === "neutral") {
    return "neutral";
  }

  if (evidenceImpact === supportiveImpact) {
    return "supportive";
  }

  return "contradictory";
}

export function getPeriodRelationships(
  reportPeriod: string,
): Relationship[] {
  const periodSnapshots = evidenceSnapshots.filter(
    (snapshot) =>
      snapshot.reportPeriod === reportPeriod,
  );

  return periodSnapshots.flatMap((snapshot) => {
    const definitions = indicatorRelationships.filter(
      (relationship) =>
        relationship.indicatorKey ===
        snapshot.indicatorKey,
    );

    return definitions.map((definition) => ({
      evidenceId: snapshot.id,

      targetType: definition.targetType,
      targetId: definition.targetId,

      strength: definition.strength,

      direction: deriveRelationshipDirection(
        snapshot.evidence.impact,
        definition.supportiveImpact,
      ),

      independenceGroup:
        definition.independenceGroup,
    }));
  });
}

export function getLatestPeriodRelationships(): Relationship[] {
  const latestPeriod = getLatestEvidencePeriod();

  if (!latestPeriod) {
    return [];
  }

  return getPeriodRelationships(latestPeriod);
}

export function getPeriodRelationshipsForTarget(
  targetType: Relationship["targetType"],
  targetId: string,
  reportPeriod?: string,
): Relationship[] {
  const selectedPeriod =
    reportPeriod ?? getLatestEvidencePeriod();

  if (!selectedPeriod) {
    return [];
  }

  return getPeriodRelationships(
    selectedPeriod,
  ).filter(
    (relationship) =>
      relationship.targetType === targetType &&
      relationship.targetId === targetId,
  );
}