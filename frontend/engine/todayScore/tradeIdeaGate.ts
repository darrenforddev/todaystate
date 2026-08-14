import {
  validateTradeIdea,
  type TradeIdea,
  type TradeIdeaValidationIssue,
} from "./tradeIdea";

export type TradeIdeaGateStatus =
  | "blocked"
  | "review-required"
  | "ready";

export type TradeIdeaGateSeverity =
  | "blocker"
  | "warning";

export type TradeIdeaGateCode =
  | "trade-idea-validation"
  | "invalid-as-of-date"
  | "invalid-evidence-date"
  | "future-evidence"
  | "stale-evidence"
  | "no-fresh-supporting-evidence"
  | "score-below-long-threshold"
  | "score-above-short-threshold"
  | "low-theme-confidence"
  | "low-catalyst-confidence"
  | "invalid-catalyst-date"
  | "catalyst-date-passed"
  | "timing-not-ready"
  | "missing-timing-date"
  | "invalid-timing-date"
  | "future-timing-signal"
  | "stale-timing-signal"
  | "invalid-score-snapshot-date"
  | "future-score-snapshot"
  | "stale-score-snapshot"
  | "strong-contradictory-evidence";

export interface TradeIdeaGateOptions {
  asOfDate?: string;
  maximumEvidenceAgeDays?: number;
  maximumTimingAgeDays?: number;
  maximumScoreAgeDays?: number;
  minimumLongTodayScore?: number;
  maximumShortTodayScore?: number;
  minimumThemeConfidence?: number;
  minimumCatalystConfidence?: number;
  requireTimingReady?: boolean;
}

export interface TradeIdeaGateIssue {
  code: TradeIdeaGateCode;
  severity: TradeIdeaGateSeverity;
  message: string;
  sourceCode?: string;
}

export interface TradeIdeaGateFreshness {
  evidenceCount: number;
  freshEvidenceCount: number;
  staleEvidenceCount: number;
  invalidEvidenceCount: number;
  freshestEvidenceAgeDays: number | null;
  timingAgeDays: number | null;
  scoreSnapshotAgeDays: number | null;
}

export interface TradeIdeaGateResult {
  status: TradeIdeaGateStatus;
  canAdvanceToReview: boolean;
  asOfDate: string;
  rewardRiskRatio: number | null;
  blockers: TradeIdeaGateIssue[];
  warnings: TradeIdeaGateIssue[];
  strengths: string[];
  freshness: TradeIdeaGateFreshness;
  methodology: string;
}

interface NormalisedGateOptions {
  asOfDate: string;
  asOfTimestamp: number;
  maximumEvidenceAgeDays: number;
  maximumTimingAgeDays: number;
  maximumScoreAgeDays: number;
  minimumLongTodayScore: number;
  maximumShortTodayScore: number;
  minimumThemeConfidence: number;
  minimumCatalystConfidence: number;
  requireTimingReady: boolean;
}

const millisecondsPerDay =
  24 * 60 * 60 * 1000;

function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.min(
    maximum,
    Math.max(minimum, value),
  );
}

function normalisePositiveInteger(
  value: number | undefined,
  fallback: number,
): number {
  if (
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return fallback;
  }

  return Math.max(1, Math.floor(value));
}

function normaliseScore(
  value: number | undefined,
  fallback: number,
): number {
  if (
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return fallback;
  }

  return clamp(value, 0, 100);
}

function normaliseOptions(
  options: TradeIdeaGateOptions,
): NormalisedGateOptions {
  const asOfDate =
    options.asOfDate ??
    new Date().toISOString();

  const asOfTimestamp =
    Date.parse(asOfDate);

  if (!Number.isFinite(asOfTimestamp)) {
    throw new Error(
      "Trade idea gate as-of date must be a valid date.",
    );
  }

  return {
    asOfDate,
    asOfTimestamp,
    maximumEvidenceAgeDays:
      normalisePositiveInteger(
        options.maximumEvidenceAgeDays,
        45,
      ),
    maximumTimingAgeDays:
      normalisePositiveInteger(
        options.maximumTimingAgeDays,
        10,
      ),
    maximumScoreAgeDays:
      normalisePositiveInteger(
        options.maximumScoreAgeDays,
        7,
      ),
    minimumLongTodayScore:
      normaliseScore(
        options.minimumLongTodayScore,
        65,
      ),
    maximumShortTodayScore:
      normaliseScore(
        options.maximumShortTodayScore,
        35,
      ),
    minimumThemeConfidence:
      normaliseScore(
        options.minimumThemeConfidence,
        50,
      ),
    minimumCatalystConfidence:
      normaliseScore(
        options.minimumCatalystConfidence,
        50,
      ),
    requireTimingReady:
      options.requireTimingReady ?? true,
  };
}

function calculateAgeDays(
  date: string,
  asOfTimestamp: number,
): number | null {
  const timestamp = Date.parse(date);

  if (!Number.isFinite(timestamp)) {
    return null;
  }

  return Math.floor(
    (asOfTimestamp - timestamp) /
      millisecondsPerDay,
  );
}

