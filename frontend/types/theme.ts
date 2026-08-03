export type Theme = {
  id: string;
  name: string;
  score: number;

  momentum: string;
  confidence: number;
  lifecycle: string;

  description: string;
  opinion: string;

  why: string[];
  risks: string[];
  etfs: string[];
  companies: string[];
};