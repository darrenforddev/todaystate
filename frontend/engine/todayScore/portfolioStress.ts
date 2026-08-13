export type PortfolioStressSide =
  | "long"
  | "short";

export interface PortfolioStressPosition {
  companyId: string;
  ticker?: string;
  companyName?: string;
  side: PortfolioStressSide;
  notional: number;
  beta?: number;
}

export interface MarketStressScenario {
  id: string;
  name: string;
  marketMovePercentage: number;
}

export interface PortfolioStressOptions {
  scenarios?: MarketStressScenario[];
}

export interface PositionStressResult {
  companyId: string;
  ticker?: string;
  companyName?: string;
  side: PortfolioStressSide;
  notional: number;
  beta: number;
  expectedMovePercentage: number;
  estimatedProfitLoss: number;
}

export interface ScenarioStressResult {
  id: string;
  name: string;
  marketMovePercentage: number;
  longProfitLoss: number;
  shortProfitLoss: number;
  netProfitLoss: number;
  returnOnCoveredGrossPercentage: number;
  positions: PositionStressResult[];
}

export interface PortfolioStressReport {
  scenarios: ScenarioStressResult[];
  totalPositions: number;
  coveredPositions: number;
  coveragePercentage: number;
  grossNotional: number;
  coveredGrossNotional: number;
  notionalCoveragePercentage: number;
  warnings: string[];
  strengths: string[];
  methodology: string;
}

export const defaultMarketStressScenarios:
  MarketStressScenario[] = [
    {
      id: "market-down-20",
      name: "Severe market decline",
      marketMovePercentage: -20,
    },
    {
      id: "market-down-10",
      name: "Market correction",
      marketMovePercentage: -10,
    },
    {
      id: "market-down-5",
      name: "Moderate market decline",
      marketMovePercentage: -5,
    },
    {
      id: "market-up-5",
      name: "Moderate market advance",
      marketMovePercentage: 5,
    },
    {
      id: "market-up-10",
      name: "Strong market advance",
      marketMovePercentage: 10,
    },
    {
      id: "market-up-20",
      name: "Severe market advance",
      marketMovePercentage: 20,
    },
  ];

function round(
  value: number,
  decimalPlaces = 2,
): number {
  const multiplier = 10 ** decimalPlaces;

  return (
    Math.round(value * multiplier) /
    multiplier
  );
}

function isValidPosition(
  position: PortfolioStressPosition,
): boolean {
  return (
    position.companyId.trim().length > 0 &&
    Number.isFinite(position.notional) &&
    position.notional > 0
  );
}

function hasUsableBeta(
  position: PortfolioStressPosition,
): position is PortfolioStressPosition & {
  beta: number;
} {
  return (
    position.beta !== undefined &&
    Number.isFinite(position.beta)
  );
}

function normaliseScenarios(
  requestedScenarios:
    | MarketStressScenario[]
    | undefined,
): MarketStressScenario[] {
  const scenarios =
    requestedScenarios ??
    defaultMarketStressScenarios;

  const scenarioMap = new Map<
    string,
    MarketStressScenario
  >();

  for (const scenario of scenarios) {
    const id = scenario.id.trim();
    const name = scenario.name.trim();

    if (
      id.length === 0 ||
      name.length === 0 ||
      !Number.isFinite(
        scenario.marketMovePercentage,
      )
    ) {
      continue;
    }

    scenarioMap.set(id, {
      id,
      name,
      marketMovePercentage: round(
        scenario.marketMovePercentage,
        4,
      ),
    });
  }

  return [...scenarioMap.values()];
}

function calculatePositionStress(
  position: PortfolioStressPosition & {
    beta: number;
  },
  marketMovePercentage: number,
): PositionStressResult {
  const direction =
    position.side === "long" ? 1 : -1;

  const expectedMovePercentage =
    position.beta * marketMovePercentage;

  const estimatedProfitLoss =
    position.notional *
    direction *
    (expectedMovePercentage / 100);

  return {
    companyId: position.companyId,
    ticker: position.ticker,
    companyName: position.companyName,
    side: position.side,
    notional: round(position.notional),
    beta: round(position.beta, 4),
    expectedMovePercentage: round(
      expectedMovePercentage,
      4,
    ),
    estimatedProfitLoss: round(
      estimatedProfitLoss,
    ),
  };
}

