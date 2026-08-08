export type RelationshipDirection =
  | "supportive"
  | "contradictory"
  | "neutral";

export interface Relationship {
  evidenceId: string;

  targetType: "theme" | "company" | "etf";

  targetId: string;

  /**
   * How relevant this evidence is to the target.
   * Uses a 0–100 scale.
   */
  strength: number;

  /**
   * Whether the evidence supports or contradicts
   * the investment case for this specific target.
   */
  direction: RelationshipDirection;

  /**
   * Related indicators share a group so the scoring
   * engine does not treat them as fully independent.
   */
  independenceGroup: string;
}

export const relationships: Relationship[] = [
  {
    evidenceId: "ism-manufacturing-july-2026",
    targetType: "theme",
    targetId: "industrial-recovery",
    strength: 95,
    direction: "supportive",
    independenceGroup: "ism-headline-pmi",
  },
  {
    evidenceId: "ism-services-july-2026",
    targetType: "theme",
    targetId: "industrial-recovery",
    strength: 80,
    direction: "supportive",
    independenceGroup: "ism-headline-pmi",
  },
  {
    evidenceId: "ism-services-employment-july-2026",
    targetType: "theme",
    targetId: "industrial-recovery",
    strength: 45,
    direction: "contradictory",
    independenceGroup: "ism-services-labour",
  },
  {
    evidenceId: "ism-manufacturing-july-2026",
    targetType: "theme",
    targetId: "power-grid",
    strength: 72,
    direction: "supportive",
    independenceGroup: "ism-headline-pmi",
  },
  {
    evidenceId: "ism-manufacturing-july-2026",
    targetType: "theme",
    targetId: "ai-infrastructure",
    strength: 65,
    direction: "supportive",
    independenceGroup: "ism-headline-pmi",
  },
  {
    evidenceId: "ism-manufacturing-july-2026",
    targetType: "company",
    targetId: "caterpillar",
    strength: 88,
    direction: "supportive",
    independenceGroup: "ism-headline-pmi",
  },
  {
    evidenceId: "ism-manufacturing-july-2026",
    targetType: "company",
    targetId: "eaton",
    strength: 76,
    direction: "supportive",
    independenceGroup: "ism-headline-pmi",
  },
  {
    evidenceId: "ism-manufacturing-july-2026",
    targetType: "company",
    targetId: "nvidia",
    strength: 62,
    direction: "supportive",
    independenceGroup: "ism-headline-pmi",
  },
  {
    evidenceId: "ism-manufacturing-july-2026",
    targetType: "etf",
    targetId: "xli",
    strength: 90,
    direction: "supportive",
    independenceGroup: "ism-headline-pmi",
  },
  {
    evidenceId: "ism-manufacturing-july-2026",
    targetType: "etf",
    targetId: "vis",
    strength: 84,
    direction: "supportive",
    independenceGroup: "ism-headline-pmi",
  },
  {
    evidenceId: "ism-manufacturing-july-2026",
    targetType: "etf",
    targetId: "smh",
    strength: 64,
    direction: "supportive",
    independenceGroup: "ism-headline-pmi",
  },
];