import { buildQualityScore } from "./qualityBuilder";
import { qualityTestUniverse } from "./qualityTestData";
import type { QualityScore } from "./types";

export interface QualityTestResult {
  companyId: string;
  quality: QualityScore;
}

const testCompanyIds = [
  "atlas",
  "beacon",
  "cascade",
];

export const qualityTestResults: QualityTestResult[] =
  testCompanyIds.map((companyId) => ({
    companyId,
    quality: buildQualityScore(
      companyId,
      qualityTestUniverse,
    ),
  }));