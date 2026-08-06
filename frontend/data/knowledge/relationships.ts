import { Relationship } from "./types";

export const relationships: Relationship[] = [
  {
    id: "manufacturing-industrial",
    from: "manufacturing-pmi",
    to: "industrial-recovery",
    type: "supports",
    strength: 0.95,
  },

  {
    id: "services-consumer",
    from: "services-pmi",
    to: "consumer-strength",
    type: "supports",
    strength: 0.90,
  },

  {
    id: "cpi-inflation",
    from: "cpi",
    to: "inflation-risk",
    type: "supports",
    strength: 1.0,
  },
];