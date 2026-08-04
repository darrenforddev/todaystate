import { evidence } from "@/data/evidence";
import { relationships } from "./relationships";

function calculateScore(
  targetType: "theme" | "company",
  targetId: string
): number {
  let weightedTotal = 0;
  let totalWeight = 0;

  relationships.forEach((relationship) => {
    if (
      relationship.targetType !== targetType ||
      relationship.targetId !== targetId
    ) {
      return;
    }

    const evidenceItem = evidence.find(
      (item) => item.id === relationship.evidenceId
    );

    if (!evidenceItem) {
      return;
    }

    weightedTotal +=
      relationship.strength * evidenceItem.weight;

    totalWeight += evidenceItem.weight;
  });

  if (totalWeight === 0) {
    return 0;
  }

  return Math.round(weightedTotal / totalWeight);
}

export function calculateThemeScore(themeId: string): number {
  return calculateScore("theme", themeId);
}

export function calculateCompanyScore(companyId: string): number {
  return calculateScore("company", companyId);
}