import type {
  HorizonOutcome,
  SelectionOutcomeRecord,
  SelectionSnapshot,
} from "./types";

const novaSelection: SelectionSnapshot = {
  selectionId: "selection-nova-001",
  companyId: "nova",
  ticker: "NOVA",
  companyName: "Nova Test Company",

  decision: "long",
  selectedAt: "2026-08-09",
  entryPrice: 100,

  todayScore: 88,
  qualityScore: 91,
  valueScore: 78,
  momentumScore: 95,

  themeId: "ai-infrastructure",
  themeName: "AI Infrastructure",
  themeScore: 87,
  themeConfidence: 89,

  benchmarkId: "sp-500",
  benchmarkName: "S&P 500",
  benchmarkEntryPrice: 5200,

  thesis:
    "Strong company quality, accelerating momentum and rising demand for AI infrastructure were expected to support benchmark outperformance.",

  risks: [
    "AI infrastructure spending may slow.",
    "The company valuation may already reflect strong future growth.",
    "Supply constraints could delay customer deliveries.",
    "Greater competition may reduce future margins.",
  ],
};

const pendingOutcomes: HorizonOutcome[] = [
  {
    horizon: "one-month",
    measurementDate: "2026-09-09",
    status: "pending",
  },
  {
    horizon: "three-month",
    measurementDate: "2026-11-09",
    status: "pending",
  },
  {
    horizon: "six-month",
    measurementDate: "2027-02-09",
    status: "pending",
  },
  {
    horizon: "twelve-month",
    measurementDate: "2027-08-09",
    status: "pending",
  },
];

export const samplePendingOutcomeRecord:
  SelectionOutcomeRecord = {
  selection: novaSelection,
  outcomes: pendingOutcomes,
};