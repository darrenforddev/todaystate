import type {
  BalancedPortfolioSelection,
  PortfolioCandidate,
} from "./portfolio";

export type PortfolioMarketDataRequestStatus =
  | "not-ready"
  | "incomplete"
  | "ready";

export type PortfolioMarketDataField =
  | "historical-prices"
  | "daily-volume"
  | "beta"
  | "average-daily-value-traded"
  | "estimated-round-trip-cost"
  | "short-borrow-availability"
  | "annual-short-borrow-fee"
  | "annual-dividend-yield";

export interface PortfolioMarketDataRequestOptions {
  symbolByCompanyId?: Record<string, string>;
  currencyByCompanyId?: Record<string, string>;
  defaultCurrency?: string;
  benchmarkSymbol?: string;
  benchmarkCurrency?: string;
  minimumPriceObservations?: number;
  includeLiquidity?: boolean;
  includeImplementationCosts?: boolean;
}

export interface PortfolioPositionMarketDataRequest {
  companyId: string;
  ticker: string;
  companyName: string;
  side: "long" | "short";
  providerSymbol: string;
  currency?: string;
  minimumPriceObservations: number;
  requiredFields: PortfolioMarketDataField[];
  alternativeFields: PortfolioMarketDataField[];
  warnings: string[];
}

export interface PortfolioBenchmarkMarketDataRequest {
  providerSymbol: string;
  currency?: string;
  minimumPriceObservations: number;
  requiredFields: ["historical-prices"];
}

export interface PortfolioMarketDataRequestCoverage {
  selectedPositionCount: number;
  symbolReadyCount: number;
  symbolReadyPercentage: number;
  currencyReadyCount: number;
  currencyReadyPercentage: number;
  benchmarkReady: boolean;
}

export interface PortfolioMarketDataRequestManifest {
  status: PortfolioMarketDataRequestStatus;
  positions: PortfolioPositionMarketDataRequest[];
  benchmark: PortfolioBenchmarkMarketDataRequest | null;
  coverage: PortfolioMarketDataRequestCoverage;
  warnings: string[];
  strengths: string[];
  methodology: string;
}

function normalisePositiveInteger(
  value: number | undefined,
  fallback: number,
): number {
  if (
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return fallback;
  }

  return Math.max(2, Math.floor(value));
}

function normaliseOptionalText(
  value: string | undefined,
): string | undefined {
  const normalisedValue = value?.trim();

  return normalisedValue
    ? normalisedValue
    : undefined;
}

function normaliseCurrency(
  value: string | undefined,
): string | undefined {
  return normaliseOptionalText(
    value,
  )?.toUpperCase();
}

function calculatePercentage(
  covered: number,
  total: number,
): number {
  if (total === 0) {
    return 0;
  }

  return Math.round(
    (covered / total) * 100,
  );
}

function getRequiredFields(
  side: "long" | "short",
  includeLiquidity: boolean,
  includeImplementationCosts: boolean,
): PortfolioMarketDataField[] {
  const requiredFields:
    PortfolioMarketDataField[] = [
      "historical-prices",
    ];

  if (includeLiquidity) {
    requiredFields.push(
      "daily-volume",
      "average-daily-value-traded",
    );
  }

  if (includeImplementationCosts) {
    requiredFields.push(
      "estimated-round-trip-cost",
    );
  }

  if (side === "short") {
    requiredFields.push(
      "short-borrow-availability",
      "annual-short-borrow-fee",
      "annual-dividend-yield",
    );
  }

  return requiredFields;
}

function getAlternativeFields():
  PortfolioMarketDataField[] {
  return ["beta"];
}

function buildPositionRequest(
  candidate: PortfolioCandidate,
  side: "long" | "short",
  options: PortfolioMarketDataRequestOptions,
  minimumPriceObservations: number,
  includeLiquidity: boolean,
  includeImplementationCosts: boolean,
): PortfolioPositionMarketDataRequest {
  const company =
    candidate.company;

  const mappedSymbol =
    normaliseOptionalText(
      options.symbolByCompanyId?.[
        company.companyId
      ],
    );

  const ticker =
    company.ticker.trim();

  const providerSymbol =
    mappedSymbol ?? ticker;

  const currency =
    normaliseCurrency(
      options.currencyByCompanyId?.[
        company.companyId
      ] ??
        options.defaultCurrency,
    );

  const warnings: string[] = [];

  if (providerSymbol === "") {
    warnings.push(
      "No provider symbol is available for this selected position.",
    );
  }

  if (!currency) {
    warnings.push(
      "No currency is configured for this selected position.",
    );
  }

  return {
    companyId: company.companyId,
    ticker,
    companyName:
      company.companyName,
    side,
    providerSymbol,
    currency,
    minimumPriceObservations,
    requiredFields:
      getRequiredFields(
        side,
        includeLiquidity,
        includeImplementationCosts,
      ),
    alternativeFields:
      getAlternativeFields(),
    warnings,
  };
}

