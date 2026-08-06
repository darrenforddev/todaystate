// ============================================================================
// MBIE Knowledge Model
// Version 1
// ============================================================================

export type ReleaseFrequency =
  | "Weekly"
  | "Monthly"
  | "Quarterly"
  | "Annual";

export type Importance = "Low" | "Medium" | "High";

export type RelationshipType =
  | "supports"
  | "opposes"
  | "benefits"
  | "harms"
  | "belongs-to";

export interface Indicator {
  id: string;
  name: string;
  category: string;
  description: string;
  releaseFrequency: ReleaseFrequency;
  importance: Importance;

  thresholds?: {
    expansion?: number;
    contraction?: number;
  };
}

export interface Theme {
  id: string;
  name: string;
  description: string;
}

export interface Industry {
  id: string;
  name: string;
}

export interface Company {
  id: string;
  name: string;
  ticker: string;
  industryId: string;
}

export interface Relationship {
  id: string;
  from: string;
  to: string;
  type: RelationshipType;
  strength: number; // 0–1
}