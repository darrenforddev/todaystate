import { describe, expect, it } from "vitest";

import { realCompanyDemoMetadata } from "../../data/realCompanyDemoMetadata";
import { realCompanyDemoResults } from "./realCompanyDemoScores";

import {
  buildBalancedPortfolioSelection,
} from "./portfolio";

import {
  analysePortfolioSelection,
  type PortfolioCompanyRiskData,
} from "./portfolioAnalysis";

import type { DatedPrice } from "./portfolioBeta";

import {
  buildScreenerCompanies,
} from "./screener";

const benchmarkPrices: DatedPrice[] = [
  {
    date: "2026-01-02",
    price: 100,
  },
  {
    date: "2026-01-05",
    price: 102,
  },
  {
    date: "2026-01-06",
    price: 101,
  },
  {
    date: "2026-01-07",
    price: 104,
  },
  {
    date: "2026-01-08",
    price: 102,
  },
];

function buildSelection(
  maximumPairs = 1,
) {
  const companies =
    buildScreenerCompanies(
      realCompanyDemoResults,
      realCompanyDemoMetadata,
    );

  return buildBalancedPortfolioSelection(
    companies,
    maximumPairs,
  );
}

function buildCompleteCompanyData():
  PortfolioCompanyRiskData[] {
  const selection = buildSelection();

  const longCompanyId =
    selection.longCandidates[0]
      .company.companyId;

  const shortCompanyId =
    selection.shortCandidates[0]
      .company.companyId;

  return [
    {
      companyId: longCompanyId,
      beta: 0.8,
      prices: benchmarkPrices,
      averageDailyValueTraded:
        2_000_000,
      estimatedRoundTripCostPercentage:
        0.2,
    },
    {
      companyId: shortCompanyId,
      beta: 0.8,
      prices: benchmarkPrices,
      averageDailyValueTraded:
        2_000_000,
      borrowAvailable: true,
      annualBorrowFeePercentage: 5,
      annualDividendYieldPercentage: 2,
      estimatedRoundTripCostPercentage:
        0.2,
    },
  ];
}

describe("analysePortfolioSelection", () => {
  it("builds a limited report when live risk data is unavailable", () => {
    const report =
      analysePortfolioSelection(
        buildSelection(),
      );

    expect(report.status).toBe("limited");

    expect(
      report.coverage.positionCount,
    ).toBe(2);

    expect(
      report.exposure.capital
        .isCapitalNeutral,
    ).toBe(true);

    expect(
      report.coverage
        .betaCoveragePercentage,
    ).toBe(0);

    expect(
      report.coverage
        .priceCoveragePercentage,
    ).toBe(0);

    expect(report.statistics).toBeNull();

    expect(
      report.stress.coveragePercentage,
    ).toBe(0);

    expect(
      report.implementation.status,
    ).toBe("review");

    expect(
      report.positionCoverage.every(
        (position) =>
          position.betaSource ===
          "unavailable",
      ),
    ).toBe(true);
  });

  it("builds a research-ready combined report", () => {
    const report =
      analysePortfolioSelection(
        buildSelection(),
        {
          companyData:
            buildCompleteCompanyData(),
          periodsPerYear: 252,
           dataQualityAsOfDate:
            "2026-01-08",
          minimumPriceObservations: 5,
        },
      );

    expect(report.status).toBe(
      "research-ready",
    );

    expect(
      report.coverage
        .betaCoveragePercentage,
    ).toBe(100);

    expect(
      report.coverage
        .priceCoveragePercentage,
    ).toBe(100);

    expect(
      report.coverage
        .liquidityCoveragePercentage,
    ).toBe(100);

    expect(
      report.coverage
        .implementationCostCoveragePercentage,
    ).toBe(100);

    expect(
      report.coverage
        .statisticsAvailable,
    ).toBe(true);

    expect(report.statistics).not.toBeNull();

    expect(
      report.exposure.beta.isBetaNeutral,
    ).toBe(true);

    expect(
      report.stress.coveragePercentage,
    ).toBe(100);

    expect(
      report.implementation.status,
    ).toBe("research-implementable");

    expect(report.warnings).toHaveLength(0);
  });

  it("calculates historical beta from company and benchmark prices", () => {
    const selection = buildSelection();

    const companyData =
      buildCompleteCompanyData().map(
        (company) => ({
          ...company,
          beta: undefined,
        }),
      );

    const report =
      analysePortfolioSelection(
        selection,
        {
          benchmarkPrices,
          companyData,
        },
      );

    expect(
      report.historicalBetas,
    ).toHaveLength(2);

    expect(
      report.historicalBetas.every(
        (historicalBeta) =>
          historicalBeta.result.beta === 1,
      ),
    ).toBe(true);

    expect(
      report.positionCoverage.every(
        (position) =>
          position.betaSource ===
          "calculated",
      ),
    ).toBe(true);

    expect(
      report.coverage
        .betaCoveragePercentage,
    ).toBe(100);

    expect(
      report.exposure.beta.isBetaNeutral,
    ).toBe(true);
  });

  it("prefers a supplied beta over a calculated beta", () => {
    const selection = buildSelection();

    const longCompanyId =
      selection.longCandidates[0]
        .company.companyId;

    const companyData =
      buildCompleteCompanyData().map(
        (company) => ({
          ...company,
          beta:
            company.companyId ===
            longCompanyId
              ? 0.7
              : undefined,
        }),
      );

    const report =
      analysePortfolioSelection(
        selection,
        {
          benchmarkPrices,
          companyData,
        },
      );

    expect(
      report.historicalBetas,
    ).toHaveLength(1);

    expect(
      report.positionCoverage.find(
        (position) =>
          position.companyId ===
          longCompanyId,
      )?.betaSource,
    ).toBe("supplied");

    expect(
      report.positionCoverage.find(
        (position) =>
          position.companyId !==
          longCompanyId,
      )?.betaSource,
    ).toBe("calculated");
  });

  it("withholds portfolio statistics when price coverage is incomplete", () => {
    const companyData =
      buildCompleteCompanyData();

    companyData[1] = {
      ...companyData[1],
      prices: undefined,
    };

    const report =
      analysePortfolioSelection(
        buildSelection(),
        {
          companyData,
        },
      );

    expect(
      report.coverage
        .priceCoveredPositions,
    ).toBe(1);

    expect(
      report.coverage
        .priceCoveragePercentage,
    ).toBe(50);

    expect(report.statistics).toBeNull();

    expect(
      report.warnings.some((warning) =>
        warning.includes(
          "volatility and correlation",
        ),
      ),
    ).toBe(true);
  });

  it("keeps the report limited when implementation has a blocker", () => {
    const companyData =
      buildCompleteCompanyData();

    companyData[1] = {
      ...companyData[1],
      borrowAvailable: false,
    };

    const report =
      analysePortfolioSelection(
        buildSelection(),
        {
          companyData,
        },
      );

    expect(report.status).toBe("limited");

    expect(
      report.implementation.blockers,
    ).toHaveLength(1);

    expect(
      report.warnings.some((warning) =>
        warning.includes(
          "implementation blocker",
        ),
      ),
    ).toBe(true);
  });

  it("builds a not-ready report when no positions are selected", () => {
    const report =
      analysePortfolioSelection(
        buildSelection(0),
      );

    expect(report.status).toBe(
      "not-ready",
    );

    expect(
      report.coverage.positionCount,
    ).toBe(0);

    expect(report.statistics).toBeNull();

    expect(
      report.warnings,
    ).toContain(
      "No selected Long/Short positions are available for combined portfolio analysis.",
    );
  });
});