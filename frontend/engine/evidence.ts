export interface Evidence {
  id: string;

  title: string;

  weight: number;

  latestValue: number;

  previousValue: number;

  trend: "improving" | "stable" | "weakening";

  interpretation: string;

  releasedAt: string;
}