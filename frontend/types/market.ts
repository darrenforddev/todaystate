export type MarketResult = {
  probability: number;
  marketState: string;
  confidence: string;
  confidenceScore: number;
  risk: string;
  headline: string;
  summary: string;
  positiveDrivers: string[];
  negativeDrivers: string[];
};