import { describe, expect, it } from "vitest";

import {
  auditPortfolioImplementation,
  type PortfolioImplementationPosition,
} from "./portfolioImplementation";

const completePositions:
  PortfolioImplementationPosition[] = [
    {
      companyId: "long-company",
      ticker: "LONG",
      side: "long",
      notional: 10_000,
      averageDailyValueTraded: 1_000_000,
      estimatedRoundTripCostPercentage: 0.2,
      holdingDays: 100,
    },
    {
      companyId: "short-company",
      ticker: "SHORT",
      side: "short",
      notional: 10_000,
      averageDailyValueTraded: 2_000_000,
      borrowAvailable: true,
      annualBorrowFeePercentage: 7.3,
      annualDividendYieldPercentage: 3.65,
      estimatedRoundTripCostPercentage: 0.2,
      holdingDays: 100,
    },
  ];

describe("auditPortfolioImplementation", () => {
  it("builds a complete implementation audit", () => {
    const report =
      auditPortfolioImplementation(
        completePositions,
      );

    expect(report.status).toBe(
      "research-implementable",
    );

    expect(report.totalPositions).toBe(2);
    expect(report.shortPositions).toBe(1);

    expect(
      report.liquidityCoveragePercentage,
    ).toBe(100);

    expect(
      report.borrowCoveragePercentage,
    ).toBe(100);

    expect(
      report.costCoveragePercentage,
    ).toBe(100);

    expect(report.grossNotional).toBe(
      20_000,
    );

    expect(
      report.estimatedCoveredCosts,
    ).toBe(340);

    expect(report.warnings).toHaveLength(0);
    expect(report.blockers).toHaveLength(0);
  });

  it("calculates transaction, borrow and dividend costs", () => {
    const report =
      auditPortfolioImplementation(
        completePositions,
      );

    const longPosition =
      report.positions.find(
        (position) =>
          position.companyId ===
          "long-company",
      );

    const shortPosition =
      report.positions.find(
        (position) =>
          position.companyId ===
          "short-company",
      );

    expect(
      longPosition?.participationPercentage,
    ).toBe(1);

    expect(
      longPosition?.estimatedTransactionCost,
    ).toBe(20);

    expect(
      longPosition?.estimatedTotalCost,
    ).toBe(20);

    expect(
      shortPosition?.participationPercentage,
    ).toBe(0.5);

    expect(
      shortPosition?.estimatedTransactionCost,
    ).toBe(20);

    expect(
      shortPosition?.estimatedBorrowCost,
    ).toBe(200);

    expect(
      shortPosition?.estimatedDividendCost,
    ).toBe(100);

    expect(
      shortPosition?.estimatedTotalCost,
    ).toBe(320);

    expect(
      shortPosition
        ?.estimatedTotalCostPercentage,
    ).toBe(3.2);
  });

  it("reports missing implementation data", () => {
    const report =
      auditPortfolioImplementation([
        {
          companyId: "incomplete-short",
          ticker: "MISS",
          side: "short",
          notional: 10_000,
        },
      ]);

    expect(report.status).toBe("review");

    expect(
      report.liquidityCoveragePercentage,
    ).toBe(0);

    expect(
      report.borrowCoveragePercentage,
    ).toBe(0);

    expect(
      report.costCoveragePercentage,
    ).toBe(0);

    expect(report.blockers).toHaveLength(0);

    expect(
      report.warnings.some((warning) =>
        warning.includes(
          "Average daily value traded is unavailable",
        ),
      ),
    ).toBe(true);

    expect(
      report.warnings.some((warning) =>
        warning.includes(
          "Short-borrow availability has not been confirmed",
        ),
      ),
    ).toBe(true);
  });

  it("blocks a Short when borrow is unavailable", () => {
    const report =
      auditPortfolioImplementation([
        {
          companyId: "unavailable",
          ticker: "NOBR",
          side: "short",
          notional: 10_000,
          averageDailyValueTraded:
            1_000_000,
          borrowAvailable: false,
          annualBorrowFeePercentage: 5,
          annualDividendYieldPercentage: 2,
          estimatedRoundTripCostPercentage:
            0.2,
        },
      ]);

    expect(report.status).toBe("review");

    expect(
      report.blockers,
    ).toContain(
      "NOBR: Short borrow is reported as unavailable.",
    );
  });

  it("blocks excessive liquidity participation", () => {
    const report =
      auditPortfolioImplementation([
        {
          companyId: "illiquid",
          ticker: "ILLIQ",
          side: "long",
          notional: 20_000,
          averageDailyValueTraded:
            100_000,
          estimatedRoundTripCostPercentage:
            0.2,
        },
      ]);

    expect(
      report.positions[0]
        .participationPercentage,
    ).toBe(20);

    expect(
      report.blockers.some((blocker) =>
        blocker.includes(
          "above the configured 1% limit",
        ),
      ),
    ).toBe(true);
  });

  it("blocks an excessive Short borrow fee", () => {
    const report =
      auditPortfolioImplementation([
        {
          companyId: "expensive-short",
          ticker: "COST",
          side: "short",
          notional: 10_000,
          averageDailyValueTraded:
            1_000_000,
          borrowAvailable: true,
          annualBorrowFeePercentage: 15,
          annualDividendYieldPercentage: 2,
          estimatedRoundTripCostPercentage:
            0.2,
        },
      ]);

    expect(
      report.blockers.some((blocker) =>
        blocker.includes(
          "15% exceeds the configured 10% limit",
        ),
      ),
    ).toBe(true);
  });

  it("uses configured thresholds and holding period", () => {
    const report =
      auditPortfolioImplementation(
        [
          {
            companyId: "configured-short",
            ticker: "CONF",
            side: "short",
            notional: 10_000,
            averageDailyValueTraded:
              200_000,
            borrowAvailable: true,
            annualBorrowFeePercentage: 12,
            annualDividendYieldPercentage:
              3.65,
            estimatedRoundTripCostPercentage:
              0,
          },
        ],
        {
          defaultHoldingDays: 100,
          maximumParticipationPercentage:
            6,
          maximumBorrowFeePercentage: 15,
        },
      );

    expect(report.blockers).toHaveLength(0);

    expect(
      report.positions[0].holdingDays,
    ).toBe(100);

    expect(
      report.positions[0]
        .participationPercentage,
    ).toBe(5);

    expect(
      report.positions[0]
        .estimatedBorrowCost,
    ).toBeCloseTo(328.77, 2);

    expect(
      report.positions[0]
        .estimatedDividendCost,
    ).toBe(100);
  });

  it("ignores invalid positions and reports an empty audit", () => {
    const report =
      auditPortfolioImplementation([
        {
          companyId: "",
          side: "long",
          notional: 10_000,
        },
        {
          companyId: "zero",
          side: "short",
          notional: 0,
        },
        {
          companyId: "invalid",
          side: "long",
          notional: Number.NaN,
        },
      ]);

    expect(report.status).toBe(
      "not-assessable",
    );

    expect(report.totalPositions).toBe(0);
    expect(report.grossNotional).toBe(0);

    expect(
      report.warnings,
    ).toContain(
      "No valid portfolio positions are available for implementation review.",
    );
  });
});