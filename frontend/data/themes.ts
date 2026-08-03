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
  {
    reason: "AI data centre spending accelerating",
    confidence: 96,
    evidence: [
      {
        title: "Hyperscaler infrastructure investment",
        status: "Positive",
      },
      {
        title: "AI server demand",
        status: "Positive",
      },
    ],
  },
  {
    reason: "Cloud investment increasing",
    confidence: 94,
    evidence: [
      {
        title: "Cloud capital expenditure",
        status: "Positive",
      },
      {
        title: "Enterprise AI adoption",
        status: "Positive",
      },
    ],
  },
  {
    reason: "Electricity demand growing",
    confidence: 91,
    evidence: [
      {
        title: "Data-centre electricity demand",
        status: "Positive",
      },
      {
        title: "Grid infrastructure investment",
        status: "Positive",
      },
    ],
  },
  {
    reason: "Semiconductor demand remains strong",
    confidence: 93,
    evidence: [
      {
        title: "Advanced chip demand",
        status: "Positive",
      },
      {
        title: "Semiconductor equipment spending",
        status: "Positive",
      },
    ],
  },
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
  {
    reason: "Manufacturing activity improving",
    confidence: 88,
    evidence: [
      {
        title: "Manufacturing PMI trend",
        status: "Positive",
      },
      {
        title: "Factory output momentum",
        status: "Positive",
      },
    ],
  },
  {
    reason: "Industrial orders increasing",
    confidence: 84,
    evidence: [
      {
        title: "New orders activity",
        status: "Positive",
      },
      {
        title: "Business equipment demand",
        status: "Positive",
      },
    ],
  },
  {
    reason: "Capital spending recovering",
    confidence: 81,
    evidence: [
      {
        title: "Corporate capital expenditure",
        status: "Positive",
      },
      {
        title: "Machinery investment",
        status: "Neutral",
      },
    ],
  },
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
  {
    reason: "Electricity demand rising",
    confidence: 90,
    evidence: [
      {
        title: "Electricity consumption trend",
        status: "Positive",
      },
      {
        title: "Peak-load growth",
        status: "Positive",
      },
    ],
  },
  {
    reason: "Grid investment increasing",
    confidence: 92,
    evidence: [
      {
        title: "Utility capital expenditure",
        status: "Positive",
      },
      {
        title: "Transmission upgrade projects",
        status: "Positive",
      },
    ],
  },
  {
    reason: "AI data centres driving power demand",
    confidence: 94,
    evidence: [
      {
        title: "Data-centre connection demand",
        status: "Positive",
      },
      {
        title: "Power infrastructure orders",
        status: "Positive",
      },
    ],
  },
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