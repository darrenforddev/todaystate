import { screenerCompanyMetadata } from "@/data/screenerCompanies";

import { buildScreenerCompanies } from "./screener";
import {
  buildScreenerCompanyReport,
  findScreenerCompanyByTicker,
} from "./screenerReport";
import { todayScoreTestResults } from "./todayScoreTest";

const companies = buildScreenerCompanies(
  todayScoreTestResults,
  screenerCompanyMetadata,
);
const atlas = findScreenerCompanyByTicker(companies, "atls");
const cascade = findScreenerCompanyByTicker(companies, "CSCD");

if (!atlas || !cascade) {
  throw new Error("TodayScore report lookup test failed.");
}

const atlasReport = buildScreenerCompanyReport(atlas);
const cascadeReport = buildScreenerCompanyReport(cascade);

export const screenerReportTestResults = {
  caseInsensitiveLookupPassed: atlas.companyId === "atlas",
  completeCoveragePassed:
    atlasReport.coverage.overall.available === 42 &&
    atlasReport.coverage.overall.percentage === 100,
  zeroScoreExplanationPassed: cascadeReport.dataWarnings.some((warning) =>
    warning.includes("not caused by missing data"),
  ),
};

if (Object.values(screenerReportTestResults).some((passed) => !passed)) {
  throw new Error("TodayScore company report tests failed.");
}
