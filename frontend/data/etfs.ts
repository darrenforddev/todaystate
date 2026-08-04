import type { ETF } from "../types/etf";

export const etfs: ETF[] = [
  {
    id: "smh",
    name: "VanEck Semiconductor ETF",
    ticker: "SMH",
    provider: "VanEck",

    score: 92,
    confidence: 94,
    momentum: "Strong",
    lifecycle: "Expansion",
    risk: "Moderate",

    opinion:
      "SMH provides concentrated exposure to leading semiconductor companies benefiting from AI infrastructure, data-centre investment and advanced chip demand.",

    why: [
      {
        reason: "Semiconductor demand remains structurally strong",
        confidence: 94,
        evidence: [
          {
            title: "AI accelerator demand",
            status: "Positive",
          },
          {
            title: "Advanced chip investment",
            status: "Positive",
          },
        ],
      },
      {
        reason: "Top holdings benefit from AI infrastructure spending",
        confidence: 92,
        evidence: [
          {
            title: "Hyperscaler capital expenditure",
            status: "Positive",
          },
          {
            title: "Data-centre expansion",
            status: "Positive",
          },
        ],
      },
    ],

    risks: [
      "High sector concentration",
      "Semiconductor cycle volatility",
      "Elevated valuations",
      "Geopolitical supply-chain risk",
    ],

    topHoldings: [
      {
        id: "nvidia",
        name: "NVIDIA",
      },
      {
        id: "broadcom",
        name: "Broadcom",
      },
      {
        id: "tsmc",
        name: "TSMC",
      },
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
  },
];