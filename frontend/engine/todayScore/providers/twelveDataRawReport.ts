import "server-only";

import { buildRawTodayScoreReport } from "../buildRawFactorReport";
import type { RawTodayScoreReport } from "../rawFactors";
import { todayScoreDataRequirements } from "./requirements";
import type { ProviderCompanyIdentity, ProviderDatasetResult } from "./types";
import { TwelveDataProvider } from "./twelveData";

const SCORING_PRICE_HISTORY_SIZE = 400;

export async function fetchTwelveDataRawReport(
  provider: TwelveDataProvider,
  company: ProviderCompanyIdentity,
): Promise<RawTodayScoreReport> {
  const results: ProviderDatasetResult[] = [];

  // Deliberately sequential: a scoring run is an explicit development action,
  // and avoiding a burst of seven calls makes provider limits easier to audit.
  for (const requirement of todayScoreDataRequirements) {
    results.push(
      await provider.fetchDataset(company, requirement.id, {
        priceHistoryOutputSize:
          requirement.id === "price-history"
            ? SCORING_PRICE_HISTORY_SIZE
            : undefined,
      }),
    );
  }

  return buildRawTodayScoreReport(company, results);
}
