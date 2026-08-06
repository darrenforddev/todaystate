export interface ConfidenceFactor {
  name: string;
  score: number;
  weight: number;
}

export interface ConfidenceResult {
  overall: number;
  rating: "Low" | "Medium" | "High" | "Very High";
  factors: ConfidenceFactor[];
}