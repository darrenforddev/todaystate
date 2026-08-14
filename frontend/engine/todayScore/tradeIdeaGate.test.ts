import {
  describe,
  expect,
  it,
} from "vitest";

import {
  realCompanyDemoMetadata,
} from "../../data/realCompanyDemoMetadata";

import {
  realCompanyDemoResults,
} from "./realCompanyDemoScores";

import {
  buildPortfolioCandidateLists,
  type PortfolioCandidate,
} from "./portfolio";

import {
  buildScreenerCompanies,
} from "./screener";

import {
  buildTradeIdeaDraft,
  type TradeIdea,
  type TradeIdeaDraftInput,
  type TradeIdeaSide,
} from "./tradeIdea";

import {
  evaluateTradeIdeaGate,
} from "./tradeIdeaGate";

const reviewDate =
  "2026-08-14T12:00:00.000Z";

function buildCandidate(
  side: TradeIdeaSide,
): PortfolioCandidate {
  const companies =
    buildScreenerCompanies(
      realCompanyDemoResults,
      realCompanyDemoMetadata,
    );

  const candidates =
    buildPortfolioCandidateLists(
      companies,
    );

  const candidate =
    side === "long"
      ? candidates.longCandidates[0]
      : candidates.shortCandidates[0];

  if (!candidate) {
    throw new Error(
      `No ${side} candidate is available for testing.`,
    );
  }

  return candidate;
}

function buildValidInput(
  side: TradeIdeaSide,
): TradeIdeaDraftInput {
  const isLong = side === "long";

  return {
    id: `gate-${side}-idea`,
    thesis:
      "The proposed position is supported by company, theme and market evidence.",
    contradictoryEvidenceReviewed: true,
    evidence: [
      {
        id: "supportive-evidence",
        title: "Supportive evidence",
        summary:
          "Current research supports the proposed trade direction.",
        source: "TodayState research",
        stance: "supportive",
        observedAt:
          "2026-08-14T08:00:00.000Z",
        confidence: 80,
      },
      {
        id: "contradictory-evidence",
        title: "Contradictory evidence",
        summary:
          "A documented risk could weaken the thesis.",
        source: "TodayState research",
        stance: "contradictory",
        observedAt:
          "2026-08-13T08:00:00.000Z",
        confidence: 55,
      },
    ],
    catalyst: {
      type: "industry",
      description:
        "A scheduled industry release may confirm the thesis.",
      expectedAt: "2026-09-01",
      source: "Industry data release",
      confidence: 75,
    },
    timing: {
      status: "ready",
      entryTrigger:
        "Price confirms the expected directional move.",
      confirmationSignal:
        "Momentum remains aligned with the thesis.",
      observedAt:
        "2026-08-14T09:00:00.000Z",
    },
    risk: {
      entryPrice: 100,
      stopPrice: isLong ? 92 : 108,
      targetPrice: isLong ? 124 : 76,
      stopType: "hard",
      targetType: "soft",
      maximumLoss: 500,
      expectedHoldingDays: 30,
      maximumHoldingDays: 60,
      minimumRewardRiskRatio: 2,
      invalidationCondition:
        "The company or theme evidence reverses materially.",
    },
    createdAt:
      "2026-08-14T10:00:00.000Z",
  };
}

function buildIdea(
  side: TradeIdeaSide = "long",
): TradeIdea {
  return buildTradeIdeaDraft(
    buildCandidate(side),
    buildValidInput(side),
  );
}

