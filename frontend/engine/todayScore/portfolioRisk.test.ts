import { describe, expect, it } from "vitest";

import { realCompanyDemoMetadata } from "../../data/realCompanyDemoMetadata";
import type {
  BalancedPortfolioSelection,
  PortfolioCandidate,
} from "./portfolio";
import {
  buildBalancedPortfolioSelection,
  buildPortfolioCandidateLists,
} from "./portfolio";
import { auditPortfolioSelection } from "./portfolioRisk";
import { realCompanyDemoResults } from "./realCompanyDemoScores";
import { buildScreenerCompanies } from "./screener";

const companies = buildScreenerCompanies(
  realCompanyDemoResults,
  realCompanyDemoMetadata,
);

const candidateLists =
  buildPortfolioCandidateLists(companies);

const sourceCandidate = [
  ...candidateLists.longCandidates,
  ...candidateLists.watchCandidates,
  ...candidateLists.shortCandidates,
][0];

function createCandidate(
  companyId: string,
  sector: string,
  themeName: string,
): PortfolioCandidate {
  return {
    ...sourceCandidate,
    company: {
      ...sourceCandidate.company,
      companyId,
      ticker: companyId.toUpperCase(),
      companyName: companyId,
      sector,
      themeName,
    },
  };
}

function createSelection(
  longCandidates: PortfolioCandidate[],
  shortCandidates: PortfolioCandidate[],
): BalancedPortfolioSelection {
  return {
    longCandidates,
    shortCandidates,
    excludedLongCandidates: [],
    excludedShortCandidates: [],
    pairCount: Math.min(
      longCandidates.length,
      shortCandidates.length,
    ),
    warnings: [],
    methodology: "Test selection",
  };
}

describe("auditPortfolioSelection", () => {
  it("returns not-ready when no balanced selection exists", () => {
    const selection =
      buildBalancedPortfolioSelection([]);

    const audit =
      auditPortfolioSelection(selection);

    expect(audit.status).toBe("not-ready");
    expect(audit.pairCount).toBe(0);
    expect(audit.positionCount).toBe(0);

    expect(audit.warnings).toContain(
      "No balanced Long/Short selection is available for risk review.",
    );
  });

  it("marks the demonstration cohort as limited", () => {
    const selection =
      buildBalancedPortfolioSelection(companies);

    const audit =
      auditPortfolioSelection(selection);

    expect(audit.status).toBe("limited");
    expect(audit.pairCount).toBe(1);
    expect(audit.positionCount).toBe(2);

    expect(audit.warnings).toContain(
      "Only 1 balanced pair is available. At least 3 are required for the configured research-diversification check.",
    );

    expect(audit.strengths).toContain(
      "The selected Long and Short sides contain equal position counts.",
    );
  });

  it("returns research-ready for a diversified three-pair selection", () => {
    const selection = createSelection(
      [
        createCandidate(
          "long-technology",
          "Technology",
          "Digital Growth",
        ),
        createCandidate(
          "long-healthcare",
          "Healthcare",
          "Defensive Demand",
        ),
        createCandidate(
          "long-industrials",
          "Industrials",
          "Industrial Recovery",
        ),
      ],
      [
        createCandidate(
          "short-technology",
          "Technology",
          "Digital Growth",
        ),
        createCandidate(
          "short-healthcare",
          "Healthcare",
          "Defensive Demand",
        ),
        createCandidate(
          "short-industrials",
          "Industrials",
          "Industrial Recovery",
        ),
      ],
    );

    const audit =
      auditPortfolioSelection(selection);

    expect(audit.status).toBe("research-ready");
    expect(audit.warnings).toHaveLength(0);

    expect(audit.strengths).toContain(
      "No monitored sector or theme exceeds the configured concentration limit.",
    );
  });

  it("detects concentration and directional imbalance", () => {
    const selection = createSelection(
      [
        createCandidate(
          "long-tech-one",
          "Technology",
          "Digital Growth",
        ),
        createCandidate(
          "long-tech-two",
          "Technology",
          "Digital Growth",
        ),
        createCandidate(
          "long-healthcare",
          "Healthcare",
          "Defensive Demand",
        ),
      ],
      [
        createCandidate(
          "short-energy-one",
          "Energy",
          "Energy Transition",
        ),
        createCandidate(
          "short-energy-two",
          "Energy",
          "Energy Transition",
        ),
        createCandidate(
          "short-healthcare",
          "Healthcare",
          "Defensive Demand",
        ),
      ],
    );

    const audit = auditPortfolioSelection(
      selection,
      {
        minimumPairs: 3,
        maximumGroupShare: 0.5,
      },
    );

    expect(audit.status).toBe("limited");

    expect(
      audit.warnings.some((warning) =>
        warning.startsWith(
          "Sector imbalance: Technology",
        ),
      ),
    ).toBe(true);

    expect(
      audit.warnings.some((warning) =>
        warning.startsWith(
          "Sector imbalance: Energy",
        ),
      ),
    ).toBe(true);

    const technology =
      audit.sectorExposure.find(
        (exposure) =>
          exposure.name === "Technology",
      );

    expect(technology).toMatchObject({
      longCount: 2,
      shortCount: 0,
      grossCount: 2,
      netCount: 2,
      shareOfPositions: 33,
    });
  });
});