export interface ThemeEvidence {
  title: string;
  status: "Positive" | "Neutral" | "Negative";
}

export type Theme = {
  id: string;
  name: string;
  score: number;

  momentum: string;
  confidence: number;
  lifecycle: string;
  risk: string;

  description: string;
  opinion: string;

  why: {
  reason: string;
  confidence: number;
  evidence: ThemeEvidence[];
}[];
  risks: string[];
  etfs: string[];
  companies: {
  id: string;
  name: string;
}[];
};