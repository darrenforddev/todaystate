import { evidence } from "@/data/evidence";
import { relationships } from "./relationships";

export function getThemeReasoning(themeId: string): string[] {
  return relationships
    .filter(
      (relationship) =>
        relationship.targetType === "theme" &&
        relationship.targetId === themeId
    )
    .map((relationship) => {
      const item = evidence.find(
        (evidenceItem) =>
          evidenceItem.id === relationship.evidenceId
      );

      if (!item) {
        return null;
      }

      return `${item.title} is providing strong support for this theme.`;
    })
    .filter((reason): reason is string => reason !== null);
}