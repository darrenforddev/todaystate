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
  calculateTradeIdeaRewardRiskRatio,
  validateTradeIdea,
  type TradeIdeaDraftInput,
  type TradeIdeaSide,
} from "./tradeIdea";

function buildCandidate(
  side: TradeIdeaSide,
): PortfolioCandidate {
  const companies =
    buildScreenerCompanies(
      realCompanyDemoResults,
      realCompanyDemoMetadata,
    );

  const candidateLists =
    buildPortfolioCandidateLists(
      companies,
    );

  const candidate =
    side === "long"
      ? candidateLists.longCandidates[0]
      : candidateLists.shortCandidates[0];

  if (!candidate) {
    throw new Error(
      `No ${side} candidate is available for the test.`,
    );
  }

  return candidate;
}

function buildValidInput(
  side: TradeIdeaSide,
): TradeIdeaDraftInput {
  const isLong = side === "long";

  return {
    id: `test-${side}-idea`,
    thesis: isLong
      ? "The company combines strong fundamentals with supportive theme evidence."
      : "Weak fundamentals and deteriorating theme evidence create downside risk.",
    contradictoryEvidenceReviewed: true,
    evidence: [
      {
        id: "supporting-evidence",
        title: "Primary research evidence",
        summary:
          "The latest evidence supports the direction of the proposed trade.",
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
          "A known risk could weaken the trade thesis.",
        source: "TodayState research",
        stance: "contradictory",
        observedAt:
          "2026-08-14T08:00:00.000Z",
        confidence: 55,
      },
    ],
    catalyst: {
      type: "industry",
      description:
        "An industry update is expected to confirm the directional thesis.",
      expectedAt: "2026-09-01",
      source: "Industry data release",
      confidence: 75,
    },
    timing: {
      status: "ready",
      entryTrigger:
        "Price confirms the expected directional move.",
      confirmationSignal:
        "Momentum remains aligned with the trade direction.",
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
        "The underlying company or theme evidence reverses materially.",
    },
    createdAt:
      "2026-08-14T10:00:00.000Z",
  };
}

describe("buildTradeIdeaDraft", () => {
  it("builds a draft from a portfolio candidate", () => {
    const candidate =
      buildCandidate("long");

    const idea = buildTradeIdeaDraft(
      candidate,
      buildValidInput("long"),
    );

    expect(idea.id).toBe(
      "test-long-idea",
    );

    expect(idea.status).toBe("draft");
    expect(idea.side).toBe("long");

    expect(idea.companyId).toBe(
      candidate.company.companyId,
    );

    expect(idea.ticker).toBe(
      candidate.company.ticker,
    );

    expect(
      idea.scoreSnapshot.todayScore,
    ).toBe(candidate.todayScore);

    expect(
      idea.scoreSnapshot.quality,
    ).toBe(
      candidate.company.result.todayScore
        .quality,
    );

    expect(
      idea.scoreSnapshot.themeId,
    ).toBe(candidate.company.themeId);
  });

  it("rejects a Watch candidate", () => {
    const companies =
      buildScreenerCompanies(
        realCompanyDemoResults,
        realCompanyDemoMetadata,
      );

    const watchCandidate =
      buildPortfolioCandidateLists(
        companies,
      ).watchCandidates[0];

    expect(watchCandidate).toBeDefined();

    expect(() =>
      buildTradeIdeaDraft(
        watchCandidate,
        buildValidInput("long"),
      ),
    ).toThrow(
      "Only Long and Short portfolio candidates can become trade ideas.",
    );
  });
});

describe(
  "calculateTradeIdeaRewardRiskRatio",
  () => {
    it("calculates reward/risk for a Long idea", () => {
      const idea = buildTradeIdeaDraft(
        buildCandidate("long"),
        buildValidInput("long"),
      );

      expect(
        calculateTradeIdeaRewardRiskRatio(
          idea,
        ),
      ).toBe(3);
    });

    it("calculates reward/risk for a Short idea", () => {
      const idea = buildTradeIdeaDraft(
        buildCandidate("short"),
        buildValidInput("short"),
      );

      expect(
        calculateTradeIdeaRewardRiskRatio(
          idea,
        ),
      ).toBe(3);
    });
  },
);

describe("validateTradeIdea", () => {
  it("marks a complete idea as review-ready", () => {
    const idea = buildTradeIdeaDraft(
      buildCandidate("long"),
      buildValidInput("long"),
    );

    const validation =
      validateTradeIdea(idea);

    expect(validation.status).toBe(
      "review-ready",
    );

    expect(
      validation.rewardRiskRatio,
    ).toBe(3);

    expect(
      validation.blockers,
    ).toHaveLength(0);

    expect(
      validation.warnings,
    ).toHaveLength(0);
  });

  it("blocks an incomplete research case", () => {
    const idea = buildTradeIdeaDraft(
      buildCandidate("long"),
      {
        ...buildValidInput("long"),
        thesis: "   ",
        contradictoryEvidenceReviewed:
          false,
        evidence: [],
      },
    );

    const validation =
      validateTradeIdea(idea);

    expect(validation.status).toBe(
      "blocked",
    );

    expect(
      validation.blockers.map(
        (issue) => issue.code,
      ),
    ).toEqual(
      expect.arrayContaining([
        "missing-thesis",
        "missing-supporting-evidence",
        "contradictions-not-reviewed",
      ]),
    );
  });

  it("blocks prices in the wrong order", () => {
    const input =
      buildValidInput("long");

    input.risk = {
      ...input.risk,
      stopPrice: 105,
      targetPrice: 90,
    };

    const idea = buildTradeIdeaDraft(
      buildCandidate("long"),
      input,
    );

    const validation =
      validateTradeIdea(idea);

    expect(
      validation.rewardRiskRatio,
    ).toBeNull();

    expect(
      validation.blockers.some(
        (issue) =>
          issue.code ===
          "invalid-price-order",
      ),
    ).toBe(true);
  });

  it("warns when timing and reward/risk are insufficient", () => {
    const input =
      buildValidInput("long");

    input.timing = {
      ...input.timing,
      status: "waiting",
    };

    input.risk = {
      ...input.risk,
      targetPrice: 108,
      minimumRewardRiskRatio: 2,
    };

    const idea = buildTradeIdeaDraft(
      buildCandidate("long"),
      input,
    );

    const validation =
      validateTradeIdea(idea);

    expect(validation.status).toBe(
      "review-ready",
    );

    expect(
      validation.rewardRiskRatio,
    ).toBe(1);

    expect(
      validation.warnings.map(
        (issue) => issue.code,
      ),
    ).toEqual(
      expect.arrayContaining([
        "timing-not-ready",
        "low-reward-risk",
      ]),
    );
  });

  it("blocks invalid confidence and holding-period data", () => {
    const input =
      buildValidInput("short");

    input.evidence[0] = {
      ...input.evidence[0],
      confidence: 120,
    };

    input.catalyst = {
      ...input.catalyst,
      confidence: -10,
    };

    input.risk = {
      ...input.risk,
      expectedHoldingDays: 90,
      maximumHoldingDays: 60,
    };

    const idea = buildTradeIdeaDraft(
      buildCandidate("short"),
      input,
    );

    const validation =
      validateTradeIdea(idea);

    expect(validation.status).toBe(
      "blocked",
    );

    expect(
      validation.blockers.map(
        (issue) => issue.code,
      ),
    ).toEqual(
      expect.arrayContaining([
        "invalid-evidence-confidence",
        "invalid-catalyst-confidence",
        "invalid-holding-period",
      ]),
    );
  });
});