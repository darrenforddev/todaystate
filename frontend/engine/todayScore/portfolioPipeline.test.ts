import { describe, expect, it } from "vitest";

import { realCompanyDemoMetadata } from "../../data/realCompanyDemoMetadata";
import { realCompanyDemoResults } from "./realCompanyDemoScores";

import {
  buildBalancedPortfolioSelection,
  type BalancedPortfolioSelection,
} from "./portfolio";

import type {
  PortfolioCompanyMarketDataInput,
} from "./portfolioMarketData";

import {
  runPortfolioAnalysisPipeline,
} from "./portfolioPipeline";

import {
  buildScreenerCompanies,
} from "./screener";

function buildSelection(
  maximumPairs = 1,
): BalancedPortfolioSelection {
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

function buildProviderInput(
  companyId: string,
  side: "long" | "short",
): PortfolioCompanyMarketDataInput {
  return {
    companyId,
    source: "Example Market Data",
    fetchedAt: "2026-01-08T12:00:00Z",
    currency: "GBP",
    prices: [
      {
        date: "2026-01-02",
        price: 100,
        volume: 20_000,
      },
      {
        date: "2026-01-05",
        price: 102,
        volume: 21_000,
      },
      {
        date: "2026-01-06",
        price: 101,
        volume: 19_000,
      },
      {
        date: "2026-01-07",
        price: 104,
        volume: 22_000,
      },
      {
        date: "2026-01-08",
        price: 102,
        volume: 20_000,
      },
    ],
    beta: 0.8,
    averageDailyValueTraded: 2_000_000,
    borrowAvailable:
      side === "short"
        ? true
        : undefined,
    annualBorrowFeePercentage:
      side === "short"
        ? 5
        : undefined,
    annualDividendYieldPercentage:
      side === "short"
        ? 2
        : undefined,
    estimatedRoundTripCostPercentage:
      0.2,
  };
}

function buildCompleteProviderInputs(
  selection = buildSelection(),
): PortfolioCompanyMarketDataInput[] {
  return [
    buildProviderInput(
      selection.longCandidates[0]
        .company.companyId,
      "long",
    ),
    buildProviderInput(
      selection.shortCandidates[0]
        .company.companyId,
      "short",
    ),
  ];
}

const completePipelineOptions = {
  marketData: {
    expectedCurrency: "GBP",
  },
  analysis: {
    periodsPerYear: 252,
    dataQualityAsOfDate:
      "2026-01-08",
    minimumPriceObservations: 5,
  },
};

describe("runPortfolioAnalysisPipeline", () => {
  it("builds a research-ready report from complete provider data", () => {
    const selection = buildSelection();

    const report =
      runPortfolioAnalysisPipeline(
        selection,
        buildCompleteProviderInputs(
          selection,
        ),
        completePipelineOptions,
      );

    expect(report.status).toBe(
      "research-ready",
    );

    expect(report.marketData.status).toBe(
      "ready",
    );

    expect(report.analysis.status).toBe(
      "research-ready",
    );

    expect(
      report.coverage.selectedPositionCount,
    ).toBe(2);

    expect(
      report.coverage.matchedPositionCount,
    ).toBe(2);

    expect(
      report.coverage.unmatchedPositionCount,
    ).toBe(0);

    expect(
      report.coverage
        .matchedPositionPercentage,
    ).toBe(100);

    expect(report.warnings).toHaveLength(0);
  });

  it("returns limited when no provider data is supplied", () => {
    const report =
      runPortfolioAnalysisPipeline(
        buildSelection(),
        [],
      );

    expect(report.status).toBe("limited");

    expect(
      report.marketData.status,
    ).toBe("incomplete");

    expect(
      report.analysis.status,
    ).toBe("limited");

    expect(
      report.coverage.matchedPositionCount,
    ).toBe(0);

    expect(
      report.coverage.unmatchedPositionCount,
    ).toBe(2);

    expect(
      report.warnings,
    ).toContain(
      "No provider market data was supplied to the portfolio pipeline.",
    );
  });

  it("reports a selected position without provider coverage", () => {
    const selection = buildSelection();

    const providerInputs =
      buildCompleteProviderInputs(
        selection,
      ).slice(0, 1);

    const report =
      runPortfolioAnalysisPipeline(
        selection,
        providerInputs,
        completePipelineOptions,
      );

    expect(report.status).toBe("limited");

    expect(
      report.coverage.matchedPositionCount,
    ).toBe(1);

    expect(
      report.coverage.unmatchedPositionCount,
    ).toBe(1);

    expect(
      report.coverage
        .matchedPositionPercentage,
    ).toBe(50);

    expect(
      report.warnings.some((warning) =>
        warning.includes(
          "not matched to an accepted provider record",
        ),
      ),
    ).toBe(true);
  });

  it("blocks an invalid provider record before analysis", () => {
    const selection = buildSelection();

    const providerInputs =
      buildCompleteProviderInputs(
        selection,
      );

    providerInputs[1] = {
      ...providerInputs[1],
      prices: [
        {
          date: "not-a-date",
          price: -10,
        },
      ],
    };

    const report =
      runPortfolioAnalysisPipeline(
        selection,
        providerInputs,
        completePipelineOptions,
      );

    expect(report.status).toBe("limited");

    expect(
      report.marketData.status,
    ).toBe("invalid");

    expect(
      report.marketData
        .rejectedCompanyCount,
    ).toBe(1);

    expect(
      report.coverage.matchedPositionCount,
    ).toBe(1);

    expect(
      report.coverage.unmatchedPositionCount,
    ).toBe(1);

    expect(
      report.warnings.some((warning) =>
        warning.includes(
          "provider data error",
        ),
      ),
    ).toBe(true);
  });

  it("blocks duplicated provider records before analysis", () => {
    const selection = buildSelection();

    const providerInputs =
      buildCompleteProviderInputs(
        selection,
      );

    providerInputs.push({
      ...providerInputs[0],
    });

    const report =
      runPortfolioAnalysisPipeline(
        selection,
        providerInputs,
        completePipelineOptions,
      );

    const duplicatedCompanyId =
      providerInputs[0].companyId;

    expect(report.status).toBe("limited");

    expect(
      report.marketData
        .duplicateCompanyIds,
    ).toEqual([duplicatedCompanyId]);

    expect(
      report.marketData
        .acceptedCompanyCount,
    ).toBe(1);

    expect(
      report.marketData
        .rejectedCompanyCount,
    ).toBe(2);

    expect(
      report.coverage.matchedPositionCount,
    ).toBe(1);
  });

  it("allows valid unselected provider records without reducing coverage", () => {
    const selection = buildSelection();

    const providerInputs = [
      ...buildCompleteProviderInputs(
        selection,
      ),
      buildProviderInput(
        "unselected-company",
        "long",
      ),
    ];

    const report =
      runPortfolioAnalysisPipeline(
        selection,
        providerInputs,
        completePipelineOptions,
      );

    expect(report.status).toBe(
      "research-ready",
    );

    expect(
      report.marketData
        .acceptedCompanyCount,
    ).toBe(3);

    expect(
      report.coverage.matchedPositionCount,
    ).toBe(2);

    expect(
      report.coverage.unmatchedPositionCount,
    ).toBe(0);
  });

  it("returns not-ready when the portfolio has no selected positions", () => {
    const report =
      runPortfolioAnalysisPipeline(
        buildSelection(0),
        [],
      );

    expect(report.status).toBe(
      "not-ready",
    );

    expect(
      report.analysis.status,
    ).toBe("not-ready");

    expect(
      report.coverage
        .selectedPositionCount,
    ).toBe(0);

    expect(
      report.coverage
        .matchedPositionPercentage,
    ).toBe(0);
  });
});