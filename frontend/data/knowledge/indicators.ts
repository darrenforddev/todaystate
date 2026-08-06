import { Indicator } from "./types";

export const indicators: Indicator[] = [
  {
    id: "manufacturing-pmi",
    name: "Manufacturing PMI",
    category: "Manufacturing",
    description: "Measures activity across the manufacturing sector.",
    releaseFrequency: "Monthly",
    importance: "High",
    thresholds: {
      expansion: 50,
      contraction: 50,
    },
  },

  {
    id: "services-pmi",
    name: "Services PMI",
    category: "Services",
    description: "Measures activity across the services sector.",
    releaseFrequency: "Monthly",
    importance: "High",
    thresholds: {
      expansion: 50,
      contraction: 50,
    },
  },

  {
    id: "cpi",
    name: "Consumer Price Index",
    category: "Inflation",
    description: "Measures changes in consumer prices.",
    releaseFrequency: "Monthly",
    importance: "High",
  },
];