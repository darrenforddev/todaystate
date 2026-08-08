import type { Evidence } from "@/engine/evidence";

export const evidence: Evidence[] = [
  {
    indicatorId: "ism-manufacturing-july-2026",
    current: 55.6,
    previous: 53.3,
    change: 2.3,
    direction: "improving",
    status: "expansion",
    impact: "positive",
    explanation:
      "ISM Manufacturing PMI improved from 53.3 to 55.6 and remains in expansion.",
  },
  {
    indicatorId: "ism-services-july-2026",
    current: 54.1,
    previous: 54.0,
    change: 0.1,
    direction: "improving",
    status: "expansion",
    impact: "positive",
    explanation:
      "ISM Services PMI improved from 54.0 to 54.1 and remains in expansion.",
  },
  {
    indicatorId: "ism-services-employment-july-2026",
    current: 47.4,
    previous: 51.2,
    change: -3.8,
    direction: "weakening",
    status: "contraction",
    impact: "negative",
    explanation:
      "ISM Services Employment fell from 51.2 to 47.4, moving from expansion into contraction.",
  },
];