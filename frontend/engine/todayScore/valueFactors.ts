import type { FactorDirection } from "./qualityFactors";

export type ValueCategory =
  | "relativeValuation"
  | "cashFlowValuation"
  | "historicalValuation";

export interface ValueFactorDefinition {
  id: string;
  name: string;
  category: ValueCategory;
  direction: FactorDirection;
  description: string;
}

export const valueFactorDefinitions: ValueFactorDefinition[] = [
  {
    id: "price-to-earnings",
    name: "Price to Earnings",
    category: "relativeValuation",
    direction: "lowerIsBetter",
    description:
      "Compares the share price with earnings per share relative to comparable companies.",
  },
  {
    id: "forward-price-to-earnings",
    name: "Forward Price to Earnings",
    category: "relativeValuation",
    direction: "lowerIsBetter",
    description:
      "Compares the share price with forecast earnings per share.",
  },
  {
    id: "price-to-sales",
    name: "Price to Sales",
    category: "relativeValuation",
    direction: "lowerIsBetter",
    description:
      "Measures the value placed on each unit of company revenue.",
  },
  {
    id: "price-to-book",
    name: "Price to Book",
    category: "relativeValuation",
    direction: "lowerIsBetter",
    description:
      "Compares the market value of the company with its reported book value.",
  },
  {
    id: "enterprise-value-to-ebitda",
    name: "Enterprise Value to EBITDA",
    category: "relativeValuation",
    direction: "lowerIsBetter",
    description:
      "Compares total enterprise value with operating earnings before interest, tax, depreciation and amortisation.",
  },

  {
    id: "price-to-free-cash-flow",
    name: "Price to Free Cash Flow",
    category: "cashFlowValuation",
    direction: "lowerIsBetter",
    description:
      "Measures the price investors pay relative to free cash flow generated.",
  },
  {
    id: "enterprise-value-to-free-cash-flow",
    name: "Enterprise Value to Free Cash Flow",
    category: "cashFlowValuation",
    direction: "lowerIsBetter",
    description:
      "Compares enterprise value with the company's free cash flow.",
  },
  {
    id: "free-cash-flow-yield",
    name: "Free Cash Flow Yield",
    category: "cashFlowValuation",
    direction: "higherIsBetter",
    description:
      "Measures free cash flow as a percentage of the company's market value.",
  },
  {
    id: "shareholder-yield",
    name: "Shareholder Yield",
    category: "cashFlowValuation",
    direction: "higherIsBetter",
    description:
      "Combines dividends, net share repurchases and debt reduction returned to shareholders.",
  },

  {
    id: "pe-versus-five-year-average",
    name: "P/E Versus Five-Year Average",
    category: "historicalValuation",
    direction: "lowerIsBetter",
    description:
      "Compares the current price-to-earnings ratio with the company's own five-year average.",
  },
  {
    id: "ev-ebitda-versus-five-year-average",
    name: "EV/EBITDA Versus Five-Year Average",
    category: "historicalValuation",
    direction: "lowerIsBetter",
    description:
      "Compares the current EV/EBITDA multiple with the company's own five-year average.",
  },
  {
    id: "price-to-sales-versus-five-year-average",
    name: "Price to Sales Versus Five-Year Average",
    category: "historicalValuation",
    direction: "lowerIsBetter",
    description:
      "Compares the current price-to-sales ratio with the company's own five-year average.",
  },
  {
    id: "free-cash-flow-yield-versus-five-year-average",
    name: "FCF Yield Versus Five-Year Average",
    category: "historicalValuation",
    direction: "higherIsBetter",
    description:
      "Compares the current free-cash-flow yield with the company's own five-year average.",
  },
];