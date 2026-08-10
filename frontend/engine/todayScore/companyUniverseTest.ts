import { realCompanyUniverse } from "@/data/realCompanyUniverse";

import { validateCompanyUniverse } from "./companyUniverse";

const validation = validateCompanyUniverse(realCompanyUniverse);

export const companyUniverseTestResults = {
  pilotSizePassed: realCompanyUniverse.length === 10,
  validationPassed: validation.valid,
  allAwaitingLiveDataPassed: realCompanyUniverse.every(
    (company) => company.dataStatus === "awaiting-live-data",
  ),
  allLseListingsPassed: realCompanyUniverse.every(
    (company) =>
      company.exchangeMic === "XLON" && company.quoteCurrency === "GBX",
  ),
};

if (Object.values(companyUniverseTestResults).some((passed) => !passed)) {
  throw new Error(
    `TodayScore company universe tests failed: ${validation.errors.join(", ")}`,
  );
}
