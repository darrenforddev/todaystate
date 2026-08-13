import { describe, expect, it } from "vitest";

import type { DatedPrice } from "./portfolioBeta";
import {
  calculatePortfolioStatistics,
  type PortfolioPriceSeries,
} from "./portfolioStatistics";

const assetAPrices: DatedPrice[] = [
  { date: "2026-01-02", price: 100 },
  { date: "2026-01-05", price: 110 },
  { date: "2026-01-06", price: 104.5 },
  { date: "2026-01-07", price: 112.86 },
  { date: "2026-01-08", price: 110.6028 },
];

const assetBPrices: DatedPrice[] = [
  { date: "2026-01-02", price: 50 },
  { date: "2026-01-05", price: 55 },
  { date: "2026-01-06", price: 52.25 },
  { date: "2026-01-07", price: 56.43 },
  { date: "2026-01-08", price: 55.3014 },
];

const inverseAssetPrices: DatedPrice[] = [
  { date: "2026-01-02", price: 100 },
  { date: "2026-01-05", price: 90 },
  { date: "2026-01-06", price: 94.5 },
  { date: "2026-01-07", price: 86.94 },
  { date: "2026-01-08", price: 88.6788 },
];

const identicalSeries: PortfolioPriceSeries[] = [
  {
    companyId: "asset-a",
    prices: assetAPrices,
  },
  {
    companyId: "asset-b",
    prices: assetBPrices,
  },
];

describe("calculatePortfolioStatistics", () => {
  it("calculates volatility for a single position", () => {
    const result = calculatePortfolioStatistics(
      [
        {
          companyId: "asset-a",
          weight: 1,
        },
      ],
      [
        {
          companyId: "asset-a",
          prices: assetAPrices,
        },
      ],
      {
        periodsPerYear: 4,
      },
    );

    expect(result).not.toBeNull();

    expect(
      result?.portfolioAnnualisedVolatility,
    ).toBeCloseTo(14.73, 2);

    expect(result?.grossWeight).toBe(1);
    expect(result?.netWeight).toBe(1);

    expect(result?.priceObservations).toBe(5);
    expect(result?.returnObservations).toBe(4);

    expect(result?.startDate).toBe(
      "2026-01-02",
    );

    expect(result?.endDate).toBe(
      "2026-01-08",
    );

    expect(result?.positions).toHaveLength(1);
    expect(result?.correlations).toHaveLength(0);
  });

  it("calculates pairwise correlation and diversified position risk", () => {
    const result = calculatePortfolioStatistics(
      [
        {
          companyId: "asset-a",
          weight: 0.5,
        },
        {
          companyId: "asset-b",
          weight: 0.5,
        },
      ],
      identicalSeries,
      {
        periodsPerYear: 4,
      },
    );

    expect(result).not.toBeNull();

    expect(
      result?.averagePairwiseCorrelation,
    ).toBe(1);

    expect(result?.correlations).toEqual([
      {
        firstCompanyId: "asset-a",
        secondCompanyId: "asset-b",
        correlation: 1,
      },
    ]);

    expect(
      result?.portfolioAnnualisedVolatility,
    ).toBeCloseTo(14.73, 2);

    expect(
      result?.positions[0].riskContribution,
    ).toBeCloseTo(7.37, 2);

    expect(
      result?.positions[1].riskContribution,
    ).toBeCloseTo(7.37, 2);
  });

  it("recognises a perfectly hedged identical long-short pair", () => {
    const result = calculatePortfolioStatistics(
      [
        {
          companyId: "asset-a",
          weight: 0.5,
        },
        {
          companyId: "asset-b",
          weight: -0.5,
        },
      ],
      identicalSeries,
      {
        periodsPerYear: 4,
      },
    );

    expect(result).not.toBeNull();

    expect(result?.grossWeight).toBe(1);
    expect(result?.netWeight).toBe(0);

    expect(
      result?.portfolioAnnualisedVolatility,
    ).toBe(0);

    expect(
      result?.averagePairwiseCorrelation,
    ).toBe(1);

    expect(
      result?.positions.every(
        (position) =>
          position.riskContribution === 0,
      ),
    ).toBe(true);
  });

  it("recognises diversification from negatively correlated assets", () => {
    const result = calculatePortfolioStatistics(
      [
        {
          companyId: "asset-a",
          weight: 0.5,
        },
        {
          companyId: "inverse",
          weight: 0.5,
        },
      ],
      [
        {
          companyId: "asset-a",
          prices: assetAPrices,
        },
        {
          companyId: "inverse",
          prices: inverseAssetPrices,
        },
      ],
      {
        periodsPerYear: 4,
      },
    );

    expect(result).not.toBeNull();

    expect(
      result?.averagePairwiseCorrelation,
    ).toBe(-1);

    expect(
      result?.portfolioAnnualisedVolatility,
    ).toBe(0);
  });

  it("aligns every position to common dates", () => {
    const assetBWithMissingDate =
      assetBPrices.filter(
        (observation) =>
          observation.date !== "2026-01-06",
      );

    const result = calculatePortfolioStatistics(
      [
        {
          companyId: "asset-a",
          weight: 0.5,
        },
        {
          companyId: "asset-b",
          weight: -0.5,
        },
      ],
      [
        {
          companyId: "asset-a",
          prices: [
            ...assetAPrices,
            {
              date: "2026-01-09",
              price: 111,
            },
          ],
        },
        {
          companyId: "asset-b",
          prices: assetBWithMissingDate,
        },
      ],
    );

    expect(result).not.toBeNull();
    expect(result?.priceObservations).toBe(4);
    expect(result?.returnObservations).toBe(3);
  });

  it("combines duplicate position weights", () => {
    const result = calculatePortfolioStatistics(
      [
        {
          companyId: "asset-a",
          weight: 0.25,
        },
        {
          companyId: "asset-a",
          weight: 0.25,
        },
        {
          companyId: "asset-b",
          weight: -0.5,
        },
      ],
      identicalSeries,
      {
        periodsPerYear: 4,
      },
    );

    expect(result).not.toBeNull();
    expect(result?.positions).toHaveLength(2);

    expect(
      result?.positions.find(
        (position) =>
          position.companyId === "asset-a",
      )?.weight,
    ).toBe(0.5);

    expect(
      result?.portfolioAnnualisedVolatility,
    ).toBe(0);
  });

  it("returns null when a selected position has no price series", () => {
    const result = calculatePortfolioStatistics(
      [
        {
          companyId: "asset-a",
          weight: 0.5,
        },
        {
          companyId: "missing",
          weight: -0.5,
        },
      ],
      identicalSeries,
    );

    expect(result).toBeNull();
  });

  it("returns null with fewer than three common prices", () => {
    const result = calculatePortfolioStatistics(
      [
        {
          companyId: "asset-a",
          weight: 1,
        },
      ],
      [
        {
          companyId: "asset-a",
          prices: assetAPrices.slice(0, 2),
        },
      ],
    );

    expect(result).toBeNull();
  });
});