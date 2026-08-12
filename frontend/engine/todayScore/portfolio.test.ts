import { describe, expect, it } from "vitest";

import { realCompanyDemoMetadata } from "../../data/realCompanyDemoMetadata";
import { realCompanyDemoResults } from "./realCompanyDemoScores";
import {
  buildBalancedPortfolioSelection,
  buildPortfolioCandidateLists,
} from "./portfolio";
import { buildScreenerCompanies } from "./screener";

const companies = buildScreenerCompanies(
  realCompanyDemoResults,
  realCompanyDemoMetadata,
);

describe("buildPortfolioCandidateLists", () => {
  it("separates companies into candidate lists", () => {
    const result =
      buildPortfolioCandidateLists(companies);

    expect(result.longCandidates).toHaveLength(1);
    expect(result.watchCandidates).toHaveLength(7);
    expect(result.shortCandidates).toHaveLength(2);

    expect(
      result.longCandidates[0].company.companyId,
    ).toBe("next");

    expect(result.warnings).toHaveLength(0);
  });

  it("ranks Long and Watch candidates from strongest to weakest", () => {
    const result =
      buildPortfolioCandidateLists(companies);

    const longScores = result.longCandidates.map(
      (candidate) => candidate.todayScore,
    );

    const watchScores = result.watchCandidates.map(
      (candidate) => candidate.todayScore,
    );

    expect(longScores).toEqual(
      [...longScores].sort(
        (first, second) => second - first,
      ),
    );

    expect(watchScores).toEqual(
      [...watchScores].sort(
        (first, second) => second - first,
      ),
    );
  });

  it("ranks Short candidates from weakest to strongest", () => {
    const result =
      buildPortfolioCandidateLists(companies);

    const shortScores = result.shortCandidates.map(
      (candidate) => candidate.todayScore,
    );

    expect(shortScores).toEqual(
      [...shortScores].sort(
        (first, second) => first - second,
      ),
    );
  });

  it("assigns sequential ranks within each list", () => {
    const result =
      buildPortfolioCandidateLists(companies);

    expect(
      result.watchCandidates.map(
        (candidate) => candidate.rank,
      ),
    ).toEqual([1, 2, 3, 4, 5, 6, 7]);

    expect(
      result.shortCandidates.map(
        (candidate) => candidate.rank,
      ),
    ).toEqual([1, 2]);
  });

  it("warns when a hedged selection cannot be formed", () => {
    const result =
      buildPortfolioCandidateLists([]);

    expect(result.longCandidates).toHaveLength(0);
    expect(result.shortCandidates).toHaveLength(0);

    expect(result.warnings).toContain(
      "No companies currently satisfy the Long-candidate requirements.",
    );

    expect(result.warnings).toContain(
      "No companies currently satisfy the Short-candidate requirements.",
    );

    expect(result.warnings).toContain(
      "A hedged long/short selection cannot currently be formed from this universe.",
    );
  });
});
describe("buildBalancedPortfolioSelection", () => {
  it("selects an equal number of Long and Short candidates", () => {
    const result =
      buildBalancedPortfolioSelection(companies);

    expect(result.pairCount).toBe(1);
    expect(result.longCandidates).toHaveLength(1);
    expect(result.shortCandidates).toHaveLength(1);

    expect(
      result.longCandidates[0].company.companyId,
    ).toBe("next");

    expect(
      result.excludedLongCandidates,
    ).toHaveLength(0);

    expect(
      result.excludedShortCandidates,
    ).toHaveLength(1);
  });

  it("selects the weakest available Short candidate first", () => {
    const candidateLists =
      buildPortfolioCandidateLists(companies);

    const result =
      buildBalancedPortfolioSelection(companies);

    expect(
      result.shortCandidates[0].company.companyId,
    ).toBe(
      candidateLists.shortCandidates[0].company
        .companyId,
    );
  });

  it("respects the maximum-pair limit", () => {
    const result =
      buildBalancedPortfolioSelection(
        companies,
        0,
      );

    expect(result.pairCount).toBe(0);
    expect(result.longCandidates).toHaveLength(0);
    expect(result.shortCandidates).toHaveLength(0);

    expect(result.warnings).toContain(
      "The maximum-pair limit prevents any candidates from being selected.",
    );
  });
});