describe("evaluateTradeIdeaGate", () => {
  it("marks a complete Long idea as ready", () => {
    const result =
      evaluateTradeIdeaGate(
        buildIdea("long"),
        {
          asOfDate: reviewDate,
        },
      );

    expect(result.status).toBe(
      "ready",
    );

    expect(
      result.canAdvanceToReview,
    ).toBe(true);

    expect(
      result.rewardRiskRatio,
    ).toBe(3);

    expect(result.blockers).toHaveLength(
      0,
    );

    expect(result.warnings).toHaveLength(
      0,
    );

    expect(
      result.freshness
        .freshEvidenceCount,
    ).toBe(2);
  });

  it("marks a complete Short idea as ready", () => {
    const result =
      evaluateTradeIdeaGate(
        buildIdea("short"),
        {
          asOfDate: reviewDate,
        },
      );

    expect(result.status).toBe(
      "ready",
    );

    expect(
      result.canAdvanceToReview,
    ).toBe(true);

    expect(
      result.blockers,
    ).toHaveLength(0);
  });

  it("blocks an idea with no fresh supportive evidence", () => {
    const idea = buildIdea();

    idea.evidence =
      idea.evidence.map(
        (evidence) => ({
          ...evidence,
          observedAt:
            "2026-05-01T08:00:00.000Z",
        }),
      );

    const result =
      evaluateTradeIdeaGate(idea, {
        asOfDate: reviewDate,
        maximumEvidenceAgeDays: 45,
      });

    expect(result.status).toBe(
      "blocked",
    );

    expect(
      result.canAdvanceToReview,
    ).toBe(false);

    expect(
      result.freshness
        .staleEvidenceCount,
    ).toBe(2);

    expect(
      result.blockers.some(
        (issue) =>
          issue.code ===
          "no-fresh-supporting-evidence",
      ),
    ).toBe(true);

    expect(
      result.warnings.some(
        (issue) =>
          issue.code ===
          "stale-evidence",
      ),
    ).toBe(true);
  });

  it("blocks evidence dated in the future", () => {
    const idea = buildIdea();

    idea.evidence[0] = {
      ...idea.evidence[0],
      observedAt:
        "2026-08-20T08:00:00.000Z",
    };

    const result =
      evaluateTradeIdeaGate(idea, {
        asOfDate: reviewDate,
      });

    expect(result.status).toBe(
      "blocked",
    );

    expect(
      result.blockers.some(
        (issue) =>
          issue.code ===
          "future-evidence",
      ),
    ).toBe(true);

    expect(
      result.freshness
        .invalidEvidenceCount,
    ).toBe(1);
  });

  it("blocks a TodayScore inconsistent with the trade direction", () => {
    const longIdea = buildIdea("long");

    longIdea.scoreSnapshot.todayScore =
      60;

    const longResult =
      evaluateTradeIdeaGate(longIdea, {
        asOfDate: reviewDate,
      });

    expect(
      longResult.blockers.some(
        (issue) =>
          issue.code ===
          "score-below-long-threshold",
      ),
    ).toBe(true);

    const shortIdea =
      buildIdea("short");

    shortIdea.scoreSnapshot.todayScore =
      40;

    const shortResult =
      evaluateTradeIdeaGate(
        shortIdea,
        {
          asOfDate: reviewDate,
        },
      );

    expect(
      shortResult.blockers.some(
        (issue) =>
          issue.code ===
          "score-above-short-threshold",
      ),
    ).toBe(true);
  });

  it("blocks an idea while timing is waiting", () => {
    const idea = buildIdea();

    idea.timing = {
      ...idea.timing,
      status: "waiting",
      observedAt: undefined,
    };

    const result =
      evaluateTradeIdeaGate(idea, {
        asOfDate: reviewDate,
      });

    expect(result.status).toBe(
      "blocked",
    );

    expect(
      result.blockers.some(
        (issue) =>
          issue.code ===
          "timing-not-ready",
      ),
    ).toBe(true);
  });

  it("blocks a stale timing signal", () => {
    const idea = buildIdea();

    idea.timing = {
      ...idea.timing,
      observedAt:
        "2026-07-20T09:00:00.000Z",
    };

    const result =
      evaluateTradeIdeaGate(idea, {
        asOfDate: reviewDate,
        maximumTimingAgeDays: 10,
      });

    expect(result.status).toBe(
      "blocked",
    );

    expect(
      result.freshness.timingAgeDays,
    ).toBe(25);

    expect(
      result.blockers.some(
        (issue) =>
          issue.code ===
          "stale-timing-signal",
      ),
    ).toBe(true);
  });

  it("requires review for low confidence and strong contradictory evidence", () => {
    const idea = buildIdea();

    idea.scoreSnapshot.themeConfidence =
      40;

    idea.catalyst = {
      ...idea.catalyst,
      confidence: 35,
    };

    idea.evidence[1] = {
      ...idea.evidence[1],
      confidence: 90,
    };

    const result =
      evaluateTradeIdeaGate(idea, {
        asOfDate: reviewDate,
      });

    expect(result.status).toBe(
      "review-required",
    );

    expect(
      result.canAdvanceToReview,
    ).toBe(true);

    expect(
      result.blockers,
    ).toHaveLength(0);

    expect(
      result.warnings.map(
        (issue) => issue.code,
      ),
    ).toEqual(
      expect.arrayContaining([
        "low-theme-confidence",
        "low-catalyst-confidence",
        "strong-contradictory-evidence",
      ]),
    );
  });

  it("blocks a stale TodayScore snapshot", () => {
    const idea = buildIdea();

    idea.createdAt =
      "2026-07-20T10:00:00.000Z";

    const result =
      evaluateTradeIdeaGate(idea, {
        asOfDate: reviewDate,
        maximumScoreAgeDays: 7,
      });

    expect(result.status).toBe(
      "blocked",
    );

    expect(
      result.freshness
        .scoreSnapshotAgeDays,
    ).toBe(25);

    expect(
      result.blockers.some(
        (issue) =>
          issue.code ===
          "stale-score-snapshot",
      ),
    ).toBe(true);
  });

  it("requires review after the expected catalyst date passes", () => {
    const idea = buildIdea();

    idea.catalyst = {
      ...idea.catalyst,
      expectedAt: "2026-08-10",
    };

    const result =
      evaluateTradeIdeaGate(idea, {
        asOfDate: reviewDate,
      });

    expect(result.status).toBe(
      "review-required",
    );

    expect(
      result.canAdvanceToReview,
    ).toBe(true);

    expect(
      result.warnings.some(
        (issue) =>
          issue.code ===
          "catalyst-date-passed",
      ),
    ).toBe(true);
  });

  it("rejects an invalid review date", () => {
    expect(() =>
      evaluateTradeIdeaGate(
        buildIdea(),
        {
          asOfDate: "not-a-date",
        },
      ),
    ).toThrow(
      "Trade idea gate as-of date must be a valid date.",
    );
  });
});