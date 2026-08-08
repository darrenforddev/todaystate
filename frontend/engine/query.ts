import { evidence } from "@/data/evidence";

import {
  relationships,
  type RelationshipDirection,
} from "./relationships";

export function getEvidence(indicatorId: string) {
  return evidence.find(
    (item) => item.indicatorId === indicatorId,
  );
}

export function getRelationships(evidenceId: string) {
  return relationships.filter(
    (relationship) =>
      relationship.evidenceId === evidenceId,
  );
}

export function getRelatedThemes(evidenceId: string) {
  return getRelationships(evidenceId).filter(
    (relationship) =>
      relationship.targetType === "theme",
  );
}

export function getRelatedCompanies(evidenceId: string) {
  return getRelationships(evidenceId).filter(
    (relationship) =>
      relationship.targetType === "company",
  );
}

export function getRelatedETFs(evidenceId: string) {
  return getRelationships(evidenceId).filter(
    (relationship) =>
      relationship.targetType === "etf",
  );
}

function formatIndicatorTitle(
  indicatorId: string,
): string {
  return indicatorId
    .replace(/-\w+-\d{4}$/, "")
    .split("-")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

export interface ThemeEvidenceResult {
  id: string;
  title: string;
  weight: number;
  direction: RelationshipDirection;
}

export function getThemeEvidence(
  themeId: string,
): ThemeEvidenceResult[] {
  const themeRelationships = relationships.filter(
    (relationship) =>
      relationship.targetType === "theme" &&
      relationship.targetId === themeId,
  );

  return themeRelationships
    .map((relationship) => {
      const evidenceItem = evidence.find(
        (item) =>
          item.indicatorId ===
          relationship.evidenceId,
      );

      if (!evidenceItem) {
        return null;
      }

      return {
        id: evidenceItem.indicatorId,
        title: formatIndicatorTitle(
          evidenceItem.indicatorId,
        ),
        weight: relationship.strength,
        direction: relationship.direction,
      };
    })
    .filter(
      (
        item,
      ): item is ThemeEvidenceResult =>
        item !== null,
    );
}