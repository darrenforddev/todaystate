import { describe, expect, it } from "vitest";

import { realCompanyDemoMetadata } from "../../data/realCompanyDemoMetadata";
import { realCompanyDemoResults } from "./realCompanyDemoScores";

import {
  buildBalancedPortfolioSelection,
} from "./portfolio";

import {
  buildPortfolioMarketDataRequest,
} from "./portfolioMarketDataRequest";

import {
  buildScreenerCompanies,
} from "./screener";

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

describe("buildPortfolioMarketDataRequest", () => {
  it("returns not-ready when no positions are selected", () => {
    const manifest =
      buildPortfolioMarketDataRequest(
        buildSelection(0),
      );

    expect(manifest.status).toBe(
      "not-ready",
    );

    expect(manifest.positions).toEqual([]);

    expect(
      manifest.coverage.selectedPositionCount,
    ).toBe(0);

    expect(
      manifest.coverage
        .symbolReadyPercentage,
    ).toBe(0);

    expect(manifest.warnings).toContain(
      "No selected portfolio positions are available for a market-data request.",
    );
  });

  it("returns incomplete when currency and benchmark configuration are missing", () => {
    const manifest =
      buildPortfolioMarketDataRequest(
        buildSelection(),
      );

    expect(manifest.status).toBe(
      "incomplete",
    );

    expect(
      manifest.coverage.selectedPositionCount,
    ).toBe(2);

    expect(
      manifest.coverage.symbolReadyCount,
    ).toBe(2);

    expect(
      manifest.coverage
        .symbolReadyPercentage,
    ).toBe(100);

    expect(
      manifest.coverage.currencyReadyCount,
    ).toBe(0);

    expect(
      manifest.coverage.benchmarkReady,
    ).toBe(false);

    expect(
      manifest.warnings.some((warning) =>
        warning.includes(
          "No benchmark symbol is configured",
        ),
      ),
    ).toBe(true);
  });

  it("builds a ready request for fully configured positions", () => {
    const manifest =
      buildPortfolioMarketDataRequest(
        buildSelection(),
        {
          defaultCurrency: "gbp",
          benchmarkSymbol: "^FTSE",
          minimumPriceObservations: 252,
        },
      );

    expect(manifest.status).toBe("ready");
    expect(manifest.warnings).toHaveLength(0);

    expect(
      manifest.coverage
        .currencyReadyPercentage,
    ).toBe(100);

    expect(
      manifest.coverage.benchmarkReady,
    ).toBe(true);

    expect(manifest.benchmark).toEqual({
      providerSymbol: "^FTSE",
      currency: "GBP",
      minimumPriceObservations: 252,
      requiredFields: [
        "historical-prices",
      ],
    });

    expect(
      manifest.positions.every(
        (position) =>
          position.currency === "GBP" &&
          position.minimumPriceObservations ===
            252,
      ),
    ).toBe(true);
  });

  it("adds Short-specific borrow and dividend requirements", () => {
    const manifest =
      buildPortfolioMarketDataRequest(
        buildSelection(),
        {
          defaultCurrency: "GBP",
          benchmarkSymbol: "^FTSE",
        },
      );

    const longPosition =
      manifest.positions.find(
        (position) =>
          position.side === "long",
      );

    const shortPosition =
      manifest.positions.find(
        (position) =>
          position.side === "short",
      );

    expect(longPosition).toBeDefined();
    expect(shortPosition).toBeDefined();

    expect(
      longPosition?.requiredFields,
    ).not.toContain(
      "short-borrow-availability",
    );

    expect(
      shortPosition?.requiredFields,
    ).toEqual(
      expect.arrayContaining([
        "short-borrow-availability",
        "annual-short-borrow-fee",
        "annual-dividend-yield",
      ]),
    );

    expect(
      shortPosition?.alternativeFields,
    ).toContain("beta");
  });

  it("uses explicit provider symbols and company currencies", () => {
    const selection = buildSelection();

    const longCompanyId =
      selection.longCandidates[0]
        .company.companyId;

    const shortCompanyId =
      selection.shortCandidates[0]
        .company.companyId;

    const manifest =
      buildPortfolioMarketDataRequest(
        selection,
        {
          symbolByCompanyId: {
            [longCompanyId]: "LONG.L",
            [shortCompanyId]: "SHORT.L",
          },
          currencyByCompanyId: {
            [longCompanyId]: "gbp",
            [shortCompanyId]: "GBP",
          },
          benchmarkSymbol: "UKX",
          benchmarkCurrency: "gbp",
        },
      );

    expect(manifest.status).toBe("ready");

    expect(
      manifest.positions.map(
        (position) =>
          position.providerSymbol,
      ),
    ).toEqual(["LONG.L", "SHORT.L"]);

    expect(
      manifest.positions.every(
        (position) =>
          position.currency === "GBP",
      ),
    ).toBe(true);

    expect(
      manifest.benchmark?.currency,
    ).toBe("GBP");
  });

  it("warns when selected companies share a provider symbol", () => {
    const selection = buildSelection();

    const longCompanyId =
      selection.longCandidates[0]
        .company.companyId;

    const shortCompanyId =
      selection.shortCandidates[0]
        .company.companyId;

    const manifest =
      buildPortfolioMarketDataRequest(
        selection,
        {
          symbolByCompanyId: {
            [longCompanyId]: "DUPLICATE",
            [shortCompanyId]: "duplicate",
          },
          defaultCurrency: "GBP",
          benchmarkSymbol: "^FTSE",
        },
      );

    expect(manifest.status).toBe(
      "incomplete",
    );

    expect(
      manifest.warnings,
    ).toContain(
      "Duplicate provider symbols require review: DUPLICATE.",
    );
  });

  it("allows optional liquidity and implementation requests to be disabled", () => {
    const manifest =
      buildPortfolioMarketDataRequest(
        buildSelection(),
        {
          defaultCurrency: "GBP",
          benchmarkSymbol: "^FTSE",
          includeLiquidity: false,
          includeImplementationCosts:
            false,
        },
      );

    expect(manifest.status).toBe("ready");

    for (const position of manifest.positions) {
      expect(
        position.requiredFields,
      ).not.toContain("daily-volume");

      expect(
        position.requiredFields,
      ).not.toContain(
        "average-daily-value-traded",
      );

      expect(
        position.requiredFields,
      ).not.toContain(
        "estimated-round-trip-cost",
      );

      expect(
        position.requiredFields,
      ).toContain("historical-prices");
    }
  });

  it("normalises the minimum history requirement", () => {
    const minimumManifest =
      buildPortfolioMarketDataRequest(
        buildSelection(),
        {
          defaultCurrency: "GBP",
          benchmarkSymbol: "^FTSE",
          minimumPriceObservations: 1,
        },
      );

    expect(
      minimumManifest.positions[0]
        .minimumPriceObservations,
    ).toBe(2);

    const fallbackManifest =
      buildPortfolioMarketDataRequest(
        buildSelection(),
        {
          defaultCurrency: "GBP",
          benchmarkSymbol: "^FTSE",
          minimumPriceObservations:
            Number.NaN,
        },
      );

    expect(
      fallbackManifest.positions[0]
        .minimumPriceObservations,
    ).toBe(60);
  });
});