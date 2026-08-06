export type EvidenceSourceType =
  | "official"
  | "primary"
  | "market"
  | "internal"
  | "secondary"
  | "unverified";

export const sourceQualityRules: Record<
  EvidenceSourceType,
  number
> = {
  official: 100,
  primary: 95,
  market: 85,
  internal: 80,
  secondary: 65,
  unverified: 40,
};

export function getSourceQuality(
  sourceType: EvidenceSourceType
): number {
  return sourceQualityRules[sourceType];
}