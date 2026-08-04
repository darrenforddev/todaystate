export interface ETF {
  id: string;

  name: string;

  ticker: string;

  provider: string;

  score: number;

  confidence: number;

  momentum: string;

  lifecycle: string;

  risk: string;

  opinion: string;

 why: {
    reason: string;
    confidence: number;
    evidence: {
      title: string;
      status: "Positive" | "Neutral" | "Negative";
    }[];
  }[];

  risks: string[];

  topHoldings: {
    id: string;
    name: string;
  }[];

  relatedThemes: {
    id: string;
    name: string;
  }[];
} 