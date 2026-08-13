import type {
  BalancedPortfolioSelection,
} from "./portfolio";

import {
  analysePortfolioSelection,
  type PortfolioAnalysisOptions,
  type PortfolioAnalysisReport,
} from "./portfolioAnalysis";

import {
  adaptPortfolioMarketData,
  type PortfolioCompanyMarketDataInput,
  type PortfolioMarketDataAdapterOptions,
  type PortfolioMarketDataAdapterReport,
} from "./portfolioMarketData";

export type PortfolioPipelineStatus =
  | "not-ready"
  | "limited"
  | "research-ready";

export interface PortfolioPipelineOptions {
  marketData?: PortfolioMarketDataAdapterOptions;
  analysis?: Omit<
    PortfolioAnalysisOptions,
    "companyData"
  >;
}

export interface PortfolioPipelineCoverage {
  selectedPositionCount: number;
  suppliedCompanyCount: number;
  acceptedCompanyCount: number;
  rejectedCompanyCount: number;
  matchedPositionCount: number;
  unmatchedPositionCount: number;
  matchedPositionPercentage: number;
}

export interface PortfolioPipelineReport {
  status: PortfolioPipelineStatus;
  marketData: PortfolioMarketDataAdapterReport;
  analysis: PortfolioAnalysisReport;
  coverage: PortfolioPipelineCoverage;
  warnings: string[];
  strengths: string[];
  methodology: string;
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

function getSelectedCompanyIds(
  selection: BalancedPortfolioSelection,
): string[] {
  return [
    ...selection.longCandidates.map(
      (candidate) =>
        candidate.company.companyId,
    ),
    ...selection.shortCandidates.map(
      (candidate) =>
        candidate.company.companyId,
    ),
  ];
}

function determinePipelineStatus(
  analysis: PortfolioAnalysisReport,
  marketData: PortfolioMarketDataAdapterReport,
  unmatchedPositionCount: number,
): PortfolioPipelineStatus {
  if (analysis.status === "not-ready") {
    return "not-ready";
  }

  if (
    analysis.status === "research-ready" &&
    marketData.status === "ready" &&
    unmatchedPositionCount === 0
  ) {
    return "research-ready";
  }

  return "limited";
}

export function runPortfolioAnalysisPipeline(
  selection: BalancedPortfolioSelection,
  providerInputs: PortfolioCompanyMarketDataInput[],
  options: PortfolioPipelineOptions = {},
): PortfolioPipelineReport {
  const marketData =
    adaptPortfolioMarketData(
      providerInputs,
      options.marketData,
    );

  const analysis =
    analysePortfolioSelection(
      selection,
      {
        ...options.analysis,
        companyData:
          marketData.companyData,
      },
    );

  const selectedCompanyIds =
    getSelectedCompanyIds(selection);

  const acceptedCompanyIds = new Set(
    marketData.companyData.map(
      (company) => company.companyId,
    ),
  );

  const matchedPositionCount =
    selectedCompanyIds.filter(
      (companyId) =>
        acceptedCompanyIds.has(companyId),
    ).length;

  const unmatchedPositionCount =
    selectedCompanyIds.length -
    matchedPositionCount;

  const coverage: PortfolioPipelineCoverage = {
    selectedPositionCount:
      selectedCompanyIds.length,
    suppliedCompanyCount:
      marketData.suppliedCompanyCount,
    acceptedCompanyCount:
      marketData.acceptedCompanyCount,
    rejectedCompanyCount:
      marketData.rejectedCompanyCount,
    matchedPositionCount,
    unmatchedPositionCount,
    matchedPositionPercentage:
      calculatePercentage(
        matchedPositionCount,
        selectedCompanyIds.length,
      ),
  };

  const warnings: string[] = [];
  const strengths: string[] = [];

  if (providerInputs.length === 0) {
    warnings.push(
      "No provider market data was supplied to the portfolio pipeline.",
    );
  }

  if (marketData.errors.length > 0) {
    warnings.push(
      `${marketData.errors.length} provider data error${
        marketData.errors.length === 1
          ? ""
          : "s"
      } caused one or more records to be rejected before portfolio analysis.`,
    );
  }

  if (marketData.warnings.length > 0) {
    warnings.push(
      `${marketData.warnings.length} provider data warning${
        marketData.warnings.length === 1
          ? ""
          : "s"
      } require review.`,
    );
  }

  if (unmatchedPositionCount > 0) {
    warnings.push(
      `${unmatchedPositionCount} selected position${
        unmatchedPositionCount === 1
          ? " is"
          : "s are"
      } not matched to an accepted provider record.`,
    );
  }

  warnings.push(...analysis.warnings);

  if (
    marketData.suppliedCompanyCount > 0 &&
    marketData.rejectedCompanyCount === 0
  ) {
    strengths.push(
      "Every supplied provider record reached downstream portfolio data-quality review.",
    );
  }

  if (
    selectedCompanyIds.length > 0 &&
    unmatchedPositionCount === 0
  ) {
    strengths.push(
      "Every selected portfolio position is matched to an accepted provider record.",
    );
  }

  if (marketData.status === "ready") {
    strengths.push(
      "Provider market data passed adapter normalisation without errors or missing metadata.",
    );
  }

  strengths.push(...analysis.strengths);

  const status = determinePipelineStatus(
    analysis,
    marketData,
    unmatchedPositionCount,
  );

  return {
    status,
    marketData,
    analysis,
    coverage,
    warnings,
    strengths,
    methodology:
      "This provider-neutral pipeline converts external market-data records into TodayScore risk inputs, rejects structurally invalid or duplicated provider records, applies the portfolio data-quality gate and then runs the combined exposure, beta, volatility, correlation, stress, liquidity and implementation analysis. A research-ready result requires complete provider normalisation, full selected-position matching and a research-ready downstream analysis. It is not a trade instruction.",
  };
}