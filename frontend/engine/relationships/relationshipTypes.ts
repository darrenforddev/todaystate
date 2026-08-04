export type RelationshipStrength =
  | "Very Strong"
  | "Strong"
  | "Moderate"
  | "Weak";

export type RelationshipType =
  | "EvidenceToTheme"
  | "ThemeToCompany"
  | "CompanyToETF"
  | "ThemeToETF"
  | "EvidenceToCompany"
  | "EvidenceToETF";

export interface Relationship {
  id: string;

  type: RelationshipType;

  from: string;

  to: string;

  strength: RelationshipStrength;

  confidence: number;

  reasons: string[];

  evidenceIds: string[];

  updatedAt: string;
}