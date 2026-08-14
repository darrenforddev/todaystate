import type { PortfolioCandidate } from "./portfolio";

export type TradeIdeaSide = "long" | "short";

export type TradeIdeaStatus =
  | "draft"
  | "review-ready"
  | "approved"
  | "entered"
  | "closed"
  | "rejected";

export type TradeIdeaEvidenceStance =
  | "supportive"
  | "contradictory"
  | "neutral";

export type TradeIdeaCatalystType =
  | "company"
  | "earnings"
  | "industry"
  | "macro"
  | "valuation"
  | "technical"
  | "other";

export type TradeIdeaTimingStatus =
  | "waiting"
  | "ready"
  | "invalidated";

export type TradeIdeaStopType =
  | "hard"
  | "manual";

export type TradeIdeaTargetType =
  | "soft"
  | "hard";

export interface TradeIdeaEvidence {
  id: string;
  title: string;
  summary: string;
  source: string;
  stance: TradeIdeaEvidenceStance;
  observedAt: string;
  confidence: number;
}

export interface TradeIdeaCatalyst {
  type: TradeIdeaCatalystType;
  description: string;
  expectedAt?: string;
  source: string;
  confidence: number;
}

export interface TradeIdeaTimingPlan {
  status: TradeIdeaTimingStatus;
  entryTrigger: string;
  confirmationSignal: string;
  observedAt?: string;
}

export interface TradeIdeaRiskPlan {
  entryPrice: number;
  stopPrice: number;
  targetPrice: number;
  stopType: TradeIdeaStopType;
  targetType: TradeIdeaTargetType;
  maximumLoss: number;
  expectedHoldingDays: number;
  maximumHoldingDays: number;
  minimumRewardRiskRatio: number;
  invalidationCondition: string;
}

export interface TradeIdeaScoreSnapshot {
  todayScore: number;
  quality: number;
  value: number;
  momentum: number;
  decision: TradeIdeaSide;
  themeId: string;
  themeName: string;
  themeConfidence: number;
}

export interface TradeIdea {
  id: string;
  companyId: string;
  ticker: string;
  companyName: string;
  side: TradeIdeaSide;
  status: TradeIdeaStatus;
  thesis: string;
  contradictoryEvidenceReviewed: boolean;
  evidence: TradeIdeaEvidence[];
  catalyst: TradeIdeaCatalyst;
  timing: TradeIdeaTimingPlan;
  risk: TradeIdeaRiskPlan;
  scoreSnapshot: TradeIdeaScoreSnapshot;
  createdAt: string;
  updatedAt: string;
}

export interface TradeIdeaDraftInput {
  id?: string;
  thesis: string;
  contradictoryEvidenceReviewed: boolean;
  evidence: TradeIdeaEvidence[];
  catalyst: TradeIdeaCatalyst;
  timing: TradeIdeaTimingPlan;
  risk: TradeIdeaRiskPlan;
  createdAt?: string;
}

export type TradeIdeaValidationSeverity =
  | "blocker"
  | "warning";

export type TradeIdeaValidationCode =
  | "missing-thesis"
  | "missing-supporting-evidence"
  | "contradictions-not-reviewed"
  | "invalid-evidence-confidence"
  | "missing-catalyst"
  | "invalid-catalyst-confidence"
  | "missing-entry-trigger"
  | "timing-not-ready"
  | "missing-invalidation"
  | "invalid-price"
  | "invalid-price-order"
  | "invalid-maximum-loss"
  | "invalid-holding-period"
  | "low-reward-risk";

export interface TradeIdeaValidationIssue {
  code: TradeIdeaValidationCode;
  severity: TradeIdeaValidationSeverity;
  message: string;
}

export interface TradeIdeaValidationResult {
  status: "blocked" | "review-ready";
  rewardRiskRatio: number | null;
  blockers: TradeIdeaValidationIssue[];
  warnings: TradeIdeaValidationIssue[];
}

function isFinitePositiveNumber(
  value: number,
): boolean {
  return Number.isFinite(value) && value > 0;
}

function normaliseText(value: string): string {
  return value.trim();
}