function findDuplicateProviderSymbols(
  positions: PortfolioPositionMarketDataRequest[],
): string[] {
  const counts = new Map<string, number>();

  for (const position of positions) {
    const symbol =
      position.providerSymbol
        .trim()
        .toUpperCase();

    if (symbol === "") {
      continue;
    }

    counts.set(
      symbol,
      (counts.get(symbol) ?? 0) + 1,
    );
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([symbol]) => symbol)
    .sort();
}

function determineManifestStatus(
  selectedPositionCount: number,
  warnings: string[],
): PortfolioMarketDataRequestStatus {
  if (selectedPositionCount === 0) {
    return "not-ready";
  }

  return warnings.length > 0
    ? "incomplete"
    : "ready";
}

export function buildPortfolioMarketDataRequest(
  selection: BalancedPortfolioSelection,
  options: PortfolioMarketDataRequestOptions = {},
): PortfolioMarketDataRequestManifest {
  const minimumPriceObservations =
    normalisePositiveInteger(
      options.minimumPriceObservations,
      60,
    );

  const includeLiquidity =
    options.includeLiquidity ?? true;

  const includeImplementationCosts =
    options.includeImplementationCosts ??
    true;

  const positions = [
    ...selection.longCandidates.map(
      (candidate) =>
        buildPositionRequest(
          candidate,
          "long",
          options,
          minimumPriceObservations,
          includeLiquidity,
          includeImplementationCosts,
        ),
    ),
    ...selection.shortCandidates.map(
      (candidate) =>
        buildPositionRequest(
          candidate,
          "short",
          options,
          minimumPriceObservations,
          includeLiquidity,
          includeImplementationCosts,
        ),
    ),
  ];

  const benchmarkSymbol =
    normaliseOptionalText(
      options.benchmarkSymbol,
    );

  const benchmarkCurrency =
    normaliseCurrency(
      options.benchmarkCurrency ??
        options.defaultCurrency,
    );

  const benchmark:
    PortfolioBenchmarkMarketDataRequest | null =
    benchmarkSymbol
      ? {
          providerSymbol:
            benchmarkSymbol,
          currency:
            benchmarkCurrency,
          minimumPriceObservations,
          requiredFields: [
            "historical-prices",
          ],
        }
      : null;

  const warnings: string[] = [];

  if (positions.length === 0) {
    warnings.push(
      "No selected portfolio positions are available for a market-data request.",
    );
  }

  for (const position of positions) {
    warnings.push(
      ...position.warnings.map(
        (warning) =>
          `${position.ticker || position.companyId}: ${warning}`,
      ),
    );
  }

  if (
    positions.length > 0 &&
    benchmark === null
  ) {
    warnings.push(
      "No benchmark symbol is configured, so historical beta cannot be calculated when provider beta is unavailable.",
    );
  }

  if (
    benchmark &&
    !benchmark.currency
  ) {
    warnings.push(
      "No currency is configured for the benchmark.",
    );
  }

  const duplicateProviderSymbols =
    findDuplicateProviderSymbols(
      positions,
    );

  if (
    duplicateProviderSymbols.length > 0
  ) {
    warnings.push(
      `Duplicate provider symbols require review: ${duplicateProviderSymbols.join(
        ", ",
      )}.`,
    );
  }

  const symbolReadyCount =
    positions.filter(
      (position) =>
        position.providerSymbol !== "",
    ).length;

  const currencyReadyCount =
    positions.filter(
      (position) =>
        position.currency !== undefined,
    ).length;

  const coverage:
    PortfolioMarketDataRequestCoverage = {
    selectedPositionCount:
      positions.length,
    symbolReadyCount,
    symbolReadyPercentage:
      calculatePercentage(
        symbolReadyCount,
        positions.length,
      ),
    currencyReadyCount,
    currencyReadyPercentage:
      calculatePercentage(
        currencyReadyCount,
        positions.length,
      ),
    benchmarkReady:
      benchmark !== null &&
      benchmark.currency !== undefined,
  };

  const strengths: string[] = [];

  if (
    positions.length > 0 &&
    symbolReadyCount === positions.length
  ) {
    strengths.push(
      "Every selected position has a provider symbol.",
    );
  }

  if (
    positions.length > 0 &&
    currencyReadyCount ===
      positions.length
  ) {
    strengths.push(
      "Every selected position has an explicit currency.",
    );
  }

  if (coverage.benchmarkReady) {
    strengths.push(
      "A benchmark symbol and currency are configured for historical beta calculations.",
    );
  }

  if (
    positions.length > 0 &&
    duplicateProviderSymbols.length === 0
  ) {
    strengths.push(
      "Selected positions have unique provider symbols.",
    );
  }

  const status =
    determineManifestStatus(
      positions.length,
      warnings,
    );

  return {
    status,
    positions,
    benchmark,
    coverage,
    warnings,
    strengths,
    methodology:
      "This provider-neutral request manifest describes the selected companies, benchmark, currencies, minimum price history and risk fields required by TodayScore. Historical prices are requested for portfolio statistics and beta calculation; provider beta is accepted as an alternative. Liquidity and implementation fields remain explicit so unavailable data cannot be mistaken for zero risk. The manifest requests data only and does not execute trades.",
  };
}