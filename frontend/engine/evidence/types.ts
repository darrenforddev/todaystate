export type Direction =
  | "improving"
  | "weakening"
  | "unchanged";

export type Status =
  | "expansion"
  | "contraction"
  | "neutral";

export type Impact =
  | "positive"
  | "negative"
  | "neutral";

export type EvidenceDataVintage =
  | "first-release"
  | "revised";

export type EvidenceUsageScope =
  | "private-research"
  | "licensed";

export interface Evidence {
  indicatorId: string;

  current: number;

  previous: number;

  change: number;

  direction: Direction;

  status: Status;

  impact: Impact;

  explanation: string;
}

/**
 * A permanent point-in-time record of an Evidence Engine result.
 *
 * Evidence remains the calculated interpretation.
 * EvidenceSnapshot adds the identity, provenance and dates required
 * for historical storage, Time Lens navigation and auditing.
 */
export interface EvidenceSnapshot {
  /**
   * Unique identity for this particular monthly release.
   * Example: ism-manufacturing-pmi-2026-08
   */
  id: string;

  /**
   * Stable identity shared by every release of the indicator.
   * Example: ism-manufacturing-pmi
   */
  indicatorKey: string;

  /**
   * Economic reporting period in YYYY-MM format.
   * Example: 2026-08
   */
  reportPeriod: string;

  /**
   * Date on which the source report was published or observed.
   * Stored as an ISO YYYY-MM-DD date.
   */
  observedAt: string;

  /**
   * Whether the figures represent the original publication or
   * a subsequently revised historical series.
   */
  dataVintage?: EvidenceDataVintage;

  /**
   * Original source page used to verify this release.
   */
  sourceUrl?: string;

  /**
   * Current permitted use of the source data.
   */
  usageScope?: EvidenceUsageScope;

  /**
   * The Evidence Engine result calculated from that release.
   */
  evidence: Evidence;
}