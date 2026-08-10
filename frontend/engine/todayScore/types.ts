export type TodayScorePillar =
  | "quality"
  | "value"
  | "momentum";

export type ComparisonUniverse =
  | "local"
  | "regional"
  | "global";

export interface FactorScore {
  id: string;
  name: string;
  score: number;
  rawValue?: number;
  percentile?: number;
  explanation?: string;
}

export interface PillarScore {
  score: number;
  factors: FactorScore[];
}

export interface QualityScore extends PillarScore {
  profitability: number;
  financialStrength: number;
  cashFlowQuality: number;
  earningsStability: number;
}

export interface ValueScore extends PillarScore {
  relativeValuation: number;
  cashFlowValuation: number;
  historicalValuation: number;
}

export interface MomentumScore extends PillarScore {
  priceMomentum: number;
  earningsMomentum: number;
  trendStrength: number;
}

export interface TodayScoreBreakdown {
  quality: QualityScore;
  value: ValueScore;
  momentum: MomentumScore;
}

export interface TodayScoreResult {
  companyId: string;
  score: number;

  quality: number;
  value: number;
  momentum: number;

  universe: ComparisonUniverse;

  breakdown: TodayScoreBreakdown;

  calculatedAt: string;
}