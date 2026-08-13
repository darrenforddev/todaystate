import { describe, expect, it } from "vitest";

import {
  calculateHistoricalBeta,
  type DatedPrice,
} from "./portfolioBeta";

const marketPrices: DatedPrice[] = [
  { date: "2026-01-02", price: 100 },
  { date: "2026-01-05", price: 101 },
  { date: "2026-01-06", price: 98.98 },
  { date: "2026-01-07", price: 101.9494 },
  { date: "2026-01-08", price: 100.929906 },
];

const doubleBetaAssetPrices: DatedPrice[] = [
  { date: "2026-01-02", price: 50 },
  { date: "2026-01-05", price: 51 },
  { date: "2026-01-06", price: 48.96 },
  { date: "2026-01-07", price: 51.8976 },
  { date: "2026-01-08", price: 50.859648 },
];

describe("calculateHistoricalBeta", () => {
  it("calculates beta from aligned historical returns", () => {
    const result = calculateHistoricalBeta(
      doubleBetaAssetPrices,
      marketPrices,
    );

    expect(result).not.toBeNull();

    expect(result?.beta).toBe(2);
    expect(result?.correlation).toBe(1);

    expect(result?.priceObservations).toBe(5);
    expect(result?.returnObservations).toBe(4);

    expect(result?.startDate).toBe(
      "2026-01-02",
    );

    expect(result?.endDate).toBe(
      "2026-01-08",
    );
  });

  it("aligns asset and market observations by date", () => {
    const assetPricesWithExtraDate: DatedPrice[] = [
      {
        date: "2026-01-01",
        price: 49,
      },
      ...doubleBetaAssetPrices,
      {
        date: "2026-01-09",
        price: 52,
      },
    ];

    const marketPricesWithMissingDate =
      marketPrices.filter(
        (observation) =>
          observation.date !== "2026-01-06",
      );

    const result = calculateHistoricalBeta(
      assetPricesWithExtraDate,
      marketPricesWithMissingDate,
    );

    expect(result).not.toBeNull();

    expect(result?.priceObservations).toBe(4);
    expect(result?.returnObservations).toBe(3);

    expect(result?.startDate).toBe(
      "2026-01-02",
    );

    expect(result?.endDate).toBe(
      "2026-01-08",
    );
  });

  it("ignores invalid price observations", () => {
    const assetPricesWithInvalidValues: DatedPrice[] =
      [
        ...doubleBetaAssetPrices,
        {
          date: "2026-01-09",
          price: Number.NaN,
        },
        {
          date: "2026-01-10",
          price: 0,
        },
        {
          date: "",
          price: 100,
        },
      ];

    const result = calculateHistoricalBeta(
      assetPricesWithInvalidValues,
      marketPrices,
    );

    expect(result).not.toBeNull();
    expect(result?.priceObservations).toBe(5);
    expect(result?.beta).toBe(2);
  });

  it("returns null when fewer than three aligned prices exist", () => {
    const result = calculateHistoricalBeta(
      doubleBetaAssetPrices.slice(0, 2),
      marketPrices.slice(0, 2),
    );

    expect(result).toBeNull();
  });

  it("returns null when the market has no return variance", () => {
    const flatMarketPrices: DatedPrice[] = [
      { date: "2026-01-02", price: 100 },
      { date: "2026-01-05", price: 100 },
      { date: "2026-01-06", price: 100 },
      { date: "2026-01-07", price: 100 },
    ];

    const result = calculateHistoricalBeta(
      doubleBetaAssetPrices.slice(0, 4),
      flatMarketPrices,
    );

    expect(result).toBeNull();
  });

  it("uses the configured annualisation frequency", () => {
    const result = calculateHistoricalBeta(
      doubleBetaAssetPrices,
      marketPrices,
      {
        periodsPerYear: 12,
      },
    );

    expect(result).not.toBeNull();

    expect(
      result?.assetAnnualisedVolatility,
    ).toBeGreaterThan(0);

    expect(
      result?.marketAnnualisedVolatility,
    ).toBeGreaterThan(0);

    expect(
      result?.assetAnnualisedVolatility,
    ).toBeCloseTo(
      (result?.marketAnnualisedVolatility ??
        0) * 2,
      1,
    );
  });
});