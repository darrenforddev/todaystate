export interface DatedPrice {
  date: string;
  price: number;
}

export interface PortfolioBetaOptions {
  periodsPerYear?: number;
}

export interface PortfolioBetaResult {
  beta: number;
  correlation: number;
  assetAnnualisedVolatility: number;
  marketAnnualisedVolatility: number;
  priceObservations: number;
  returnObservations: number;
  startDate: string;
  endDate: string;
  methodology: string;
}

interface AlignedPrice {
  date: string;
  assetPrice: number;
  marketPrice: number;
}

interface AlignedReturn {
  date: string;
  assetReturn: number;
  marketReturn: number;
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

function alignPrices(
  assetPrices: DatedPrice[],
  marketPrices: DatedPrice[],
): AlignedPrice[] {
  const assetPriceMap =
    buildPriceMap(assetPrices);

  const marketPriceMap =
    buildPriceMap(marketPrices);

  return [...assetPriceMap.keys()]
    .filter((date) => marketPriceMap.has(date))
    .sort((first, second) =>
      first.localeCompare(second),
    )
    .map((date) => ({
      date,
      assetPrice: assetPriceMap.get(date) as number,
      marketPrice: marketPriceMap.get(
        date,
      ) as number,
    }));
}

function calculateAlignedReturns(
  prices: AlignedPrice[],
): AlignedReturn[] {
  const returns: AlignedReturn[] = [];

  for (
    let index = 1;
    index < prices.length;
    index += 1
  ) {
    const previous = prices[index - 1];
    const current = prices[index];

    returns.push({
      date: current.date,
      assetReturn:
        current.assetPrice /
          previous.assetPrice -
        1,
      marketReturn:
        current.marketPrice /
          previous.marketPrice -
        1,
    });
  }

  return returns;
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

function calculateSampleVariance(
  values: number[],
): number {
  if (values.length < 2) {
    return 0;
  }

  const mean = calculateMean(values);

  const squaredDifferences = values.reduce(
    (total, value) =>
      total + (value - mean) ** 2,
    0,
  );

  return squaredDifferences / (values.length - 1);
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

  let covarianceTotal = 0;

  for (
    let index = 0;
    index < firstValues.length;
    index += 1
  ) {
    covarianceTotal +=
      (firstValues[index] - firstMean) *
      (secondValues[index] - secondMean);
  }

  return (
    covarianceTotal /
    (firstValues.length - 1)
  );
}

export function calculateHistoricalBeta(
  assetPrices: DatedPrice[],
  marketPrices: DatedPrice[],
  options: PortfolioBetaOptions = {},
): PortfolioBetaResult | null {
  const alignedPrices = alignPrices(
    assetPrices,
    marketPrices,
  );

  if (alignedPrices.length < 3) {
    return null;
  }

  const alignedReturns =
    calculateAlignedReturns(alignedPrices);

  const assetReturns = alignedReturns.map(
    (observation) =>
      observation.assetReturn,
  );

  const marketReturns = alignedReturns.map(
    (observation) =>
      observation.marketReturn,
  );

  const marketVariance =
    calculateSampleVariance(marketReturns);

  const assetVariance =
    calculateSampleVariance(assetReturns);

  if (
    marketVariance <= 0 ||
    assetVariance < 0
  ) {
    return null;
  }

  const covariance =
    calculateSampleCovariance(
      assetReturns,
      marketReturns,
    );

  const beta = covariance / marketVariance;

  const assetStandardDeviation =
    Math.sqrt(assetVariance);

  const marketStandardDeviation =
    Math.sqrt(marketVariance);

  const correlationDenominator =
    assetStandardDeviation *
    marketStandardDeviation;

  const correlation =
    correlationDenominator === 0
      ? 0
      : covariance /
        correlationDenominator;

  const periodsPerYear =
    normalisePeriodsPerYear(
      options.periodsPerYear,
    );

  const annualisationFactor =
    Math.sqrt(periodsPerYear);

  return {
    beta: round(beta, 4),
    correlation: round(correlation, 4),
    assetAnnualisedVolatility: round(
      assetStandardDeviation *
        annualisationFactor *
        100,
      2,
    ),
    marketAnnualisedVolatility: round(
      marketStandardDeviation *
        annualisationFactor *
        100,
      2,
    ),
    priceObservations:
      alignedPrices.length,
    returnObservations:
      alignedReturns.length,
    startDate: alignedPrices[0].date,
    endDate:
      alignedPrices[
        alignedPrices.length - 1
      ].date,
    methodology:
      "Historical beta is calculated from aligned simple returns using sample covariance divided by market-return variance. Volatility is annualised using the configured observation frequency. The result is backward-looking and may change across market regimes.",
  };
}