export function calculatePortfolioStress(
  requestedPositions:
    PortfolioStressPosition[],
  options: PortfolioStressOptions = {},
): PortfolioStressReport {
  const positions =
    requestedPositions.filter(
      isValidPosition,
    );

  const coveredPositions =
    positions.filter(hasUsableBeta);

  const scenarios = normaliseScenarios(
    options.scenarios,
  );

  const grossNotional = positions.reduce(
    (total, position) =>
      total + position.notional,
    0,
  );

  const coveredGrossNotional =
    coveredPositions.reduce(
      (total, position) =>
        total + position.notional,
      0,
    );

  const scenarioResults =
    scenarios.map((scenario) => {
      const positionResults =
        coveredPositions.map((position) =>
          calculatePositionStress(
            position,
            scenario.marketMovePercentage,
          ),
        );

      const longProfitLoss =
        positionResults
          .filter(
            (position) =>
              position.side === "long",
          )
          .reduce(
            (total, position) =>
              total +
              position.estimatedProfitLoss,
            0,
          );

      const shortProfitLoss =
        positionResults
          .filter(
            (position) =>
              position.side === "short",
          )
          .reduce(
            (total, position) =>
              total +
              position.estimatedProfitLoss,
            0,
          );

      const netProfitLoss =
        longProfitLoss + shortProfitLoss;

      return {
        id: scenario.id,
        name: scenario.name,
        marketMovePercentage:
          scenario.marketMovePercentage,
        longProfitLoss: round(
          longProfitLoss,
        ),
        shortProfitLoss: round(
          shortProfitLoss,
        ),
        netProfitLoss: round(
          netProfitLoss,
        ),
        returnOnCoveredGrossPercentage:
          coveredGrossNotional === 0
            ? 0
            : round(
                (netProfitLoss /
                  coveredGrossNotional) *
                  100,
              ),
        positions: positionResults,
      };
    });

  const coveragePercentage =
    positions.length === 0
      ? 0
      : Math.round(
          (coveredPositions.length /
            positions.length) *
            100,
        );

  const notionalCoveragePercentage =
    grossNotional === 0
      ? 0
      : Math.round(
          (coveredGrossNotional /
            grossNotional) *
            100,
        );

  const warnings: string[] = [];
  const strengths: string[] = [];

  if (positions.length === 0) {
    warnings.push(
      "No valid portfolio positions are available for stress analysis.",
    );
  }

  if (
    positions.length > 0 &&
    coveredPositions.length <
      positions.length
  ) {
    warnings.push(
      `Stress estimates cover ${coveredPositions.length} of ${positions.length} valid positions because the remaining positions do not have usable beta data.`,
    );
  }

  if (scenarios.length === 0) {
    warnings.push(
      "No valid market stress scenarios were supplied.",
    );
  }

  if (
    positions.length > 0 &&
    coveredPositions.length ===
      positions.length
  ) {
    strengths.push(
      "Every valid position has beta data for the configured market stress scenarios.",
    );
  }

  if (scenarios.length > 0) {
    strengths.push(
      `${scenarios.length} market shock scenario${
        scenarios.length === 1
          ? " is"
          : "s are"
      } available for research review.`,
    );
  }

  return {
    scenarios: scenarioResults,
    totalPositions: positions.length,
    coveredPositions:
      coveredPositions.length,
    coveragePercentage,
    grossNotional: round(grossNotional),
    coveredGrossNotional: round(
      coveredGrossNotional,
    ),
    notionalCoveragePercentage,
    warnings,
    strengths,
    methodology:
      "Market stress profit and loss is estimated by multiplying each signed research notional by its supplied historical beta and the configured market move. Results exclude positions without usable beta data and do not model changing beta, company-specific shocks, volatility, correlation, liquidity, financing, dividends, transaction costs, margin calls or Short borrow constraints.",
  };
}