function convertValidationIssue(
  issue: TradeIdeaValidationIssue,
): TradeIdeaGateIssue {
  return {
    code: "trade-idea-validation",
    severity: issue.severity,
    message: issue.message,
    sourceCode: issue.code,
  };
}

export function evaluateTradeIdeaGate(
  idea: TradeIdea,
  options: TradeIdeaGateOptions = {},
): TradeIdeaGateResult {
  const settings =
    normaliseOptions(options);

  const validation =
    validateTradeIdea(idea);

  const blockers: TradeIdeaGateIssue[] =
    validation.blockers.map(
      convertValidationIssue,
    );

  const warnings: TradeIdeaGateIssue[] =
    validation.warnings.map(
      convertValidationIssue,
    );

  const strengths: string[] = [];

  function addBlocker(
    code: TradeIdeaGateCode,
    message: string,
  ): void {
    blockers.push({
      code,
      severity: "blocker",
      message,
    });
  }

  function addWarning(
    code: TradeIdeaGateCode,
    message: string,
  ): void {
    warnings.push({
      code,
      severity: "warning",
      message,
    });
  }

  if (validation.blockers.length === 0) {
    strengths.push(
      "The core trade idea is structurally complete.",
    );
  }

  const evidenceAges =
    idea.evidence.map((evidence) => ({
      evidence,
      ageDays: calculateAgeDays(
        evidence.observedAt,
        settings.asOfTimestamp,
      ),
    }));

  let freshEvidenceCount = 0;
  let staleEvidenceCount = 0;
  let invalidEvidenceCount = 0;

  for (const item of evidenceAges) {
    if (item.ageDays === null) {
      invalidEvidenceCount += 1;

      addBlocker(
        "invalid-evidence-date",
        `Evidence "${item.evidence.title}" has an invalid observation date.`,
      );

      continue;
    }

    if (item.ageDays < 0) {
      invalidEvidenceCount += 1;

      addBlocker(
        "future-evidence",
        `Evidence "${item.evidence.title}" is dated in the future relative to the gate review.`,
      );

      continue;
    }

    if (
      item.ageDays >
      settings.maximumEvidenceAgeDays
    ) {
      staleEvidenceCount += 1;

      addWarning(
        "stale-evidence",
        `Evidence "${item.evidence.title}" is ${item.ageDays} days old and exceeds the ${settings.maximumEvidenceAgeDays}-day freshness limit.`,
      );

      continue;
    }

    freshEvidenceCount += 1;
  }

  const supportiveEvidence =
    evidenceAges.filter(
      (item) =>
        item.evidence.stance ===
        "supportive",
    );

  const freshSupportiveEvidence =
    supportiveEvidence.filter(
      (item) =>
        item.ageDays !== null &&
        item.ageDays >= 0 &&
        item.ageDays <=
          settings.maximumEvidenceAgeDays,
    );

  if (
    supportiveEvidence.length > 0 &&
    freshSupportiveEvidence.length === 0
  ) {
    addBlocker(
      "no-fresh-supporting-evidence",
      "No supportive evidence remains within the configured freshness window.",
    );
  }

  if (
    freshSupportiveEvidence.length > 0
  ) {
    strengths.push(
      `${freshSupportiveEvidence.length} supportive evidence item${
        freshSupportiveEvidence.length === 1
          ? " is"
          : "s are"
      } within the freshness window.`,
    );
  }

  const supportingConfidence =
    idea.evidence
      .filter(
        (evidence) =>
          evidence.stance ===
          "supportive",
      )
      .map(
        (evidence) =>
          evidence.confidence,
      );

  const contradictoryConfidence =
    idea.evidence
      .filter(
        (evidence) =>
          evidence.stance ===
          "contradictory",
      )
      .map(
        (evidence) =>
          evidence.confidence,
      );

  const strongestSupporting =
    supportingConfidence.length === 0
      ? null
      : Math.max(
          ...supportingConfidence,
        );

  const strongestContradictory =
    contradictoryConfidence.length === 0
      ? null
      : Math.max(
          ...contradictoryConfidence,
        );

  if (
    strongestSupporting !== null &&
    strongestContradictory !== null &&
    strongestContradictory >=
      strongestSupporting
  ) {
    addWarning(
      "strong-contradictory-evidence",
      `The strongest contradictory evidence confidence (${strongestContradictory}%) equals or exceeds the strongest supportive evidence confidence (${strongestSupporting}%).`,
    );
  }

  const todayScore =
    idea.scoreSnapshot.todayScore;

  if (
    idea.side === "long" &&
    todayScore <
      settings.minimumLongTodayScore
  ) {
    addBlocker(
      "score-below-long-threshold",
      `The Long idea TodayScore of ${todayScore} is below the configured threshold of ${settings.minimumLongTodayScore}.`,
    );
  }

  if (
    idea.side === "short" &&
    todayScore >
      settings.maximumShortTodayScore
  ) {
    addBlocker(
      "score-above-short-threshold",
      `The Short idea TodayScore of ${todayScore} is above the configured threshold of ${settings.maximumShortTodayScore}.`,
    );
  }

  if (
    (idea.side === "long" &&
      todayScore >=
        settings.minimumLongTodayScore) ||
    (idea.side === "short" &&
      todayScore <=
        settings.maximumShortTodayScore)
  ) {
    strengths.push(
      `The TodayScore remains consistent with the ${idea.side.toUpperCase()} direction.`,
    );
  }

  if (
    idea.scoreSnapshot.themeConfidence <
    settings.minimumThemeConfidence
  ) {
    addWarning(
      "low-theme-confidence",
      `Theme confidence of ${idea.scoreSnapshot.themeConfidence}% is below the configured review level of ${settings.minimumThemeConfidence}%.`,
    );
  } else {
    strengths.push(
      "Theme confidence meets the configured review level.",
    );
  }

  if (
    idea.catalyst.confidence <
    settings.minimumCatalystConfidence
  ) {
    addWarning(
      "low-catalyst-confidence",
      `Catalyst confidence of ${idea.catalyst.confidence}% is below the configured review level of ${settings.minimumCatalystConfidence}%.`,
    );
  } else {
    strengths.push(
      "Catalyst confidence meets the configured review level.",
    );
  }

  if (idea.catalyst.expectedAt) {
    const catalystAgeDays =
      calculateAgeDays(
        idea.catalyst.expectedAt,
        settings.asOfTimestamp,
      );

    if (catalystAgeDays === null) {
      addBlocker(
        "invalid-catalyst-date",
        "The expected catalyst date is invalid.",
      );
    } else if (catalystAgeDays > 0) {
      addWarning(
        "catalyst-date-passed",
        `The expected catalyst date passed ${catalystAgeDays} day${
          catalystAgeDays === 1
            ? ""
            : "s"
        } before this review and its outcome should be reassessed.`,
      );
    }
  }

  let timingAgeDays: number | null =
    null;

  if (
    settings.requireTimingReady &&
    idea.timing.status !== "ready"
  ) {
    addBlocker(
      "timing-not-ready",
      idea.timing.status ===
        "invalidated"
        ? "The entry timing signal has been invalidated."
        : "The entry timing signal has not yet become ready.",
    );
  }

  if (idea.timing.status === "ready") {
    if (!idea.timing.observedAt) {
      addBlocker(
        "missing-timing-date",
        "A ready timing signal requires an observation date.",
      );
    } else {
      timingAgeDays =
        calculateAgeDays(
          idea.timing.observedAt,
          settings.asOfTimestamp,
        );

      if (timingAgeDays === null) {
        addBlocker(
          "invalid-timing-date",
          "The timing signal observation date is invalid.",
        );
      } else if (timingAgeDays < 0) {
        addBlocker(
          "future-timing-signal",
          "The timing signal is dated in the future relative to the gate review.",
        );
      } else if (
        timingAgeDays >
        settings.maximumTimingAgeDays
      ) {
        addBlocker(
          "stale-timing-signal",
          `The timing signal is ${timingAgeDays} days old and exceeds the ${settings.maximumTimingAgeDays}-day limit.`,
        );
      } else {
        strengths.push(
          "The entry timing signal is ready and current.",
        );
      }
    }
  }

  const scoreSnapshotAgeDays =
    calculateAgeDays(
      idea.createdAt,
      settings.asOfTimestamp,
    );

  if (scoreSnapshotAgeDays === null) {
    addBlocker(
      "invalid-score-snapshot-date",
      "The TodayScore snapshot date is invalid.",
    );
  } else if (scoreSnapshotAgeDays < 0) {
    addBlocker(
      "future-score-snapshot",
      "The TodayScore snapshot is dated in the future relative to the gate review.",
    );
  } else if (
    scoreSnapshotAgeDays >
    settings.maximumScoreAgeDays
  ) {
    addBlocker(
      "stale-score-snapshot",
      `The TodayScore snapshot is ${scoreSnapshotAgeDays} days old and exceeds the ${settings.maximumScoreAgeDays}-day limit.`,
    );
  } else {
    strengths.push(
      "The TodayScore snapshot is current.",
    );
  }

  const validEvidenceAges =
    evidenceAges
      .map((item) => item.ageDays)
      .filter(
        (age): age is number =>
          age !== null && age >= 0,
      );

  const freshestEvidenceAgeDays =
    validEvidenceAges.length === 0
      ? null
      : Math.min(...validEvidenceAges);

  const status: TradeIdeaGateStatus =
    blockers.length > 0
      ? "blocked"
      : warnings.length > 0
        ? "review-required"
        : "ready";

  return {
    status,
    canAdvanceToReview:
      blockers.length === 0,
    asOfDate: settings.asOfDate,
    rewardRiskRatio:
      validation.rewardRiskRatio,
    blockers,
    warnings,
    strengths,
    freshness: {
      evidenceCount:
        idea.evidence.length,
      freshEvidenceCount,
      staleEvidenceCount,
      invalidEvidenceCount,
      freshestEvidenceAgeDays,
      timingAgeDays,
      scoreSnapshotAgeDays,
    },
    methodology:
      "The gate checks structural validation, evidence freshness, TodayScore direction, theme and catalyst confidence, timing readiness and snapshot freshness. Warnings require human review; blockers prevent advancement.",
  };
}