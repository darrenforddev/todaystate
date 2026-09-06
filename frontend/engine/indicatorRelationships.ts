import type { Impact } from "./evidence";

export type RelationshipTargetType =
  | "theme"
  | "company"
  | "etf";

export interface IndicatorRelationship {
  /**
   * Stable economic indicator identity.
   * This does not contain a month or year.
   */
  indicatorKey: string;

  targetType: RelationshipTargetType;

  targetId: string;

  /**
   * Relevance of this indicator to the target.
   * Uses a 0-100 scale.
   */
  strength: number;

  /**
   * The economic impact that supports this target.
   *
   * Example:
   * positive Manufacturing PMI supports Industrial Recovery.
   * A negative indicator could support a defensive or recession theme.
   */
  supportiveImpact: Exclude<Impact, "neutral">;

  /**
   * Related indicators share a group so MBIE does not
   * treat correlated readings as fully independent.
   */
  independenceGroup: string;
}

export const indicatorRelationships: IndicatorRelationship[] = [
  {
    indicatorKey: "ism-manufacturing-pmi",
    targetType: "theme",
    targetId: "industrial-recovery",
    strength: 95,
    supportiveImpact: "positive",
    independenceGroup: "ism-headline-pmi",
  },

  {
    indicatorKey: "ism-services-pmi",
    targetType: "theme",
    targetId: "industrial-recovery",
    strength: 80,
    supportiveImpact: "positive",
    independenceGroup: "ism-headline-pmi",
  },

  {
    indicatorKey: "ism-services-employment",
    targetType: "theme",
    targetId: "industrial-recovery",
    strength: 45,
    supportiveImpact: "positive",
    independenceGroup: "ism-services-labour",
  },

  {
    indicatorKey: "ism-manufacturing-pmi",
    targetType: "theme",
    targetId: "power-grid",
    strength: 72,
    supportiveImpact: "positive",
    independenceGroup: "ism-headline-pmi",
  },

  {
    indicatorKey: "ism-manufacturing-pmi",
    targetType: "theme",
    targetId: "ai-infrastructure",
    strength: 65,
    supportiveImpact: "positive",
    independenceGroup: "ism-headline-pmi",
  },

  {
    indicatorKey: "ism-manufacturing-pmi",
    targetType: "company",
    targetId: "caterpillar",
    strength: 88,
    supportiveImpact: "positive",
    independenceGroup: "ism-headline-pmi",
  },

  {
    indicatorKey: "ism-manufacturing-pmi",
    targetType: "company",
    targetId: "eaton",
    strength: 76,
    supportiveImpact: "positive",
    independenceGroup: "ism-headline-pmi",
  },

  {
    indicatorKey: "ism-manufacturing-pmi",
    targetType: "company",
    targetId: "nvidia",
    strength: 62,
    supportiveImpact: "positive",
    independenceGroup: "ism-headline-pmi",
  },

  {
    indicatorKey: "ism-manufacturing-pmi",
    targetType: "etf",
    targetId: "xli",
    strength: 90,
    supportiveImpact: "positive",
    independenceGroup: "ism-headline-pmi",
  },

  {
    indicatorKey: "ism-manufacturing-pmi",
    targetType: "etf",
    targetId: "vis",
    strength: 84,
    supportiveImpact: "positive",
    independenceGroup: "ism-headline-pmi",
  },

  {
    indicatorKey: "ism-manufacturing-pmi",
    targetType: "etf",
    targetId: "smh",
    strength: 64,
    supportiveImpact: "positive",
    independenceGroup: "ism-headline-pmi",
  },
];