function getCandidateSide(
  candidate: PortfolioCandidate,
): TradeIdeaSide {
  const decision = candidate.company.decision;

  if (
    decision !== "long" &&
    decision !== "short"
  ) {
    throw new Error(
      "Only Long and Short portfolio candidates can become trade ideas.",
    );
  }

  return decision;
}

function buildDefaultIdeaId(
  companyId: string,
  createdAt: string,
): string {
  const safeCompanyId = companyId
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const safeTimestamp = createdAt.replace(
    /[^0-9]/g,
    "",
  );

  return `trade-${safeCompanyId}-${safeTimestamp}`;
}

export function calculateTradeIdeaRewardRiskRatio(
  idea: Pick<TradeIdea, "side" | "risk">,
): number | null {
  const {
    entryPrice,
    stopPrice,
    targetPrice,
  } = idea.risk;

  if (
    !isFinitePositiveNumber(entryPrice) ||
    !isFinitePositiveNumber(stopPrice) ||
    !isFinitePositiveNumber(targetPrice)
  ) {
    return null;
  }

  const risk =
    idea.side === "long"
      ? entryPrice - stopPrice
      : stopPrice - entryPrice;

  const reward =
    idea.side === "long"
      ? targetPrice - entryPrice
      : entryPrice - targetPrice;

  if (risk <= 0 || reward <= 0) {
    return null;
  }

  return Math.round((reward / risk) * 100) / 100;
}

export function buildTradeIdeaDraft(
  candidate: PortfolioCandidate,
  input: TradeIdeaDraftInput,
): TradeIdea {
  const side = getCandidateSide(candidate);

  const createdAt =
    input.createdAt ?? new Date().toISOString();

  const company = candidate.company;

  return {
    id:
      normaliseText(input.id ?? "") ||
      buildDefaultIdeaId(
        company.companyId,
        createdAt,
      ),
    companyId: company.companyId,
    ticker: company.ticker,
    companyName: company.companyName,
    side,
    status: "draft",
    thesis: normaliseText(input.thesis),
    contradictoryEvidenceReviewed:
      input.contradictoryEvidenceReviewed,
    evidence: input.evidence.map((evidence) => ({
      ...evidence,
      id: normaliseText(evidence.id),
      title: normaliseText(evidence.title),
      summary: normaliseText(
        evidence.summary,
      ),
      source: normaliseText(evidence.source),
    })),
    catalyst: {
      ...input.catalyst,
      description: normaliseText(
        input.catalyst.description,
      ),
      source: normaliseText(
        input.catalyst.source,
      ),
    },
    timing: {
      ...input.timing,
      entryTrigger: normaliseText(
        input.timing.entryTrigger,
      ),
      confirmationSignal: normaliseText(
        input.timing.confirmationSignal,
      ),
    },
    risk: {
      ...input.risk,
      invalidationCondition: normaliseText(
        input.risk.invalidationCondition,
      ),
    },
    scoreSnapshot: {
      todayScore:
        company.result.todayScore.score,
      quality:
        company.result.todayScore.quality,
      value:
        company.result.todayScore.value,
      momentum:
        company.result.todayScore.momentum,
      decision: side,
      themeId: company.themeId,
      themeName: company.themeName,
      themeConfidence:
        company.themeConfidence,
    },
    createdAt,
    updatedAt: createdAt,
  };
}

