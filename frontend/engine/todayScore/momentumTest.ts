import { buildMomentumScore } from "./momentumBuilder";
import { momentumTestUniverse } from "./momentumTestData";
import type { MomentumScore } from "./types";

export interface MomentumTestResult {
  companyId: string;
  momentum: MomentumScore;
}

const testCompanyIds = [
  "atlas",
  "beacon",
  "cascade",
];

export const momentumTestResults: MomentumTestResult[] =
  testCompanyIds.map((companyId) => ({
    companyId,
    momentum: buildMomentumScore(
      companyId,
      momentumTestUniverse,
    ),
  }));