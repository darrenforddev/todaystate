export interface Company {
  id: string;

  name: string;

  ticker: string;

  exchange: string;

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

  relatedThemes: {
  id: string;
  name: string;
}[];

  relatedEtfs: string[];
}