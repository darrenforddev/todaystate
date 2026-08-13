import type {
  BalancedPortfolioSelection,
} from "./portfolio";

import {
  calculateHistoricalBeta,
  type DatedPrice,
  type PortfolioBetaResult,
} from "./portfolioBeta";

import {
  calculatePortfolioExposure,
  type PortfolioExposureReport,
} from "./portfolioExposure";

import {
  auditPortfolioImplementation,
  type PortfolioImplementationReport,
} from "./portfolioImplementation";

import {
  calculatePortfolioStatistics,
  type PortfolioStatisticsResult,
} from "./portfolioStatistics";

import {
  calculatePortfolioStress,
  type MarketStressScenario,
  type PortfolioStressReport,
} from "./portfolioStress";

export type PortfolioAnalysisStatus =
  | "not-ready"
  | "limited"
  | "research-ready";

export type PortfolioBetaSource =
  | "supplied"
  | "calculated"
  | "unavailable";

export interface PortfolioCompanyRiskData {
  companyId: string;
  prices?: DatedPrice[];
  beta?: number;
  averageDailyValueTraded?: number;
  borrowAvailable?: boolean;
  annualBorrowFeePercentage?: number;
  annualDividendYieldPercentage?: number;
  estimatedRoundTripCostPercentage?: number;
  holdingDays?: number;
}

export interface PortfolioAnalysisOptions {
  defaultNotionalPerPosition?: number;
  notionalByCompanyId?: Record<string, number>;
  betaNeutralTolerance?: number;
  benchmarkPrices?: DatedPrice[];
  companyData?: PortfolioCompanyRiskData[];
  periodsPerYear?: number;
  stressScenarios?: MarketStressScenario[];
  defaultHoldingDays?: number;
  maximumParticipationPercentage?: number;
  maximumBorrowFeePercentage?: number;
}

export interface PortfolioPositionDataCoverage {
  companyId: string;
  ticker: string;
  side: "long" | "short";
  betaSource: PortfolioBetaSource;
  hasPriceHistory: boolean;
  hasLiquidityData: boolean;
  hasTransactionCostData: boolean;
  hasBorrowData: boolean;
}

export interface PortfolioHistoricalBeta {
  companyId: string;
  result: PortfolioBetaResult;
}

export interface PortfolioAnalysisCoverage {
  positionCount: number;
  betaCoveredPositions: number;
  betaCoveragePercentage: number;
  priceCoveredPositions: number;
  priceCoveragePercentage: number;
  liquidityCoveredPositions: number;
  liquidityCoveragePercentage: number;
  implementationCostCoveredPositions: number;
  implementationCostCoveragePercentage: number;
  statisticsAvailable: boolean;
}

export interface PortfolioAnalysisReport {
  status: PortfolioAnalysisStatus;
  exposure: PortfolioExposureReport;
  historicalBetas: PortfolioHistoricalBeta[];
  statistics: PortfolioStatisticsResult | null;
  stress: PortfolioStressReport;
  implementation: PortfolioImplementationReport;
  positionCoverage: PortfolioPositionDataCoverage[];
  coverage: PortfolioAnalysisCoverage;
  warnings: string[];
  strengths: string[];
  methodology: string;
}

function calculateCoveragePercentage(
  covered: number,
  total: number,
): number {
  if (total === 0) {
    return 0;
  }

  return Math.round((covered / total) * 100);
}

function hasFiniteBeta(
  value: number | undefined,
): value is number {
  return (
    value !== undefined &&
    Number.isFinite(value)
  );
}

function hasUsablePriceHistory(
  prices: DatedPrice[] | undefined,
): boolean {
  if (!prices) {
    return false;
  }

  const validDates = new Set<string>();

  for (const observation of prices) {
    const date = observation.date.trim();

    if (
      date.length > 0 &&
      Number.isFinite(observation.price) &&
      observation.price > 0
    ) {
      validDates.add(date);
    }
  }

  return validDates.size >= 3;
}

function buildCompanyDataMap(
  requestedData:
    PortfolioCompanyRiskData[],
): Map<string, PortfolioCompanyRiskData> {
  const dataMap = new Map<
    string,
    PortfolioCompanyRiskData
  >();

  for (const companyData of requestedData) {
    const companyId =
      companyData.companyId.trim();

    if (companyId.length === 0) {
      continue;
    }

    dataMap.set(companyId, {
      ...companyData,
      companyId,
    });
  }

  return dataMap;
}

