import { evidence } from "@/data/evidence";
import { relationships } from "./relationships";

export function calculateThemeConfidence(themeId: string): number {
  let confidence = 0;

  relationships.forEach((relationship) => {
    if (
      relationship.targetType === "theme" &&
      relationship.targetId === themeId
    ) {
      const item = evidence.find(
        (e) => e.id === relationship.evidenceId
      );

      if (item) {
        confidence += item.weight;
      }
    }
  });

  // Cap at 100
  return Math.min(confidence * 10, 100);
}