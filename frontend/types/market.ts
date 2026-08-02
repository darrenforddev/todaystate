export type MarketResult = {
  probability: number;
  marketState: string;
  confidence: string;
  confidenceScore: number;
  risk: string;
  positiveDrivers: string[];
  negativeDrivers: string[];
};