import { describe, expect, it } from "vitest";

import type { PortfolioCompanyRiskData } from "./portfolioAnalysis";
import { auditPortfolioDataQuality } from "./portfolioDataQuality";

function buildPriceHistory(
  observationCount = 60,
  firstDate = "2026-06-14",
) {
  const firstTimestamp = Date.parse(firstDate);

  return Array.from(
    { length: observationCount },
    (_, index) => ({
      date: new Date(
        firstTimestamp +
          index * 24 * 60 * 60 * 1000,
      )
        .toISOString()
        .slice(0, 10),
      close: 100 + index,
    }),
  );
}

function buildCompleteCompanyData(
  companyId = "tesco",
): PortfolioCompanyRiskData {
  return {
    companyId,
    prices: buildPriceHistory(),
    beta: 0.82,
    averageDailyValueTraded: 25_000_000,
    borrowAvailable: true,
    annualBorrowFeePercentage: 1.5,
    annualDividendYieldPercentage: 3.2,
    estimatedRoundTripCostPercentage: 0.2,
    holdingDays: 30,
  };
}

describe("auditPortfolioDataQuality", () => {
  it("returns incomplete when no company data is supplied", () => {
    const audit = auditPortfolioDataQuality([], {
      asOfDate: "2026-08-13",
    });

    expect(audit.status).toBe("incomplete");
    expect(audit.companyCount).toBe(0);
    expect(audit.readyCompanyCount).toBe(0);
    expect(audit.warnings).toContain(
      "No portfolio company risk data was supplied for quality review.",
    );
  });

  it("returns ready for complete, valid and fresh company data", () => {
    const audit = auditPortfolioDataQuality(
      [buildCompleteCompanyData()],
      {
        asOfDate: "2026-08-13",
      },
    );

    expect(audit.status).toBe("ready");
    expect(audit.readyCompanyCount).toBe(1);
    expect(audit.invalidCompanyCount).toBe(0);
    expect(audit.staleCompanyCount).toBe(0);
    expect(audit.incompleteCompanyCount).toBe(0);

    const company = audit.companyResults[0];

    expect(company.status).toBe("ready");
    expect(company.priceQuality.validObservations).toBe(60);
    expect(company.priceQuality.sufficientHistory).toBe(true);
    expect(company.priceQuality.stale).toBe(false);
    expect(company.hasValidBeta).toBe(true);
    expect(company.hasValidLiquidity).toBe(true);
    expect(company.hasValidTransactionCost).toBe(true);
  });

  it("rejects invalid prices and an implausible beta", () => {
    const companyData: PortfolioCompanyRiskData = {
      ...buildCompleteCompanyData(),
      prices: [
        {
          date: "not-a-date",
          close: -10,
        },
      ],
      beta: 8,
    };

    const audit = auditPortfolioDataQuality(
      [companyData],
      {
        asOfDate: "2026-08-13",
      },
    );

    expect(audit.status).toBe("invalid");
    expect(audit.invalidCompanyCount).toBe(1);
    expect(
      audit.companyResults[0].priceQuality
        .invalidObservations,
    ).toBe(1);
    expect(
      audit.companyResults[0].hasValidBeta,
    ).toBe(false);
    expect(
      audit.errors.some((error) =>
        error.includes(
          "historical price observation is invalid",
        ),
      ),
    ).toBe(true);
    expect(
      audit.errors.some((error) =>
        error.includes(
          "Beta must be finite and between -5 and 5",
        ),
      ),
    ).toBe(true);
  });

  it("identifies stale historical price data", () => {
    const companyData: PortfolioCompanyRiskData = {
      ...buildCompleteCompanyData(),
      prices: buildPriceHistory(
        60,
        "2026-04-03",
      ),
    };

    const audit = auditPortfolioDataQuality(
      [companyData],
      {
        asOfDate: "2026-08-13",
        maximumPriceAgeDays: 7,
      },
    );

    expect(audit.status).toBe("stale");
    expect(audit.staleCompanyCount).toBe(1);
    expect(
      audit.companyResults[0].priceQuality.stale,
    ).toBe(true);
    expect(
      audit.companyResults[0].priceQuality.ageInDays,
    ).toBeGreaterThan(7);
  });

  it("rejects duplicate dates within a price history", () => {
    const prices = buildPriceHistory();

    const companyData: PortfolioCompanyRiskData = {
      ...buildCompleteCompanyData(),
      prices: [...prices, prices[0]],
    };

    const audit = auditPortfolioDataQuality(
      [companyData],
      {
        asOfDate: "2026-08-13",
      },
    );

    expect(audit.status).toBe("invalid");
    expect(
      audit.companyResults[0].priceQuality
        .duplicateDates,
    ).toEqual(["2026-06-14"]);
    expect(
      audit.errors.some((error) =>
        error.includes(
          "Duplicate price dates were found",
        ),
      ),
    ).toBe(true);
  });

  it("returns incomplete when required analysis inputs are missing", () => {
    const companyData: PortfolioCompanyRiskData = {
      companyId: "tesco",
    };

    const audit = auditPortfolioDataQuality(
      [companyData],
      {
        asOfDate: "2026-08-13",
      },
    );

    expect(audit.status).toBe("incomplete");
    expect(audit.incompleteCompanyCount).toBe(1);
    expect(audit.companyResults[0].errors).toHaveLength(0);
    expect(
      audit.companyResults[0].warnings,
    ).toContain(
      "No historical price observations were supplied.",
    );
    expect(
      audit.companyResults[0].warnings,
    ).toContain("Historical beta is not available.");
    expect(
      audit.companyResults[0].warnings,
    ).toContain(
      "Average daily value traded is not available.",
    );
  });

  it("rejects duplicate company identifiers", () => {
    const audit = auditPortfolioDataQuality(
      [
        buildCompleteCompanyData("tesco"),
        buildCompleteCompanyData("tesco"),
      ],
      {
        asOfDate: "2026-08-13",
      },
    );

    expect(audit.status).toBe("invalid");
    expect(audit.duplicateCompanyIds).toEqual([
      "tesco",
    ]);
    expect(audit.errors).toContain(
      "Duplicate company identifiers were supplied: tesco.",
    );
  });
});