import type { TodayScoreTestResult } from "./todayScoreTest";

export type ScreenerDecision = "long" | "short" | "watch";
export type ThemeAlignment = "supportive" | "mixed" | "contradictory";

export interface ScreenerCompanyMetadata {
  companyId: string;
  ticker: string;
  companyName: string;
  brandDomain?: string;
  sector: string;
  industry: string;
  themeId: string;
  themeName: string;
  themeAlignment: ThemeAlignment;
  themeRationale: string;
  themeConfidence: number;
  historicalSuccessRate?: number;
  completedOutcomes: number;
}

export interface ScreenerCompany extends ScreenerCompanyMetadata {
  decision: ScreenerDecision;
  result: TodayScoreTestResult;
}

export interface ScreenerFilters {
  query: string;
  decision: "all" | "long" | "short";
  sector: string;
  themeId: string;
  minimumTodayScore: number;
  minimumQuality: number;
  minimumValue: number;
  minimumMomentum: number;
  minimumThemeConfidence: number;
  minimumHistoricalSuccessRate: number;
}

export const defaultScreenerFilters: ScreenerFilters = {
  query: "",
  decision: "all",
  sector: "all",
  themeId: "all",
  minimumTodayScore: 0,
  minimumQuality: 0,
  minimumValue: 0,
  minimumMomentum: 0,
  minimumThemeConfidence: 0,
  minimumHistoricalSuccessRate: 0,
};

export function getScreenerDecision(score: number): ScreenerDecision {
  if (score >= 65) return "long";
  if (score <= 35) return "short";
  return "watch";
}

export function buildScreenerCompanies(
  results: TodayScoreTestResult[],
  metadata: ScreenerCompanyMetadata[],
): ScreenerCompany[] {
  return results
    .map((result) => {
      const company = metadata.find(
        (item) => item.companyId === result.companyId,
      );

      if (!company) return undefined;

      return {
        ...company,
        decision: getScreenerDecision(result.todayScore.score),
        result,
      } satisfies ScreenerCompany;
    })
    .filter((company): company is ScreenerCompany => company !== undefined)
    .sort((a, b) => b.result.todayScore.score - a.result.todayScore.score);
}

export function filterScreenerCompanies(
  companies: ScreenerCompany[],
  filters: ScreenerFilters,
): ScreenerCompany[] {
  const query = filters.query.trim().toLowerCase();

  return companies.filter((company) => {
    const { todayScore } = company.result;

    if (
      query &&
      !company.companyName.toLowerCase().includes(query) &&
      !company.ticker.toLowerCase().includes(query)
    ) {
      return false;
    }

    if (
      filters.decision !== "all" &&
      company.decision !== filters.decision
    ) {
      return false;
    }

    if (filters.sector !== "all" && company.sector !== filters.sector) {
      return false;
    }

    if (filters.themeId !== "all" && company.themeId !== filters.themeId) {
      return false;
    }

    if (todayScore.score < filters.minimumTodayScore) return false;
    if (todayScore.quality < filters.minimumQuality) return false;
    if (todayScore.value < filters.minimumValue) return false;
    if (todayScore.momentum < filters.minimumMomentum) return false;
    if (company.themeConfidence < filters.minimumThemeConfidence) return false;

    if (
      company.historicalSuccessRate === undefined ||
      company.historicalSuccessRate < filters.minimumHistoricalSuccessRate
    ) {
      return filters.minimumHistoricalSuccessRate === 0;
    }

    return true;
  });
}
