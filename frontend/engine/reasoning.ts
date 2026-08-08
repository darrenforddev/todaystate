import { evidence } from "@/data/evidence";
import { relationships } from "./relationships";

export function getThemeReasoning(
  themeId: string,
): string[] {
  return relationships
    .filter(
      (relationship) =>
        relationship.targetType === "theme" &&
        relationship.targetId === themeId,
    )
    .map((relationship) => {
      const item = evidence.find(
        (evidenceItem) =>
          evidenceItem.indicatorId ===
          relationship.evidenceId,
      );

      if (!item) {
        return null;
      }

      return item.explanation;
    })
    .filter(
      (reason): reason is string =>
        reason !== null,
    );
}