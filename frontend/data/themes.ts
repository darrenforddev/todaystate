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
    opinion:
  "AI Infrastructure remains one of TodayState's highest conviction themes as enterprise AI investment, cloud expansion and electricity demand continue to accelerate.",

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
    opinion:
  "Industrial activity is improving steadily, although the pace of recovery still depends on broader economic growth.",

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
    opinion:
  "Power Grid infrastructure continues benefiting from structural electricity demand driven by AI, electrification and renewable investment.",

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