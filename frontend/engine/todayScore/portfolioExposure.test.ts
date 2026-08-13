import { describe, expect, it } from "vitest";

import { realCompanyDemoMetadata } from "../../data/realCompanyDemoMetadata";
import { realCompanyDemoResults } from "./realCompanyDemoScores";
import { buildBalancedPortfolioSelection } from "./portfolio";
import { calculatePortfolioExposure } from "./portfolioExposure";
import { buildScreenerCompanies } from "./screener";

function buildSelection() {
  const companies = buildScreenerCompanies(
    realCompanyDemoResults,
    realCompanyDemoMetadata,
  );

  return buildBalancedPortfolioSelection(
    companies,
    1,
  );
}

describe("calculatePortfolioExposure", () => {
  it("builds a capital-neutral equal-notional portfolio", () => {
    const report = calculatePortfolioExposure(
      buildSelection(),
    );

    expect(report.positions).toHaveLength(2);

    expect(report.capital).toEqual({
      longNotional: 10_000,
      shortNotional: 10_000,
      grossNotional: 20_000,
      netNotional: 0,
      netExposurePercentage: 0,
      longShortRatio: 1,
      isCapitalNeutral: true,
    });

    expect(report.strengths).toContain(
      "The selected portfolio is capital-neutral before costs.",
    );

    expect(report.beta.coveragePercentage).toBe(0);
  });

  it("detects unequal capital notionals", () => {
    const selection = buildSelection();

    const longCompanyId =
      selection.longCandidates[0].company.companyId;

    const shortCompanyId =
      selection.shortCandidates[0].company.companyId;

    const report = calculatePortfolioExposure(
      selection,
      {
        notionalByCompanyId: {
          [longCompanyId]: 15_000,
          [shortCompanyId]: 10_000,
        },
      },
    );

    expect(report.capital.longNotional).toBe(
      15_000,
    );

    expect(report.capital.shortNotional).toBe(
      10_000,
    );

    expect(report.capital.grossNotional).toBe(
      25_000,
    );

    expect(report.capital.netNotional).toBe(
      5_000,
    );

    expect(
      report.capital.netExposurePercentage,
    ).toBe(20);

    expect(
      report.capital.isCapitalNeutral,
    ).toBe(false);

    expect(
      report.warnings.some((warning) =>
        warning.includes(
          "net Long capital exposure",
        ),
      ),
    ).toBe(true);
  });

  it("calculates beta-adjusted exposure", () => {
    const selection = buildSelection();

    const longCompanyId =
      selection.longCandidates[0].company.companyId;

    const shortCompanyId =
      selection.shortCandidates[0].company.companyId;

    const report = calculatePortfolioExposure(
      selection,
      {
        betaByCompanyId: {
          [longCompanyId]: 1.4,
          [shortCompanyId]: 0.6,
        },
      },
    );

    expect(
      report.beta.longBetaAdjustedNotional,
    ).toBe(14_000);

    expect(
      report.beta.shortBetaAdjustedNotional,
    ).toBe(6_000);

    expect(
      report.beta.grossBetaAdjustedNotional,
    ).toBe(20_000);

    expect(
      report.beta.netBetaAdjustedNotional,
    ).toBe(8_000);

    expect(report.beta.coveragePercentage).toBe(
      100,
    );

    expect(report.beta.isBetaNeutral).toBe(
      false,
    );
  });

  it("recognises a beta-neutral portfolio", () => {
    const selection = buildSelection();

    const longCompanyId =
      selection.longCandidates[0].company.companyId;

    const shortCompanyId =
      selection.shortCandidates[0].company.companyId;

    const report = calculatePortfolioExposure(
      selection,
      {
        betaByCompanyId: {
          [longCompanyId]: 0.8,
          [shortCompanyId]: 0.8,
        },
      },
    );

    expect(
      report.beta.netBetaAdjustedNotional,
    ).toBe(0);

    expect(report.beta.isBetaNeutral).toBe(true);

    expect(report.strengths).toContain(
      "The selected portfolio is within the configured beta-neutral tolerance.",
    );
  });

  it("reports partial beta coverage", () => {
    const selection = buildSelection();

    const longCompanyId =
      selection.longCandidates[0].company.companyId;

    const report = calculatePortfolioExposure(
      selection,
      {
        betaByCompanyId: {
          [longCompanyId]: 1.1,
        },
      },
    );

    expect(report.beta.coveredPositions).toBe(1);
    expect(report.beta.totalPositions).toBe(2);

    expect(report.beta.coveragePercentage).toBe(
      50,
    );

    expect(
      report.warnings.some((warning) =>
        warning.includes(
          "Beta data is available for 1 of 2",
        ),
      ),
    ).toBe(true);
  });
});