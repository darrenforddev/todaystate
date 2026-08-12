import { describe, expect, it } from "vitest";

import { realCompanyDemoMetadata } from "../../data/realCompanyDemoMetadata";
import { realCompanyDemoResults } from "./realCompanyDemoScores";
import {
  buildScreenerCompanies,
  defaultScreenerFilters,
  filterScreenerCompanies,
  getScreenerDecision,
} from "./screener";

describe("getScreenerDecision", () => {
  it("returns long for a score of 65 or above without a Weak safeguard", () => {
    expect(getScreenerDecision(65, "Strong")).toBe("long");
    expect(getScreenerDecision(80, "Strong")).toBe("long");
  });

  it("returns watch when a high-scoring company has a Weak safeguard", () => {
    expect(getScreenerDecision(67, "Weak")).toBe("watch");
  });

  it("handles the Weak safeguard regardless of capitalisation", () => {
    expect(getScreenerDecision(70, "weak")).toBe("watch");
  });

  it("returns short for a score of 35 or below", () => {
    expect(getScreenerDecision(35, "Weak")).toBe("short");
    expect(getScreenerDecision(30, "Weak")).toBe("short");
  });

  it("returns watch for scores between 36 and 64", () => {
    expect(getScreenerDecision(36, "Balanced")).toBe("watch");
    expect(getScreenerDecision(64, "Strong")).toBe("watch");
  });
});

describe("buildScreenerCompanies", () => {
  const companies = buildScreenerCompanies(
    realCompanyDemoResults,
    realCompanyDemoMetadata,
  );

  it("builds all ten demo companies", () => {
    expect(companies).toHaveLength(10);

    for (const company of companies) {
      expect(company.result.companyId).toBe(company.companyId);
    }
  });

  it("sorts companies from highest to lowest TodayScore", () => {
    for (let index = 1; index < companies.length; index += 1) {
      expect(
        companies[index - 1].result.todayScore.score,
      ).toBeGreaterThanOrEqual(companies[index].result.todayScore.score);
    }
  });

  it("assigns the expected decision totals", () => {
    expect(companies.filter((company) => company.decision === "long")).toHaveLength(
      0,
    );
    expect(
      companies.filter((company) => company.decision === "watch"),
    ).toHaveLength(8);
    expect(
      companies.filter((company) => company.decision === "short"),
    ).toHaveLength(2);
  });
});

describe("filterScreenerCompanies", () => {
  const companies = buildScreenerCompanies(
    realCompanyDemoResults,
    realCompanyDemoMetadata,
  );

  it("filters companies by decision", () => {
    const longCompanies = filterScreenerCompanies(companies, {
      ...defaultScreenerFilters,
      decision: "long",
    });

    const watchCompanies = filterScreenerCompanies(companies, {
      ...defaultScreenerFilters,
      decision: "watch",
    });

    const shortCompanies = filterScreenerCompanies(companies, {
      ...defaultScreenerFilters,
      decision: "short",
    });

    expect(longCompanies).toHaveLength(0);
    expect(watchCompanies).toHaveLength(8);
    expect(shortCompanies).toHaveLength(2);

    expect(
      watchCompanies.every((company) => company.decision === "watch"),
    ).toBe(true);

    expect(
      shortCompanies.every((company) => company.decision === "short"),
    ).toBe(true);
  });

  it("finds a company using its ticker", () => {
    const targetCompany = companies[0];

    const matches = filterScreenerCompanies(companies, {
      ...defaultScreenerFilters,
      query: targetCompany.ticker,
    });

    expect(
      matches.some(
        (company) => company.companyId === targetCompany.companyId,
      ),
    ).toBe(true);
  });

  it("applies the minimum TodayScore filter", () => {
    const matches = filterScreenerCompanies(companies, {
      ...defaultScreenerFilters,
      minimumTodayScore: 60,
    });

    expect(matches.length).toBeGreaterThan(0);

    expect(
      matches.every((company) => company.result.todayScore.score >= 60),
    ).toBe(true);
  });
});