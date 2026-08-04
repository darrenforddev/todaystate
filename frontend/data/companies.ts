import type { Company } from "../types/company";

export const companies: Company[] = [
  {
    id: "nvidia",
    name: "NVIDIA",
    ticker: "NVDA",
    exchange: "NASDAQ",

    score: 97,
    confidence: 96,
    momentum: "Very Strong",
    lifecycle: "Expansion",
    risk: "Moderate",

    opinion:
      "NVIDIA remains one of TodayState's highest-conviction AI infrastructure companies because demand for accelerated computing, data-centre investment and its software ecosystem continue to support growth.",

    why: [
      {
        reason: "AI accelerator demand remains strong",
        confidence: 97,
        evidence: [
          {
            title: "Data-centre GPU demand",
            status: "Positive",
          },
          {
            title: "Hyperscaler capital expenditure",
            status: "Positive",
          },
        ],
      },
      {
        reason: "The CUDA ecosystem strengthens competitive advantage",
        confidence: 95,
        evidence: [
          {
            title: "Developer ecosystem adoption",
            status: "Positive",
          },
          {
            title: "Software platform integration",
            status: "Positive",
          },
        ],
      },
      {
        reason: "Data-centre expansion supports long-term growth",
        confidence: 94,
        evidence: [
          {
            title: "AI infrastructure investment",
            status: "Positive",
          },
          {
            title: "Cloud computing expansion",
            status: "Positive",
          },
        ],
      },
    ],

    risks: [
      "High valuation",
      "Growing competition",
      "Export restrictions",
      "Customer concentration",
    ],

    relatedThemes: [
  {
    id: "ai-infrastructure",
    name: "AI Infrastructure",
  },
  {
    id: "power-grid",
    name: "Power Grid",
  },
],

    relatedEtfs: [
      "SMH",
      "SOXX",
      "QQQ",
    ],
  },
];