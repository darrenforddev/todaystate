import type {
  TodayScoreDataRequirement,
  TodayScoreDataset,
} from "./types";

export const todayScoreDataRequirements = [
  {
    id: "income-statement",
    label: "Income statements",
    pillars: ["quality"],
    purpose: "Profitability, margins and multi-year earnings stability.",
  },
  {
    id: "balance-sheet",
    label: "Balance sheets",
    pillars: ["quality"],
    purpose: "Debt, liquidity and financial-strength measures.",
  },
  {
    id: "cash-flow",
    label: "Cash-flow statements",
    pillars: ["quality", "value"],
    purpose: "Cash conversion, free cash flow and cash-flow valuation.",
  },
  {
    id: "statistics",
    label: "Valuation statistics",
    pillars: ["value"],
    purpose: "Current valuation multiples and market-capitalisation context.",
  },
  {
    id: "price-history",
    label: "Daily price history",
    pillars: ["value", "momentum"],
    purpose: "Historical valuation context, returns and trend strength.",
  },
  {
    id: "eps-trend",
    label: "EPS estimate trend",
    pillars: ["momentum"],
    purpose: "Direction and persistence of analyst earnings expectations.",
  },
  {
    id: "eps-revisions",
    label: "EPS revisions",
    pillars: ["momentum"],
    purpose: "Upward and downward analyst revision breadth.",
  },
] as const satisfies readonly TodayScoreDataRequirement[];

const datasetIds = new Set<TodayScoreDataset>(
  todayScoreDataRequirements.map((requirement) => requirement.id),
);

export function isTodayScoreDataset(
  value: string | null,
): value is TodayScoreDataset {
  return value !== null && datasetIds.has(value as TodayScoreDataset);
}
