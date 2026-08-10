import { buildValueScore } from "./valueBuilder";
import { valueTestUniverse } from "./valueTestData";
import type { ValueScore } from "./types";

export interface ValueTestResult {
  companyId: string;
  value: ValueScore;
}

const testCompanyIds = [
  "atlas",
  "beacon",
  "cascade",
];

export const valueTestResults: ValueTestResult[] =
  testCompanyIds.map((companyId) => ({
    companyId,
    value: buildValueScore(
      companyId,
      valueTestUniverse,
    ),
  }));