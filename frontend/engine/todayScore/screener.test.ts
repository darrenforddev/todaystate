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
      expect(company.result.companyId).toBe(
        company.companyId,
      );
    }
  });

  it("gives Tesco varied factor scores within every pillar", () => {
    const tesco = companies.find(
      (company) => company.companyId === "tesco",
    );

    if (!tesco) {
      throw new Error("Tesco demo company was not found.");
    }

    const pillars = [
      tesco.result.breakdown.quality,
      tesco.result.breakdown.value,
      tesco.result.breakdown.momentum,
    ];

    for (const pillar of pillars) {
      const distinctScores = new Set(
        pillar.factors.map((factor) => factor.score),
      );

      expect(distinctScores.size).toBeGreaterThan(1);
    }
  });

  it("sorts companies from highest to lowest TodayScore", () => {
    for (
      let index = 1;
      index < companies.length;
      index += 1
    ) {
      expect(
        companies[index - 1].result.todayScore.score,
      ).toBeGreaterThanOrEqual(
        companies[index].result.todayScore.score,
      );
    }
  });

  it("assigns the expected decision totals", () => {
    expect(
      companies.filter(
        (company) => company.decision === "long",
      ),
    ).toHaveLength(1);

    expect(
      companies.filter(
        (company) => company.decision === "watch",
      ),
    ).toHaveLength(7);

    expect(
      companies.filter(
        (company) => company.decision === "short",
      ),
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

    expect(longCompanies).toHaveLength(1);
    expect(watchCompanies).toHaveLength(7);
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

describe("remaining filterScreenerCompanies filters", () => {
  const companies = buildScreenerCompanies(
    realCompanyDemoResults,
    realCompanyDemoMetadata,
  );

 it("filters companies by sector", () => {
    const targetSector = companies[0].sector;

    const matches = filterScreenerCompanies(companies, {
      ...defaultScreenerFilters,
      sector: targetSector,
    });

    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((company) => company.sector === targetSector)).toBe(
      true,
    );
  });

  it("filters companies by theme", () => {
    const targetTheme = companies[0].themeId;

    const matches = filterScreenerCompanies(companies, {
      ...defaultScreenerFilters,
      themeId: targetTheme,
    });

    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((company) => company.themeId === targetTheme)).toBe(
      true,
    );
  });

  it("applies the minimum Quality filter", () => {
    const minimumQuality = Math.max(
      ...companies.map((company) => company.result.todayScore.quality),
    );

    const matches = filterScreenerCompanies(companies, {
      ...defaultScreenerFilters,
      minimumQuality,
    });

    expect(matches.length).toBeGreaterThan(0);
    expect(
      matches.every(
        (company) => company.result.todayScore.quality >= minimumQuality,
      ),
    ).toBe(true);
  });

  it("applies the minimum Value filter", () => {
    const minimumValue = Math.max(
      ...companies.map((company) => company.result.todayScore.value),
    );

    const matches = filterScreenerCompanies(companies, {
      ...defaultScreenerFilters,
      minimumValue,
    });

    expect(matches.length).toBeGreaterThan(0);
    expect(
      matches.every(
        (company) => company.result.todayScore.value >= minimumValue,
      ),
    ).toBe(true);
  });

  it("applies the minimum Momentum filter", () => {
    const minimumMomentum = Math.max(
      ...companies.map((company) => company.result.todayScore.momentum),
    );

    const matches = filterScreenerCompanies(companies, {
      ...defaultScreenerFilters,
      minimumMomentum,
    });

    expect(matches.length).toBeGreaterThan(0);
    expect(
      matches.every(
        (company) => company.result.todayScore.momentum >= minimumMomentum,
      ),
    ).toBe(true);
  });

  it("applies the minimum theme-confidence filter", () => {
    const minimumThemeConfidence = Math.max(
      ...companies.map((company) => company.themeConfidence),
    );

    const matches = filterScreenerCompanies(companies, {
      ...defaultScreenerFilters,
      minimumThemeConfidence,
    });

    expect(matches.length).toBeGreaterThan(0);
    expect(
      matches.every(
        (company) =>
          company.themeConfidence >= minimumThemeConfidence,
      ),
    ).toBe(true);
  });

  it("applies the minimum historical-success-rate filter", () => {
    const successRates = companies.flatMap((company) =>
      company.historicalSuccessRate === undefined
        ? []
        : [company.historicalSuccessRate],
    );

    expect(successRates.length).toBeGreaterThan(0);

    const minimumHistoricalSuccessRate = Math.max(...successRates);

    const matches = filterScreenerCompanies(companies, {
      ...defaultScreenerFilters,
      minimumHistoricalSuccessRate,
    });

    expect(matches.length).toBeGreaterThan(0);
    expect(
      matches.every(
        (company) =>
          company.historicalSuccessRate !== undefined &&
          company.historicalSuccessRate >= minimumHistoricalSuccessRate,
      ),
    ).toBe(true);
  });
  });