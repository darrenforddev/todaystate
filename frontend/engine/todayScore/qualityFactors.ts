export type QualityCategory =
  | "profitability"
  | "financialStrength"
  | "cashFlowQuality"
  | "earningsStability";

export type FactorDirection =
  | "higherIsBetter"
  | "lowerIsBetter";

export interface QualityFactorDefinition {
  id: string;
  name: string;
  category: QualityCategory;
  direction: FactorDirection;
  description: string;
}

export const qualityFactorDefinitions:
  QualityFactorDefinition[] = [
    {
      id: "return-on-invested-capital",
      name: "Return on Invested Capital",
      category: "profitability",
      direction: "higherIsBetter",
      description:
        "Measures how efficiently the company generates returns from invested capital.",
    },
    {
      id: "return-on-equity",
      name: "Return on Equity",
      category: "profitability",
      direction: "higherIsBetter",
      description:
        "Measures the profit generated from shareholders' equity.",
    },
    {
      id: "operating-margin",
      name: "Operating Margin",
      category: "profitability",
      direction: "higherIsBetter",
      description:
        "Measures operating profit as a percentage of revenue.",
    },
    {
      id: "net-profit-margin",
      name: "Net Profit Margin",
      category: "profitability",
      direction: "higherIsBetter",
      description:
        "Measures net income as a percentage of revenue.",
    },

    {
      id: "net-debt-to-ebitda",
      name: "Net Debt to EBITDA",
      category: "financialStrength",
      direction: "lowerIsBetter",
      description:
        "Measures debt relative to the company's operating earnings.",
    },
    {
      id: "interest-coverage",
      name: "Interest Coverage",
      category: "financialStrength",
      direction: "higherIsBetter",
      description:
        "Measures the company's ability to cover interest payments.",
    },
    {
      id: "current-ratio",
      name: "Current Ratio",
      category: "financialStrength",
      direction: "higherIsBetter",
      description:
        "Measures the ability to meet short-term financial obligations.",
    },
    {
      id: "altman-z-score",
      name: "Altman Z-Score",
      category: "financialStrength",
      direction: "higherIsBetter",
      description:
        "Estimates the probability of financial distress or bankruptcy.",
    },

    {
      id: "free-cash-flow-margin",
      name: "Free Cash Flow Margin",
      category: "cashFlowQuality",
      direction: "higherIsBetter",
      description:
        "Measures free cash flow generated as a percentage of revenue.",
    },
    {
      id: "cash-conversion",
      name: "Cash Conversion",
      category: "cashFlowQuality",
      direction: "higherIsBetter",
      description:
        "Measures how effectively accounting earnings convert into cash.",
    },
    {
      id: "accrual-ratio",
      name: "Accrual Ratio",
      category: "cashFlowQuality",
      direction: "lowerIsBetter",
      description:
        "Identifies earnings that rely heavily on non-cash accounting accruals.",
    },

    {
      id: "earnings-volatility",
      name: "Earnings Volatility",
      category: "earningsStability",
      direction: "lowerIsBetter",
      description:
        "Measures how much company earnings fluctuate over time.",
    },
    {
      id: "revenue-growth-consistency",
      name: "Revenue Growth Consistency",
      category: "earningsStability",
      direction: "higherIsBetter",
      description:
        "Measures how consistently the company grows revenue.",
    },
    {
      id: "earnings-growth-consistency",
      name: "Earnings Growth Consistency",
      category: "earningsStability",
      direction: "higherIsBetter",
      description:
        "Measures how consistently the company grows earnings.",
    },
    {
      id: "share-dilution",
      name: "Share Dilution",
      category: "earningsStability",
      direction: "lowerIsBetter",
      description:
        "Measures growth in the share count that reduces existing ownership.",
    },
  ];