import { evidence } from "@/data/evidence";
import { relationships } from "./relationships";

export function getEvidence(id: string) {
  return evidence.find((item) => item.id === id);
}

export function getRelationships(evidenceId: string) {
  return relationships.filter(
    (relationship) => relationship.evidenceId === evidenceId
  );
}

export function getRelatedThemes(evidenceId: string) {
  return getRelationships(evidenceId).filter(
    (relationship) => relationship.targetType === "theme"
  );
}

export function getRelatedCompanies(evidenceId: string) {
  return getRelationships(evidenceId).filter(
    (relationship) => relationship.targetType === "company"
  );
}

export function getRelatedETFs(evidenceId: string) {
  return getRelationships(evidenceId).filter(
    (relationship) => relationship.targetType === "etf"
  );
}

export function getThemeEvidence(themeId: string) {
  const themeRelationships = relationships.filter(
    (relationship) =>
      relationship.targetType === "theme" &&
      relationship.targetId === themeId
  );

  return themeRelationships
    .map((relationship) => {
      const evidenceItem = evidence.find(
        (item) => item.id === relationship.evidenceId
      );

      if (!evidenceItem) {
        return null;
      }

      return {
        id: evidenceItem.id,
        title: evidenceItem.title,
        weight: evidenceItem.weight,
        latestValue: evidenceItem.latestValue,
        previousValue: evidenceItem.previousValue,
        trend: evidenceItem.trend,
        interpretation: evidenceItem.interpretation,
        releasedAt: evidenceItem.releasedAt,
      };
    })
    .filter(
      (
        item
      ): item is {
        id: string;
        title: string;
        weight: number;
        latestValue: number;
        previousValue: number;
        trend: "improving" | "stable" | "weakening";
        interpretation: string;
        releasedAt: string;
      } => item !== null
    );
}