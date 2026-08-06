import {
  indicators,
  relationships,
  themes,
  type Theme,
} from "@/data/knowledge";

export interface ThemeLink {
  theme: Theme;
  relationshipStrength: number;
}

export function getThemesForIndicator(
  indicatorId: string
): ThemeLink[] {
  const indicatorExists = indicators.some(
    (indicator) => indicator.id === indicatorId
  );

  if (!indicatorExists) {
    return [];
  }

  return relationships
    .filter(
      (relationship) =>
        relationship.from === indicatorId &&
        relationship.type === "supports"
    )
    .map((relationship) => {
      const theme = themes.find(
        (item) => item.id === relationship.to
      );

      if (!theme) {
        return null;
      }

      return {
        theme,
        relationshipStrength: relationship.strength,
      };
    })
    .filter(
      (item): item is ThemeLink => item !== null
    );
}

export function getSupportingIndicatorsForTheme(
  themeId: string
) {
  return relationships
    .filter(
      (relationship) =>
        relationship.to === themeId &&
        relationship.type === "supports"
    )
    .map((relationship) => {
      const indicator = indicators.find(
        (item) => item.id === relationship.from
      );

      if (!indicator) {
        return null;
      }

      return {
        indicator,
        relationshipStrength: relationship.strength,
      };
    })
    .filter(
      (
        item
      ): item is {
        indicator: (typeof indicators)[number];
        relationshipStrength: number;
      } => item !== null
    );
}
export function getThemeById(themeId: string) {
  return themes.find((theme) => theme.id === themeId) ?? null;
}

export interface ThemeIntelligence {
  theme: Theme;
  supportingIndicators: ReturnType<
    typeof getSupportingIndicatorsForTheme
  >;
  averageRelationshipStrength: number;
}

export function getThemeIntelligence(
  themeId: string
): ThemeIntelligence | null {
  const theme = getThemeById(themeId);

  if (!theme) {
    return null;
  }

  const supportingIndicators =
    getSupportingIndicatorsForTheme(themeId);

  const averageRelationshipStrength =
    supportingIndicators.length === 0
      ? 0
      : supportingIndicators.reduce(
          (total, item) => total + item.relationshipStrength,
          0
        ) / supportingIndicators.length;

  return {
    theme,
    supportingIndicators,
    averageRelationshipStrength,
  };
}