export function validateTradeIdea(
  idea: TradeIdea,
): TradeIdeaValidationResult {
  const issues: TradeIdeaValidationIssue[] =
    [];

  function addIssue(
    code: TradeIdeaValidationCode,
    severity: TradeIdeaValidationSeverity,
    message: string,
  ): void {
    issues.push({
      code,
      severity,
      message,
    });
  }

  if (!normaliseText(idea.thesis)) {
    addIssue(
      "missing-thesis",
      "blocker",
      "A written trade thesis is required.",
    );
  }

  const supportingEvidence =
    idea.evidence.filter(
      (evidence) =>
        evidence.stance === "supportive",
    );

  if (supportingEvidence.length === 0) {
    addIssue(
      "missing-supporting-evidence",
      "blocker",
      "At least one item of supportive evidence is required.",
    );
  }

  if (!idea.contradictoryEvidenceReviewed) {
    addIssue(
      "contradictions-not-reviewed",
      "blocker",
      "Contradictory evidence must be reviewed before the idea can proceed.",
    );
  }

  if (
    idea.evidence.some(
      (evidence) =>
        !Number.isFinite(
          evidence.confidence,
        ) ||
        evidence.confidence < 0 ||
        evidence.confidence > 100,
    )
  ) {
    addIssue(
      "invalid-evidence-confidence",
      "blocker",
      "Evidence confidence values must be between 0 and 100.",
    );
  }

  if (
    !normaliseText(
      idea.catalyst.description,
    ) ||
    !normaliseText(idea.catalyst.source)
  ) {
    addIssue(
      "missing-catalyst",
      "blocker",
      "The trade idea requires a documented catalyst and source.",
    );
  }

  if (
    !Number.isFinite(
      idea.catalyst.confidence,
    ) ||
    idea.catalyst.confidence < 0 ||
    idea.catalyst.confidence > 100
  ) {
    addIssue(
      "invalid-catalyst-confidence",
      "blocker",
      "Catalyst confidence must be between 0 and 100.",
    );
  }

  if (
    !normaliseText(
      idea.timing.entryTrigger,
    )
  ) {
    addIssue(
      "missing-entry-trigger",
      "blocker",
      "A defined entry trigger is required.",
    );
  }

  if (idea.timing.status !== "ready") {
    addIssue(
      "timing-not-ready",
      "warning",
      idea.timing.status === "invalidated"
        ? "The timing plan has been invalidated."
        : "The entry timing signal is still waiting for confirmation.",
    );
  }

  if (
    !normaliseText(
      idea.risk.invalidationCondition,
    )
  ) {
    addIssue(
      "missing-invalidation",
      "blocker",
      "A clear thesis-invalidation condition is required.",
    );
  }

  const prices = [
    idea.risk.entryPrice,
    idea.risk.stopPrice,
    idea.risk.targetPrice,
  ];

  if (
    prices.some(
      (price) =>
        !isFinitePositiveNumber(price),
    )
  ) {
    addIssue(
      "invalid-price",
      "blocker",
      "Entry, stop and target prices must be finite positive numbers.",
    );
  }

  const rewardRiskRatio =
    calculateTradeIdeaRewardRiskRatio(idea);

  if (
    prices.every(isFinitePositiveNumber) &&
    rewardRiskRatio === null
  ) {
    addIssue(
      "invalid-price-order",
      "blocker",
      idea.side === "long"
        ? "A Long idea requires stop price below entry and target price above entry."
        : "A Short idea requires target price below entry and stop price above entry.",
    );
  }

  if (
    !isFinitePositiveNumber(
      idea.risk.maximumLoss,
    )
  ) {
    addIssue(
      "invalid-maximum-loss",
      "blocker",
      "Maximum planned loss must be a finite positive amount.",
    );
  }

  if (
    !Number.isFinite(
      idea.risk.expectedHoldingDays,
    ) ||
    idea.risk.expectedHoldingDays <= 0 ||
    !Number.isFinite(
      idea.risk.maximumHoldingDays,
    ) ||
    idea.risk.maximumHoldingDays <= 0 ||
    idea.risk.expectedHoldingDays >
      idea.risk.maximumHoldingDays
  ) {
    addIssue(
      "invalid-holding-period",
      "blocker",
      "Holding periods must be positive and the expected period cannot exceed the maximum.",
    );
  }

  if (
    rewardRiskRatio !== null &&
    isFinitePositiveNumber(
      idea.risk.minimumRewardRiskRatio,
    ) &&
    rewardRiskRatio <
      idea.risk.minimumRewardRiskRatio
  ) {
    addIssue(
      "low-reward-risk",
      "warning",
      `The planned reward/risk ratio of ${rewardRiskRatio.toFixed(
        2,
      )} is below the configured minimum of ${idea.risk.minimumRewardRiskRatio.toFixed(
        2,
      )}.`,
    );
  }

  const blockers = issues.filter(
    (issue) =>
      issue.severity === "blocker",
  );

  const warnings = issues.filter(
    (issue) =>
      issue.severity === "warning",
  );

  return {
    status:
      blockers.length === 0
        ? "review-ready"
        : "blocked",
    rewardRiskRatio,
    blockers,
    warnings,
  };
}