import { describe, expect, it } from "vitest";

import {
  adaptPortfolioMarketData,
  type PortfolioCompanyMarketDataInput,
} from "./portfolioMarketData";

function buildCompleteProviderInput(
  companyId = "tesco",
): PortfolioCompanyMarketDataInput {
  return {
    companyId,
    source: "Example Market Data",
    fetchedAt: "2026-08-13T09:30:00Z",
    currency: "GBP",
    prices: [
      {
        date: "2026-08-11",
        close: "100.50",
        volume: "1,000",
      },
      {
        date: "2026-08-12",
        adjustedClose: "102.25",
        volume: "2,000",
      },
    ],
    beta: "0.82",
    averageDailyValueTraded: "25,000,000",
    borrowAvailable: "true",
    annualBorrowFeePercentage: "1.5",
    annualDividendYieldPercentage: "3.2",
    estimatedRoundTripCostPercentage: "0.2",
    holdingDays: "30",
  };
}

describe("adaptPortfolioMarketData", () => {
  it("returns incomplete when no provider data is supplied", () => {
    const report =
      adaptPortfolioMarketData([]);

    expect(report.status).toBe("incomplete");
    expect(report.suppliedCompanyCount).toBe(0);
    expect(report.acceptedCompanyCount).toBe(0);
    expect(report.rejectedCompanyCount).toBe(0);
    expect(report.companyData).toEqual([]);
    expect(report.warnings).toContain(
      "No provider market data was supplied for adaptation.",
    );
  });

  it("normalises a complete provider record", () => {
    const report =
      adaptPortfolioMarketData(
        [buildCompleteProviderInput()],
        {
          expectedCurrency: "GBP",
        },
      );

    expect(report.status).toBe("ready");
    expect(report.acceptedCompanyCount).toBe(1);
    expect(report.rejectedCompanyCount).toBe(0);
    expect(report.errors).toHaveLength(0);
    expect(report.warnings).toHaveLength(0);

    const result = report.companyResults[0];

    expect(result.status).toBe("ready");
    expect(result.acceptedPriceObservations).toBe(2);
    expect(result.rejectedPriceObservations).toBe(0);
    expect(result.liquiditySource).toBe("supplied");

    expect(result.riskData).toEqual({
      companyId: "tesco",
      prices: [
        {
          date: "2026-08-11",
          price: 100.5,
        },
        {
          date: "2026-08-12",
          price: 102.25,
        },
      ],
      beta: 0.82,
      annualBorrowFeePercentage: 1.5,
      annualDividendYieldPercentage: 3.2,
      estimatedRoundTripCostPercentage: 0.2,
      holdingDays: 30,
      borrowAvailable: true,
      averageDailyValueTraded: 25_000_000,
    });
  });

  it("calculates liquidity from price and volume history", () => {
    const input =
      buildCompleteProviderInput();

    input.averageDailyValueTraded =
      undefined;

    input.prices = [
      {
        date: "2026-08-11",
        price: 100,
        volume: 1_000,
      },
      {
        date: "2026-08-12",
        price: 110,
        volume: 2_000,
      },
    ];

    const report =
      adaptPortfolioMarketData(
        [input],
        {
          liquidityLookbackObservations: 20,
          expectedCurrency: "GBP",
        },
      );

    const result = report.companyResults[0];

    expect(report.status).toBe("ready");
    expect(result.liquiditySource).toBe(
      "calculated",
    );
    expect(
      result.riskData.averageDailyValueTraded,
    ).toBe(160_000);
  });

  it("rejects a provider record containing invalid prices", () => {
    const input =
      buildCompleteProviderInput();

    input.prices = [
      {
        date: "not-a-date",
        close: -10,
        volume: 1_000,
      },
    ];

    const report =
      adaptPortfolioMarketData([input]);

    expect(report.status).toBe("invalid");
    expect(report.acceptedCompanyCount).toBe(0);
    expect(report.rejectedCompanyCount).toBe(1);
    expect(report.companyData).toEqual([]);

    const result = report.companyResults[0];

    expect(result.status).toBe("invalid");
    expect(result.acceptedPriceObservations).toBe(0);
    expect(result.rejectedPriceObservations).toBe(1);

    expect(
      result.errors.some((error) =>
        error.includes("invalid date"),
      ),
    ).toBe(true);

    expect(
      result.errors.some((error) =>
        error.includes(
          "finite price greater than zero",
        ),
      ),
    ).toBe(true);
  });

  it("rejects duplicate company identifiers", () => {
    const report =
      adaptPortfolioMarketData([
        buildCompleteProviderInput("tesco"),
        buildCompleteProviderInput("tesco"),
      ]);

    expect(report.status).toBe("invalid");
    expect(report.duplicateCompanyIds).toEqual([
      "tesco",
    ]);
    expect(report.acceptedCompanyCount).toBe(0);
    expect(report.rejectedCompanyCount).toBe(2);
    expect(report.companyData).toEqual([]);

    expect(report.errors).toContain(
      "Duplicate company identifiers were supplied: tesco.",
    );
  });

  it("rejects a currency that does not match the portfolio currency", () => {
    const input =
      buildCompleteProviderInput();

    input.currency = "USD";

    const report =
      adaptPortfolioMarketData(
        [input],
        {
          expectedCurrency: "GBP",
        },
      );

    expect(report.status).toBe("invalid");
    expect(report.acceptedCompanyCount).toBe(0);

    expect(
      report.errors.some((error) =>
        error.includes(
          "Currency USD does not match the expected portfolio currency GBP",
        ),
      ),
    ).toBe(true);
  });

  it("retains incomplete records for downstream quality review", () => {
    const input: PortfolioCompanyMarketDataInput = {
      companyId: "tesco",
      source: "Example Market Data",
    };

    const report =
      adaptPortfolioMarketData([input]);

    expect(report.status).toBe("incomplete");
    expect(report.acceptedCompanyCount).toBe(1);
    expect(report.rejectedCompanyCount).toBe(0);
    expect(report.companyData).toHaveLength(1);

    const result = report.companyResults[0];

    expect(result.status).toBe("incomplete");
    expect(result.riskData).toEqual({
      companyId: "tesco",
      prices: undefined,
    });
    expect(result.liquiditySource).toBe(
      "unavailable",
    );

    expect(result.warnings).toContain(
      "The market-data fetch timestamp is missing.",
    );
    expect(result.warnings).toContain(
      "No historical price observations were supplied.",
    );
    expect(result.warnings).toContain(
      "Liquidity is unavailable because neither average daily value traded nor usable volume history was supplied.",
    );
  });

  it("normalises provider boolean and numeric string values", () => {
    const input =
      buildCompleteProviderInput();

    input.beta = " 1.15 ";
    input.borrowAvailable = "0";
    input.holdingDays = "45";

    const report =
      adaptPortfolioMarketData([input]);

    const riskData =
      report.companyResults[0].riskData;

    expect(riskData.beta).toBe(1.15);
    expect(riskData.borrowAvailable).toBe(false);
    expect(riskData.holdingDays).toBe(45);
  });
});