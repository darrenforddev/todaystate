import type { DatedPrice } from "./portfolioBeta";

export interface PortfolioStatisticsPosition {
  companyId: string;
  weight: number;
}

export interface PortfolioPriceSeries {
  companyId: string;
  prices: DatedPrice[];
}

export interface PortfolioStatisticsOptions {
  periodsPerYear?: number;
}

export interface PortfolioPositionStatistics {
  companyId: string;
  weight: number;
  annualisedVolatility: number;
  riskContribution: number;
}

export interface PairwiseCorrelation {
  firstCompanyId: string;
  secondCompanyId: string;
  correlation: number;
}

export interface PortfolioStatisticsResult {
  portfolioAnnualisedVolatility: number;
  averagePairwiseCorrelation: number;
  grossWeight: number;
  netWeight: number;
  priceObservations: number;
  returnObservations: number;
  startDate: string;
  endDate: string;
  positions: PortfolioPositionStatistics[];
  correlations: PairwiseCorrelation[];
  methodology: string;
}

interface ValidPosition {
  companyId: string;
  weight: number;
}

function round(
  value: number,
  decimalPlaces: number,
): number {
  const multiplier = 10 ** decimalPlaces;

  return (
    Math.round(value * multiplier) /
    multiplier
  );
}

function normalisePeriodsPerYear(
  periodsPerYear: number | undefined,
): number {
  if (
    periodsPerYear === undefined ||
    !Number.isFinite(periodsPerYear) ||
    periodsPerYear <= 0
  ) {
    return 252;
  }

  return periodsPerYear;
}

function buildPriceMap(
  prices: DatedPrice[],
): Map<string, number> {
  const priceMap = new Map<string, number>();

  for (const observation of prices) {
    const date = observation.date.trim();

    if (
      date.length === 0 ||
      !Number.isFinite(observation.price) ||
      observation.price <= 0
    ) {
      continue;
    }

    priceMap.set(date, observation.price);
  }

  return priceMap;
}

function normalisePositions(
  positions: PortfolioStatisticsPosition[],
): ValidPosition[] {
  const weightMap = new Map<string, number>();

  for (const position of positions) {
    const companyId = position.companyId.trim();

    if (
      companyId.length === 0 ||
      !Number.isFinite(position.weight) ||
      position.weight === 0
    ) {
      continue;
    }

    weightMap.set(
      companyId,
      (weightMap.get(companyId) ?? 0) +
        position.weight,
    );
  }

  return [...weightMap.entries()]
    .filter(([, weight]) => weight !== 0)
    .map(([companyId, weight]) => ({
      companyId,
      weight,
    }));
}

function calculateMean(
  values: number[],
): number {
  return (
    values.reduce(
      (total, value) => total + value,
      0,
    ) / values.length
  );
}

function calculateSampleCovariance(
  firstValues: number[],
  secondValues: number[],
): number {
  if (
    firstValues.length < 2 ||
    firstValues.length !== secondValues.length
  ) {
    return 0;
  }

  const firstMean =
    calculateMean(firstValues);

  const secondMean =
    calculateMean(secondValues);

  let total = 0;

  for (
    let index = 0;
    index < firstValues.length;
    index += 1
  ) {
    total +=
      (firstValues[index] - firstMean) *
      (secondValues[index] - secondMean);
  }

  return total / (firstValues.length - 1);
}

function calculateCovarianceMatrix(
  returnSeries: number[][],
): number[][] {
  return returnSeries.map(
    (firstReturns) =>
      returnSeries.map((secondReturns) =>
        calculateSampleCovariance(
          firstReturns,
          secondReturns,
        ),
      ),
  );
}

function calculateCorrelation(
  covariance: number,
  firstVariance: number,
  secondVariance: number,
): number {
  const denominator =
    Math.sqrt(firstVariance) *
    Math.sqrt(secondVariance);

  if (denominator === 0) {
    return 0;
  }

  return covariance / denominator;
}

