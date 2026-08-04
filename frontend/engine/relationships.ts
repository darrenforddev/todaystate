export interface Relationship {
  evidenceId: string;

  targetType: "theme" | "company" | "etf";

  targetId: string;

  strength: number;
}

export const relationships: Relationship[] = [
  {
    evidenceId: "ism-manufacturing-july-2026",
    targetType: "theme",
    targetId: "industrial-recovery",
    strength: 95,
  },
  {
    evidenceId: "ism-manufacturing-july-2026",
    targetType: "theme",
    targetId: "power-grid",
    strength: 72,
  },
  {
    evidenceId: "ism-manufacturing-july-2026",
    targetType: "theme",
    targetId: "ai-infrastructure",
    strength: 65,
  },
  {
    evidenceId: "ism-manufacturing-july-2026",
    targetType: "company",
    targetId: "caterpillar",
    strength: 88,
  },
  {
    evidenceId: "ism-manufacturing-july-2026",
    targetType: "company",
    targetId: "eaton",
    strength: 76,
  },
  {
    evidenceId: "ism-manufacturing-july-2026",
    targetType: "company",
    targetId: "nvidia",
    strength: 62,
  },
  {
    evidenceId: "ism-manufacturing-july-2026",
    targetType: "etf",
    targetId: "xli",
    strength: 90,
  },
  {
    evidenceId: "ism-manufacturing-july-2026",
    targetType: "etf",
    targetId: "vis",
    strength: 84,
  },
  {
    evidenceId: "ism-manufacturing-july-2026",
    targetType: "etf",
    targetId: "smh",
    strength: 64,
  },
];