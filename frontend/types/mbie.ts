export type MBIEOutlook =
  | "Very Positive"
  | "Positive"
  | "Neutral"
  | "Negative"
  | "Very Negative";

export interface MBIEAnalysis {
  id: string;
  title: string;

  score: number;
  confidence: number;
  outlook: MBIEOutlook;

  what: string;
  why: string;
  changed: string;
  watchNext: string;

  evidenceIds: string[];
  risks: string[];

  updatedAt: string;
}