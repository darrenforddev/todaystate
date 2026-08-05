export interface IntelligenceItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  impact: "High" | "Medium" | "Low";
}

export const latestIntelligence: IntelligenceItem[] = [
  {
    id: "ai-capex",
    title: "AI Infrastructure Spending Accelerates",
    summary:
      "Global hyperscalers continue increasing AI capital expenditure, supporting semiconductor and power infrastructure themes.",
    category: "Technology",
    impact: "High",
  },
  {
    id: "manufacturing",
    title: "Manufacturing Momentum Improves",
    summary:
      "Manufacturing activity continues to strengthen across several major economies.",
    category: "Macro",
    impact: "Medium",
  },
  {
    id: "power-grid",
    title: "Electricity Demand Remains Strong",
    summary:
      "Growing AI infrastructure investment continues driving long-term electricity demand.",
    category: "Infrastructure",
    impact: "High",
  },
];