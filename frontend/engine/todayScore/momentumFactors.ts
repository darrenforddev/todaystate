import type { FactorDirection } from "./qualityFactors";

export type MomentumCategory =
  | "priceMomentum"
  | "earningsMomentum"
  | "trendStrength";

export interface MomentumFactorDefinition {
  id: string;
  name: string;
  category: MomentumCategory;
  direction: FactorDirection;
  description: string;
}

export const momentumFactorDefinitions: MomentumFactorDefinition[] = [
  // PRICE MOMENTUM
  {
    id: "one-month-price-return",
    name: "1-Month Price Return",
    category: "priceMomentum",
    direction: "higherIsBetter",
    description:
      "Measures the company's share-price performance over the previous month.",
  },
  {
    id: "three-month-price-return",
    name: "3-Month Price Return",
    category: "priceMomentum",
    direction: "higherIsBetter",
    description:
      "Measures the company's share-price performance over the previous three months.",
  },
  {
    id: "six-month-price-return",
    name: "6-Month Price Return",
    category: "priceMomentum",
    direction: "higherIsBetter",
    description:
      "Measures the company's share-price performance over the previous six months.",
  },
  {
    id: "twelve-month-price-return",
    name: "12-Month Price Return",
    category: "priceMomentum",
    direction: "higherIsBetter",
    description:
      "Measures the company's share-price performance over the previous twelve months.",
  },
  {
    id: "relative-strength",
    name: "Relative Strength",
    category: "priceMomentum",
    direction: "higherIsBetter",
    description:
      "Measures share-price performance relative to the wider comparison universe.",
  },

  // EARNINGS MOMENTUM
  {
    id: "earnings-estimate-revisions-three-month",
    name: "3-Month Earnings Estimate Revisions",
    category: "earningsMomentum",
    direction: "higherIsBetter",
    description:
      "Measures the direction and magnitude of analyst earnings estimate revisions during the previous three months.",
  },
  {
    id: "earnings-estimate-revisions-six-month",
    name: "6-Month Earnings Estimate Revisions",
    category: "earningsMomentum",
    direction: "higherIsBetter",
    description:
      "Measures the direction and magnitude of analyst earnings estimate revisions during the previous six months.",
  },
  {
    id: "earnings-surprise",
    name: "Earnings Surprise",
    category: "earningsMomentum",
    direction: "higherIsBetter",
    description:
      "Measures how reported earnings compare with market expectations.",
  },
  {
    id: "revenue-surprise",
    name: "Revenue Surprise",
    category: "earningsMomentum",
    direction: "higherIsBetter",
    description:
      "Measures how reported revenue compares with market expectations.",
  },
  {
    id: "forward-eps-growth",
    name: "Forward EPS Growth",
    category: "earningsMomentum",
    direction: "higherIsBetter",
    description:
      "Measures the expected growth in earnings per share based on forward estimates.",
  },

  // TREND STRENGTH
  {
    id: "price-versus-50-day-moving-average",
    name: "Price vs 50-Day Moving Average",
    category: "trendStrength",
    direction: "higherIsBetter",
    description:
      "Measures the share price relative to its 50-day moving average.",
  },
  {
    id: "price-versus-200-day-moving-average",
    name: "Price vs 200-Day Moving Average",
    category: "trendStrength",
    direction: "higherIsBetter",
    description:
      "Measures the share price relative to its 200-day moving average.",
  },
  {
    id: "fifty-day-versus-200-day-moving-average",
    name: "50-Day vs 200-Day Moving Average",
    category: "trendStrength",
    direction: "higherIsBetter",
    description:
      "Measures the strength of the intermediate trend relative to the longer-term trend.",
  },
  {
    id: "distance-from-52-week-high",
    name: "Distance From 52-Week High",
    category: "trendStrength",
    direction: "higherIsBetter",
    description:
      "Measures how close the current share price is to its 52-week high.",
  },
];