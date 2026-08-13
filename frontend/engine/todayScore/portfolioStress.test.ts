import { describe, expect, it } from "vitest";

import {
  calculatePortfolioStress,
  defaultMarketStressScenarios,
  type PortfolioStressPosition,
} from "./portfolioStress";

const unequalBetaPositions:
  PortfolioStressPosition[] = [
    {
      companyId: "long-company",
      ticker: "LONG",
      side: "long",
      notional: 10_000,
      beta: 1.4,
    },
    {
      companyId: "short-company",
      ticker: "SHORT",
      side: "short",
      notional: 10_000,
      beta: 0.6,
    },
  ];

describe("calculatePortfolioStress", () => {
  it("calculates losses from a market decline", () => {
    const report = calculatePortfolioStress(
      unequalBetaPositions,
      {
        scenarios: [
          {
            id: "down-10",
            name: "Market down 10%",
            marketMovePercentage: -10,
          },
        ],
      },
    );

    expect(report.scenarios).toHaveLength(1);

    const scenario = report.scenarios[0];

    expect(scenario.longProfitLoss).toBe(
      -1_400,
    );

    expect(scenario.shortProfitLoss).toBe(
      600,
    );

    expect(scenario.netProfitLoss).toBe(
      -800,
    );

    expect(
      scenario.returnOnCoveredGrossPercentage,
    ).toBe(-4);

    expect(scenario.positions).toHaveLength(
      2,
    );
  });

  it("calculates gains from a market advance", () => {
    const report = calculatePortfolioStress(
      unequalBetaPositions,
      {
        scenarios: [
          {
            id: "up-10",
            name: "Market up 10%",
            marketMovePercentage: 10,
          },
        ],
      },
    );

    const scenario = report.scenarios[0];

    expect(scenario.longProfitLoss).toBe(
      1_400,
    );

    expect(scenario.shortProfitLoss).toBe(
      -600,
    );

    expect(scenario.netProfitLoss).toBe(
      800,
    );

    expect(
      scenario.returnOnCoveredGrossPercentage,
    ).toBe(4);
  });

  it("recognises an equal-notional equal-beta hedge", () => {
    const report = calculatePortfolioStress(
      [
        {
          companyId: "long-company",
          side: "long",
          notional: 10_000,
          beta: 0.8,
        },
        {
          companyId: "short-company",
          side: "short",
          notional: 10_000,
          beta: 0.8,
        },
      ],
      {
        scenarios: [
          {
            id: "down-20",
            name: "Market down 20%",
            marketMovePercentage: -20,
          },
          {
            id: "up-20",
            name: "Market up 20%",
            marketMovePercentage: 20,
          },
        ],
      },
    );

    expect(
      report.scenarios.every(
        (scenario) =>
          scenario.netProfitLoss === 0,
      ),
    ).toBe(true);

    expect(
      report.scenarios.every(
        (scenario) =>
          scenario
            .returnOnCoveredGrossPercentage ===
          0,
      ),
    ).toBe(true);
  });

  it("reports partial beta and notional coverage", () => {
    const report = calculatePortfolioStress(
      [
        {
          companyId: "covered",
          side: "long",
          notional: 10_000,
          beta: 1.1,
        },
        {
          companyId: "not-covered",
          side: "short",
          notional: 15_000,
        },
      ],
      {
        scenarios: [
          {
            id: "down-5",
            name: "Market down 5%",
            marketMovePercentage: -5,
          },
        ],
      },
    );

    expect(report.totalPositions).toBe(2);
    expect(report.coveredPositions).toBe(1);
    expect(report.coveragePercentage).toBe(
      50,
    );

    expect(report.grossNotional).toBe(
      25_000,
    );

    expect(
      report.coveredGrossNotional,
    ).toBe(10_000);

    expect(
      report.notionalCoveragePercentage,
    ).toBe(40);

    expect(
      report.warnings.some((warning) =>
        warning.includes(
          "cover 1 of 2 valid positions",
        ),
      ),
    ).toBe(true);
  });

  it("ignores invalid positions", () => {
    const report = calculatePortfolioStress(
      [
        ...unequalBetaPositions,
        {
          companyId: "",
          side: "long",
          notional: 10_000,
          beta: 1,
        },
        {
          companyId: "zero-notional",
          side: "short",
          notional: 0,
          beta: 1,
        },
        {
          companyId: "invalid-notional",
          side: "long",
          notional: Number.NaN,
          beta: 1,
        },
      ],
      {
        scenarios: [
          {
            id: "down-10",
            name: "Market down 10%",
            marketMovePercentage: -10,
          },
        ],
      },
    );

    expect(report.totalPositions).toBe(2);
    expect(report.coveredPositions).toBe(2);
    expect(report.grossNotional).toBe(
      20_000,
    );
  });

  it("normalises and deduplicates custom scenarios", () => {
    const report = calculatePortfolioStress(
      unequalBetaPositions,
      {
        scenarios: [
          {
            id: "test",
            name: "Original scenario",
            marketMovePercentage: -5,
          },
          {
            id: "test",
            name: "Replacement scenario",
            marketMovePercentage: -10,
          },
          {
            id: "",
            name: "Invalid identifier",
            marketMovePercentage: -20,
          },
          {
            id: "invalid-move",
            name: "Invalid move",
            marketMovePercentage:
              Number.NaN,
          },
        ],
      },
    );

    expect(report.scenarios).toHaveLength(1);

    expect(report.scenarios[0]).toMatchObject(
      {
        id: "test",
        name: "Replacement scenario",
        marketMovePercentage: -10,
      },
    );
  });

  it("uses the default market scenarios", () => {
    const report = calculatePortfolioStress(
      unequalBetaPositions,
    );

    expect(report.scenarios).toHaveLength(
      defaultMarketStressScenarios.length,
    );

    expect(report.scenarios.map(
      (scenario) =>
        scenario.marketMovePercentage,
    )).toEqual([-20, -10, -5, 5, 10, 20]);
  });

  it("reports when no valid positions are available", () => {
    const report = calculatePortfolioStress(
      [],
    );

    expect(report.totalPositions).toBe(0);
    expect(report.coveredPositions).toBe(0);
    expect(report.coveragePercentage).toBe(
      0,
    );

    expect(
      report.warnings,
    ).toContain(
      "No valid portfolio positions are available for stress analysis.",
    );
  });
});