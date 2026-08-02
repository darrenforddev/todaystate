import type { Theme } from "../types/theme";

export const themes: Theme[] = [
  {
  id: "ai-infrastructure",
  name: "AI Infrastructure",
  score: 94,

  momentum: "Very Strong",
  confidence: 96,
  lifecycle: "Expansion",

  description:
    "Investment in AI infrastructure continues accelerating worldwide.",

  why: [
    "AI data centre spending accelerating",
    "Cloud investment increasing",
    "Electricity demand growing",
    "Semiconductor demand remains strong",
  ],

  risks: [
    "High valuations",
    "Power availability",
    "Government regulation",
  ],

  etfs: [
    "SMH",
    "SOXX",
    "IGV",
  ],

  companies: [
    "NVIDIA",
    "Broadcom",
    "Vertiv",
    "Schneider Electric",
  ],
},
  {
  id: "industrial-recovery",
  name: "Industrial Recovery",
  score: 88,

  momentum: "Improving",
  confidence: 88,
  lifecycle: "Expansion",

  description:
    "Manufacturing expansion is improving industrial demand.",

  why: [
    "Manufacturing activity improving",
    "Industrial orders increasing",
    "Capital spending recovering",
  ],

  risks: [
    "Economic slowdown",
    "Higher interest rates",
  ],

  etfs: [
    "XLI",
    "VIS",
  ],

  companies: [
    "Caterpillar",
    "Deere",
    "Siemens",
    "ABB",
  ],
},
  {
  id: "power-grid",
  name: "Power Grid",
  score: 85,

  momentum: "Strong",
  confidence: 90,
  lifecycle: "Expansion",

  description:
    "Electricity demand and grid upgrades remain structural growth themes.",

  why: [
    "Electricity demand rising",
    "Grid investment increasing",
    "AI data centres driving power demand",
  ],

  risks: [
    "Project delays",
    "Commodity costs",
  ],

  etfs: [
    "GRID",
    "PAVE",
  ],

  companies: [
    "Eaton",
    "Quanta Services",
    "Schneider Electric",
    "Hitachi Energy",
  ],
},
];