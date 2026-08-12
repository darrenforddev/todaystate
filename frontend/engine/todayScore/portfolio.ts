import type { ScreenerCompany } from "./screener";

export interface PortfolioCandidate {
  rank: number;
  company: ScreenerCompany;
  todayScore: number;
  reason: string;
}

export interface PortfolioCandidateLists {
  longCandidates: PortfolioCandidate[];
  watchCandidates: PortfolioCandidate[];
  shortCandidates: PortfolioCandidate[];
  warnings: string[];
}

function getCandidateReason(
  company: ScreenerCompany,
): string {
  const score = company.result.todayScore.score;

  if (company.decision === "long") {
    return `TodayScore ${score} qualifies as a Long candidate after applying the theme-alignment safeguard.`;
  }

  if (company.decision === "short") {
    return `TodayScore ${score} qualifies as a Short candidate.`;
  }

  return `TodayScore ${score} remains on Watch because it does not currently satisfy the Long or Short requirements.`;
}

function buildRankedCandidates(
  companies: ScreenerCompany[],
  weakestFirst: boolean,
): PortfolioCandidate[] {
  return [...companies]
    .sort((first, second) => {
      const firstScore =
        first.result.todayScore.score;

      const secondScore =
        second.result.todayScore.score;

      const scoreDifference = weakestFirst
        ? firstScore - secondScore
        : secondScore - firstScore;

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      return first.ticker.localeCompare(
        second.ticker,
      );
    })
    .map((company, index) => ({
      rank: index + 1,
      company,
      todayScore:
        company.result.todayScore.score,
      reason: getCandidateReason(company),
    }));
}

export function buildPortfolioCandidateLists(
  companies: ScreenerCompany[],
): PortfolioCandidateLists {
  const longCandidates = buildRankedCandidates(
    companies.filter(
      (company) => company.decision === "long",
    ),
    false,
  );

  const watchCandidates = buildRankedCandidates(
    companies.filter(
      (company) => company.decision === "watch",
    ),
    false,
  );

  const shortCandidates = buildRankedCandidates(
    companies.filter(
      (company) => company.decision === "short",
    ),
    true,
  );

  const warnings: string[] = [];

  if (longCandidates.length === 0) {
    warnings.push(
      "No companies currently satisfy the Long-candidate requirements.",
    );
  }

  if (shortCandidates.length === 0) {
    warnings.push(
      "No companies currently satisfy the Short-candidate requirements.",
    );
  }

  if (
    longCandidates.length === 0 ||
    shortCandidates.length === 0
  ) {
    warnings.push(
      "A hedged long/short selection cannot currently be formed from this universe.",
    );
  }

  return {
    longCandidates,
    watchCandidates,
    shortCandidates,
    warnings,
  };
}
export interface BalancedPortfolioSelection {
  longCandidates: PortfolioCandidate[];
  shortCandidates: PortfolioCandidate[];
  excludedLongCandidates: PortfolioCandidate[];
  excludedShortCandidates: PortfolioCandidate[];
  pairCount: number;
  warnings: string[];
  methodology: string;
}

export function buildBalancedPortfolioSelection(
  companies: ScreenerCompany[],
  maximumPairs = Number.POSITIVE_INFINITY,
): BalancedPortfolioSelection {
  const candidateLists =
    buildPortfolioCandidateLists(companies);

  const safeMaximumPairs = Number.isFinite(
    maximumPairs,
  )
    ? Math.max(0, Math.floor(maximumPairs))
    : Number.MAX_SAFE_INTEGER;

  const pairCount = Math.min(
    candidateLists.longCandidates.length,
    candidateLists.shortCandidates.length,
    safeMaximumPairs,
  );

  const longCandidates =
    candidateLists.longCandidates.slice(
      0,
      pairCount,
    );

  const shortCandidates =
    candidateLists.shortCandidates.slice(
      0,
      pairCount,
    );

  const excludedLongCandidates =
    candidateLists.longCandidates.slice(pairCount);

  const excludedShortCandidates =
    candidateLists.shortCandidates.slice(pairCount);

  const warnings = [...candidateLists.warnings];

  if (
    pairCount > 0 &&
    candidateLists.longCandidates.length !==
      candidateLists.shortCandidates.length
  ) {
    warnings.push(
      `Only ${pairCount} equal-count long/short pair${
        pairCount === 1 ? "" : "s"
      } can be formed from the available candidates.`,
    );
  }

  if (
    pairCount === 0 &&
    candidateLists.longCandidates.length > 0 &&
    candidateLists.shortCandidates.length > 0
  ) {
    warnings.push(
      "The maximum-pair limit prevents any candidates from being selected.",
    );
  }

  return {
    longCandidates,
    shortCandidates,
    excludedLongCandidates,
    excludedShortCandidates,
    pairCount,
    warnings,
    methodology:
      "This research selection balances the number of Long and Short candidates. It is not yet beta-neutral, sector-neutral, capital-neutral or a trade recommendation.",
  };
}