export function analysePortfolioSelection(
  selection: BalancedPortfolioSelection,
  options: PortfolioAnalysisOptions = {},
): PortfolioAnalysisReport {
  const companyDataMap =
    buildCompanyDataMap(
      options.companyData ?? [],
    );

  const selectedCandidates = [
    ...selection.longCandidates.map(
      (candidate) => ({
        candidate,
        side: "long" as const,
      }),
    ),
    ...selection.shortCandidates.map(
      (candidate) => ({
        candidate,
        side: "short" as const,
      }),
    ),
  ];

  const resolvedBetaByCompanyId:
    Record<string, number> = {};

  const betaSourceByCompanyId =
    new Map<
      string,
      PortfolioBetaSource
    >();

  const historicalBetas:
    PortfolioHistoricalBeta[] = [];

  for (const selected of selectedCandidates) {
    const companyId =
      selected.candidate.company.companyId;

    const companyData =
      companyDataMap.get(companyId);

    if (hasFiniteBeta(companyData?.beta)) {
      resolvedBetaByCompanyId[companyId] =
        companyData.beta;

      betaSourceByCompanyId.set(
        companyId,
        "supplied",
      );

      continue;
    }

    if (
      companyData?.prices &&
      options.benchmarkPrices
    ) {
      const historicalBeta =
        calculateHistoricalBeta(
          companyData.prices,
          options.benchmarkPrices,
          {
            periodsPerYear:
              options.periodsPerYear,
          },
        );

      if (historicalBeta) {
        resolvedBetaByCompanyId[companyId] =
          historicalBeta.beta;

        betaSourceByCompanyId.set(
          companyId,
          "calculated",
        );

        historicalBetas.push({
          companyId,
          result: historicalBeta,
        });

        continue;
      }
    }

    betaSourceByCompanyId.set(
      companyId,
      "unavailable",
    );
  }

  const exposure =
    calculatePortfolioExposure(
      selection,
      {
        defaultNotionalPerPosition:
          options.defaultNotionalPerPosition,
        notionalByCompanyId:
          options.notionalByCompanyId,
        betaByCompanyId:
          resolvedBetaByCompanyId,
        betaNeutralTolerance:
          options.betaNeutralTolerance,
      },
    );

  const everyPositionHasPrices =
    exposure.positions.length > 0 &&
    exposure.positions.every(
      (position) =>
        hasUsablePriceHistory(
          companyDataMap.get(
            position.companyId,
          )?.prices,
        ),
    );

  const statistics =
    everyPositionHasPrices &&
    exposure.capital.grossNotional > 0
      ? calculatePortfolioStatistics(
          exposure.positions.map(
            (position) => ({
              companyId:
                position.companyId,
              weight:
                position.signedNotional /
                exposure.capital
                  .grossNotional,
            }),
          ),
          exposure.positions.map(
            (position) => ({
              companyId:
                position.companyId,
              prices:
                companyDataMap.get(
                  position.companyId,
                )?.prices ?? [],
            }),
          ),
          {
            periodsPerYear:
              options.periodsPerYear,
          },
        )
      : null;

  const stress =
    calculatePortfolioStress(
      exposure.positions.map(
        (position) => ({
          companyId:
            position.companyId,
          ticker: position.ticker,
          companyName:
            position.companyName,
          side: position.side,
          notional: position.notional,
          beta:
            resolvedBetaByCompanyId[
              position.companyId
            ],
        }),
      ),
      {
        scenarios:
          options.stressScenarios,
      },
    );

  const implementation =
    auditPortfolioImplementation(
      exposure.positions.map(
        (position) => {
          const companyData =
            companyDataMap.get(
              position.companyId,
            );

          return {
            companyId:
              position.companyId,
            ticker: position.ticker,
            companyName:
              position.companyName,
            side: position.side,
            notional: position.notional,
            averageDailyValueTraded:
              companyData
                ?.averageDailyValueTraded,
            borrowAvailable:
              companyData?.borrowAvailable,
            annualBorrowFeePercentage:
              companyData
                ?.annualBorrowFeePercentage,
            annualDividendYieldPercentage:
              companyData
                ?.annualDividendYieldPercentage,
            estimatedRoundTripCostPercentage:
              companyData
                ?.estimatedRoundTripCostPercentage,
            holdingDays:
              companyData?.holdingDays,
          };
        },
      ),
      {
        defaultHoldingDays:
          options.defaultHoldingDays,
        maximumParticipationPercentage:
          options
            .maximumParticipationPercentage,
        maximumBorrowFeePercentage:
          options.maximumBorrowFeePercentage,
      },
    );

  const positionCoverage:
    PortfolioPositionDataCoverage[] =
    exposure.positions.map((position) => {
      const companyData =
        companyDataMap.get(
          position.companyId,
        );

      return {
        companyId: position.companyId,
        ticker: position.ticker,
        side: position.side,
        betaSource:
          betaSourceByCompanyId.get(
            position.companyId,
          ) ?? "unavailable",
        hasPriceHistory:
          hasUsablePriceHistory(
            companyData?.prices,
          ),
        hasLiquidityData:
          companyData
            ?.averageDailyValueTraded !==
            undefined &&
          Number.isFinite(
            companyData
              .averageDailyValueTraded,
          ) &&
          companyData
            .averageDailyValueTraded > 0,
        hasTransactionCostData:
          companyData
            ?.estimatedRoundTripCostPercentage !==
            undefined &&
          Number.isFinite(
            companyData
              .estimatedRoundTripCostPercentage,
          ) &&
          companyData
            .estimatedRoundTripCostPercentage >=
            0,
        hasBorrowData:
          position.side === "long" ||
          companyData?.borrowAvailable !==
            undefined,
      };
    });

  const priceCoveredPositions =
    positionCoverage.filter(
      (position) =>
        position.hasPriceHistory,
    ).length;

  const warnings: string[] = [];
  const strengths: string[] = [];

  if (exposure.positions.length === 0) {
    warnings.push(
      "No selected Long/Short positions are available for combined portfolio analysis.",
    );
  }

  if (
    exposure.positions.length > 0 &&
    exposure.beta.coveragePercentage < 100
  ) {
    warnings.push(
      `Beta coverage is ${exposure.beta.coveragePercentage}%, so beta exposure and stress estimates are incomplete.`,
    );
  }

  if (
    exposure.positions.length > 0 &&
    !statistics
  ) {
    warnings.push(
      "Portfolio volatility and correlation cannot yet be calculated from complete aligned price histories.",
    );
  }

  if (
    implementation.blockers.length > 0
  ) {
    warnings.push(
      `${implementation.blockers.length} implementation blocker${
        implementation.blockers.length === 1
          ? ""
          : "s"
      } require review.`,
    );
  }

  if (
    implementation.warnings.length > 0
  ) {
    warnings.push(
      `${implementation.warnings.length} implementation data warning${
        implementation.warnings.length === 1
          ? ""
          : "s"
      } remain unresolved.`,
    );
  }

  if (exposure.capital.isCapitalNeutral) {
    strengths.push(
      "The selected portfolio is capital-neutral before costs.",
    );
  }

  if (
    exposure.beta.coveragePercentage ===
      100 &&
    exposure.beta.isBetaNeutral
  ) {
    strengths.push(
      "The selected portfolio has complete beta coverage and is within the configured beta-neutral tolerance.",
    );
  }

  if (statistics) {
    strengths.push(
      "Portfolio volatility, correlation and position risk contributions are available from aligned price histories.",
    );
  }

  if (
    stress.coveragePercentage === 100 &&
    stress.scenarios.length > 0
  ) {
    strengths.push(
      "Every selected position is included in the configured market stress scenarios.",
    );
  }

  if (
    implementation.status ===
    "research-implementable"
  ) {
    strengths.push(
      "Liquidity, transaction-cost and Short implementation inputs pass the configured research checks.",
    );
  }

  const isResearchReady =
    exposure.positions.length > 0 &&
    exposure.capital.isCapitalNeutral &&
    exposure.beta.coveragePercentage ===
      100 &&
    exposure.beta.isBetaNeutral &&
    statistics !== null &&
    stress.coveragePercentage === 100 &&
    implementation.status ===
      "research-implementable";

  const status: PortfolioAnalysisStatus =
    exposure.positions.length === 0
      ? "not-ready"
      : isResearchReady
        ? "research-ready"
        : "limited";

  return {
    status,
    exposure,
    historicalBetas,
    statistics,
    stress,
    implementation,
    positionCoverage,
    coverage: {
      positionCount:
        exposure.positions.length,
      betaCoveredPositions:
        exposure.beta.coveredPositions,
      betaCoveragePercentage:
        exposure.beta
          .coveragePercentage,
      priceCoveredPositions,
      priceCoveragePercentage:
        calculateCoveragePercentage(
          priceCoveredPositions,
          exposure.positions.length,
        ),
      liquidityCoveredPositions:
        implementation
          .liquidityCoveredPositions,
      liquidityCoveragePercentage:
        implementation
          .liquidityCoveragePercentage,
      implementationCostCoveredPositions:
        implementation
          .costCoveredPositions,
      implementationCostCoveragePercentage:
        implementation
          .costCoveragePercentage,
      statisticsAvailable:
        statistics !== null,
    },
    warnings,
    strengths,
    methodology:
      "This combined research report resolves supplied or historically calculated beta data, capital exposure, signed portfolio volatility and correlation, market stress estimates, liquidity, transaction costs and Short implementation constraints. Missing inputs remain visible and prevent a research-ready classification. The report is not a trade instruction and does not represent executable broker pricing.",
  };
}