export function calculatePortfolioStatistics(
  requestedPositions: PortfolioStatisticsPosition[],
  requestedPriceSeries: PortfolioPriceSeries[],
  options: PortfolioStatisticsOptions = {},
): PortfolioStatisticsResult | null {
  const positions = normalisePositions(
    requestedPositions,
  );

  if (positions.length === 0) {
    return null;
  }

  const seriesMap = new Map(
    requestedPriceSeries.map((series) => [
      series.companyId.trim(),
      buildPriceMap(series.prices),
    ]),
  );

  const priceMaps = positions.map(
    (position) =>
      seriesMap.get(position.companyId),
  );

  if (
    priceMaps.some(
      (priceMap) => priceMap === undefined,
    )
  ) {
    return null;
  }

  const completePriceMaps =
    priceMaps as Map<string, number>[];

  const commonDates = [
    ...completePriceMaps[0].keys(),
  ]
    .filter((date) =>
      completePriceMaps.every((priceMap) =>
        priceMap.has(date),
      ),
    )
    .sort((first, second) =>
      first.localeCompare(second),
    );

  if (commonDates.length < 3) {
    return null;
  }

  const returnSeries = positions.map(
    (_, positionIndex) => {
      const priceMap =
        completePriceMaps[positionIndex];

      const returns: number[] = [];

      for (
        let dateIndex = 1;
        dateIndex < commonDates.length;
        dateIndex += 1
      ) {
        const previousPrice = priceMap.get(
          commonDates[dateIndex - 1],
        ) as number;

        const currentPrice = priceMap.get(
          commonDates[dateIndex],
        ) as number;

        returns.push(
          currentPrice / previousPrice - 1,
        );
      }

      return returns;
    },
  );

  const covarianceMatrix =
    calculateCovarianceMatrix(returnSeries);

  let portfolioVariance = 0;

  for (
    let firstIndex = 0;
    firstIndex < positions.length;
    firstIndex += 1
  ) {
    for (
      let secondIndex = 0;
      secondIndex < positions.length;
      secondIndex += 1
    ) {
      portfolioVariance +=
        positions[firstIndex].weight *
        positions[secondIndex].weight *
        covarianceMatrix[firstIndex][
          secondIndex
        ];
    }
  }

  const safePortfolioVariance = Math.max(
    0,
    portfolioVariance,
  );

  const periodsPerYear =
    normalisePeriodsPerYear(
      options.periodsPerYear,
    );

  const annualisationFactor =
    Math.sqrt(periodsPerYear);

  const portfolioStandardDeviation =
    Math.sqrt(safePortfolioVariance);

  const portfolioAnnualisedVolatility =
    portfolioStandardDeviation *
    annualisationFactor *
    100;

  const correlations: PairwiseCorrelation[] =
    [];

  for (
    let firstIndex = 0;
    firstIndex < positions.length;
    firstIndex += 1
  ) {
    for (
      let secondIndex = firstIndex + 1;
      secondIndex < positions.length;
      secondIndex += 1
    ) {
      correlations.push({
        firstCompanyId:
          positions[firstIndex].companyId,
        secondCompanyId:
          positions[secondIndex].companyId,
        correlation: round(
          calculateCorrelation(
            covarianceMatrix[firstIndex][
              secondIndex
            ],
            covarianceMatrix[firstIndex][
              firstIndex
            ],
            covarianceMatrix[secondIndex][
              secondIndex
            ],
          ),
          4,
        ),
      });
    }
  }

  const averagePairwiseCorrelation =
    correlations.length === 0
      ? 0
      : correlations.reduce(
          (total, pair) =>
            total + pair.correlation,
          0,
        ) / correlations.length;

  const positionStatistics =
    positions.map((position, index) => {
      const positionVariance =
        covarianceMatrix[index][index];

      let covarianceWithPortfolio = 0;

      for (
        let secondIndex = 0;
        secondIndex < positions.length;
        secondIndex += 1
      ) {
        covarianceWithPortfolio +=
          covarianceMatrix[index][
            secondIndex
          ] * positions[secondIndex].weight;
      }

      const riskContribution =
        portfolioStandardDeviation === 0
          ? 0
          : position.weight *
            covarianceWithPortfolio /
            portfolioStandardDeviation *
            annualisationFactor *
            100;

      return {
        companyId: position.companyId,
        weight: round(position.weight, 6),
        annualisedVolatility: round(
          Math.sqrt(
            Math.max(0, positionVariance),
          ) *
            annualisationFactor *
            100,
          2,
        ),
        riskContribution: round(
          riskContribution,
          2,
        ),
      };
    });

  return {
    portfolioAnnualisedVolatility: round(
      portfolioAnnualisedVolatility,
      2,
    ),
    averagePairwiseCorrelation: round(
      averagePairwiseCorrelation,
      4,
    ),
    grossWeight: round(
      positions.reduce(
        (total, position) =>
          total + Math.abs(position.weight),
        0,
      ),
      6,
    ),
    netWeight: round(
      positions.reduce(
        (total, position) =>
          total + position.weight,
        0,
      ),
      6,
    ),
    priceObservations: commonDates.length,
    returnObservations:
      commonDates.length - 1,
    startDate: commonDates[0],
    endDate:
      commonDates[commonDates.length - 1],
    positions: positionStatistics,
    correlations,
    methodology:
      "Portfolio volatility is calculated from signed position weights and the sample covariance matrix of aligned simple returns. Position volatility and portfolio volatility are annualised using the configured observation frequency. Correlations and risk contributions are backward-looking estimates and may change during stressed markets.",
  };
}