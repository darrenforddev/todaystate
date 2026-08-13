import type {
  BalancedPortfolioSelection,
  PortfolioCandidate,
} from "./portfolio";

export type PortfolioSide = "long" | "short";

export interface PortfolioExposureOptions {
  defaultNotionalPerPosition?: number;
  notionalByCompanyId?: Record<string, number>;
  betaByCompanyId?: Record<string, number>;
  betaNeutralTolerance?: number;
}

export interface PortfolioPositionExposure {
  companyId: string;
  ticker: string;
  companyName: string;
  side: PortfolioSide;
  notional: number;
  signedNotional: number;
  beta?: number;
  betaAdjustedNotional?: number;
}

export interface PortfolioCapitalExposure {
  longNotional: number;
  shortNotional: number;
  grossNotional: number;
  netNotional: number;
  netExposurePercentage: number;
  longShortRatio: number | null;
  isCapitalNeutral: boolean;
}

export interface PortfolioBetaExposure {
  longBetaAdjustedNotional: number;
  shortBetaAdjustedNotional: number;
  grossBetaAdjustedNotional: number;
  netBetaAdjustedNotional: number;
  coveredPositions: number;
  totalPositions: number;
  coveragePercentage: number;
  isBetaNeutral: boolean;
}

export interface PortfolioExposureReport {
  positions: PortfolioPositionExposure[];
  capital: PortfolioCapitalExposure;
  beta: PortfolioBetaExposure;
  warnings: string[];
  strengths: string[];
  methodology: string;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function normalisePositiveNumber(
  value: number | undefined,
  fallback: number,
): number {
  if (
    value === undefined ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return fallback;
  }

  return value;
}

function normaliseTolerance(
  value: number | undefined,
): number {
  if (
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return 0.05;
  }

  return Math.max(0, Math.min(1, value));
}

function buildPositionExposure(
  candidate: PortfolioCandidate,
  side: PortfolioSide,
  defaultNotional: number,
  notionalByCompanyId: Record<string, number>,
  betaByCompanyId: Record<string, number>,
): PortfolioPositionExposure {
  const { company } = candidate;
  const requestedNotional =
    notionalByCompanyId[company.companyId];

  const notional = normalisePositiveNumber(
    requestedNotional,
    defaultNotional,
  );

  const requestedBeta =
    betaByCompanyId[company.companyId];

  const beta = Number.isFinite(requestedBeta)
    ? requestedBeta
    : undefined;

  const direction = side === "long" ? 1 : -1;
  const signedNotional = notional * direction;

  return {
    companyId: company.companyId,
    ticker: company.ticker,
    companyName: company.companyName,
    side,
    notional: round(notional),
    signedNotional: round(signedNotional),
    beta,
    betaAdjustedNotional:
      beta === undefined
        ? undefined
        : round(signedNotional * beta),
  };
}

export function calculatePortfolioExposure(
  selection: BalancedPortfolioSelection,
  options: PortfolioExposureOptions = {},
): PortfolioExposureReport {
  const defaultNotional = normalisePositiveNumber(
    options.defaultNotionalPerPosition,
    10_000,
  );

  const notionalByCompanyId =
    options.notionalByCompanyId ?? {};

  const betaByCompanyId =
    options.betaByCompanyId ?? {};

  const betaNeutralTolerance =
    normaliseTolerance(
      options.betaNeutralTolerance,
    );

  const positions: PortfolioPositionExposure[] = [
    ...selection.longCandidates.map((candidate) =>
      buildPositionExposure(
        candidate,
        "long",
        defaultNotional,
        notionalByCompanyId,
        betaByCompanyId,
      ),
    ),
    ...selection.shortCandidates.map((candidate) =>
      buildPositionExposure(
        candidate,
        "short",
        defaultNotional,
        notionalByCompanyId,
        betaByCompanyId,
      ),
    ),
  ];

  const longNotional = positions
    .filter((position) => position.side === "long")
    .reduce(
      (total, position) =>
        total + position.notional,
      0,
    );

  const shortNotional = positions
    .filter((position) => position.side === "short")
    .reduce(
      (total, position) =>
        total + position.notional,
      0,
    );

  const grossNotional =
    longNotional + shortNotional;

  const netNotional =
    longNotional - shortNotional;

  const longShortRatio =
    shortNotional === 0
      ? null
      : round(longNotional / shortNotional);

  const netExposurePercentage =
    grossNotional === 0
      ? 0
      : round(
          (netNotional / grossNotional) * 100,
        );

  const isCapitalNeutral =
    grossNotional > 0 &&
    Math.abs(netNotional) < 0.01;

  const betaCoveredPositions = positions.filter(
    (position) =>
      position.betaAdjustedNotional !== undefined,
  );

  const longBetaAdjustedNotional =
    betaCoveredPositions
      .filter(
        (position) => position.side === "long",
      )
      .reduce(
        (total, position) =>
          total +
          Math.abs(
            position.betaAdjustedNotional ?? 0,
          ),
        0,
      );

  const shortBetaAdjustedNotional =
    betaCoveredPositions
      .filter(
        (position) => position.side === "short",
      )
      .reduce(
        (total, position) =>
          total +
          Math.abs(
            position.betaAdjustedNotional ?? 0,
          ),
        0,
      );

  const grossBetaAdjustedNotional =
    longBetaAdjustedNotional +
    shortBetaAdjustedNotional;

  const netBetaAdjustedNotional =
    betaCoveredPositions.reduce(
      (total, position) =>
        total +
        (position.betaAdjustedNotional ?? 0),
      0,
    );

  const coveragePercentage =
    positions.length === 0
      ? 0
      : Math.round(
          (betaCoveredPositions.length /
            positions.length) *
            100,
        );

  const hasCompleteBetaCoverage =
    positions.length > 0 &&
    betaCoveredPositions.length ===
      positions.length;

  const isBetaNeutral =
    hasCompleteBetaCoverage &&
    grossNotional > 0 &&
    Math.abs(netBetaAdjustedNotional) <=
      grossNotional * betaNeutralTolerance;

  const warnings: string[] = [];
  const strengths: string[] = [];

  if (positions.length === 0) {
    warnings.push(
      "No selected portfolio positions are available for exposure analysis.",
    );
  }

  if (
    positions.length > 0 &&
    !hasCompleteBetaCoverage
  ) {
    warnings.push(
      `Beta data is available for ${betaCoveredPositions.length} of ${positions.length} selected positions.`,
    );
  }

  if (
    grossNotional > 0 &&
    !isCapitalNeutral
  ) {
    const direction =
      netNotional > 0 ? "Long" : "Short";

    warnings.push(
      `The portfolio has a net ${direction} capital exposure of ${Math.abs(
        netExposurePercentage,
      )}% of gross notional.`,
    );
  }

  if (
    hasCompleteBetaCoverage &&
    !isBetaNeutral
  ) {
    const direction =
      netBetaAdjustedNotional > 0
        ? "Long"
        : "Short";

    warnings.push(
      `The portfolio has a net ${direction} beta-adjusted exposure of ${round(
        Math.abs(netBetaAdjustedNotional),
      )}.`,
    );
  }

  if (isCapitalNeutral) {
    strengths.push(
      "The selected portfolio is capital-neutral before costs.",
    );
  }

  if (isBetaNeutral) {
    strengths.push(
      "The selected portfolio is within the configured beta-neutral tolerance.",
    );
  }

  return {
    positions,
    capital: {
      longNotional: round(longNotional),
      shortNotional: round(shortNotional),
      grossNotional: round(grossNotional),
      netNotional: round(netNotional),
      netExposurePercentage,
      longShortRatio,
      isCapitalNeutral,
    },
    beta: {
      longBetaAdjustedNotional: round(
        longBetaAdjustedNotional,
      ),
      shortBetaAdjustedNotional: round(
        shortBetaAdjustedNotional,
      ),
      grossBetaAdjustedNotional: round(
        grossBetaAdjustedNotional,
      ),
      netBetaAdjustedNotional: round(
        netBetaAdjustedNotional,
      ),
      coveredPositions:
        betaCoveredPositions.length,
      totalPositions: positions.length,
      coveragePercentage,
      isBetaNeutral,
    },
    warnings,
    strengths,
    methodology:
      "Capital exposure uses configured research notionals. Beta-adjusted exposure is calculated only where finite company beta data is supplied. This analysis does not include volatility, correlation, liquidity, transaction costs, dividends or Short borrow availability.",
  };
}