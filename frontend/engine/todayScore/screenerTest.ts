import { screenerCompanyMetadata } from "@/data/screenerCompanies";

import { todayScoreTestResults } from "./todayScoreTest";
import {
  buildScreenerCompanies,
  defaultScreenerFilters,
  filterScreenerCompanies,
} from "./screener";

const companies = buildScreenerCompanies(
  todayScoreTestResults,
  screenerCompanyMetadata,
);

const longCandidates = filterScreenerCompanies(companies, {
  ...defaultScreenerFilters,
  decision: "long",
});

const shortCandidates = filterScreenerCompanies(companies, {
  ...defaultScreenerFilters,
  decision: "short",
});

const highConfidenceIndustrials = filterScreenerCompanies(companies, {
  ...defaultScreenerFilters,
  sector: "Industrials",
  minimumThemeConfidence: 80,
});

export const screenerTestResults = {
  completeUniversePassed: companies.length === todayScoreTestResults.length,
  rankingPassed: companies.every(
    (company, index) =>
      index === 0 ||
      companies[index - 1].result.todayScore.score >=
        company.result.todayScore.score,
  ),
  longFilterPassed: longCandidates.every(
    (company) => company.decision === "long",
  ),
  shortFilterPassed: shortCandidates.every(
    (company) => company.decision === "short",
  ),
  combinedFilterPassed: highConfidenceIndustrials.every(
    (company) =>
      company.sector === "Industrials" && company.themeConfidence >= 80,
  ),
};

if (Object.values(screenerTestResults).some((passed) => !passed)) {
  throw new Error("TodayScore screener tests failed.");
}
