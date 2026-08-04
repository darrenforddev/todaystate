export type MarketPhase =
  | "Expansion"
  | "Neutral"
  | "Slowdown"
  | "Contraction";

export type MarketSignal =
  | "Strong Positive"
  | "Positive"
  | "Neutral"
  | "Negative"
  | "Strong Negative";

export interface MarketBrainResult {
  score: number;
  confidence: number;
  phase: MarketPhase;
  signal: MarketSignal;
}

export function getMarketBrain(): MarketBrainResult {
  return {
    score: 84,
    confidence: 91,
    phase: "Expansion",
    signal: "Strong Positive",
  };
}