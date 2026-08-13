export type PortfolioImplementationSide =
  | "long"
  | "short";

export type PortfolioImplementationStatus =
  | "not-assessable"
  | "review"
  | "research-implementable";

export interface PortfolioImplementationPosition {
  companyId: string;
  ticker?: string;
  companyName?: string;
  side: PortfolioImplementationSide;
  notional: number;
  averageDailyValueTraded?: number;
  borrowAvailable?: boolean;
  annualBorrowFeePercentage?: number;
  annualDividendYieldPercentage?: number;
  estimatedRoundTripCostPercentage?: number;
  holdingDays?: number;
}

export interface PortfolioImplementationOptions {
  defaultHoldingDays?: number;
  maximumParticipationPercentage?: number;
  maximumBorrowFeePercentage?: number;
}

export interface PositionImplementationResult {
  companyId: string;
  ticker?: string;
  companyName?: string;
  side: PortfolioImplementationSide;
  notional: number;
  holdingDays: number;
  averageDailyValueTraded?: number;
  participationPercentage?: number;
  borrowAvailable?: boolean;
  annualBorrowFeePercentage?: number;
  annualDividendYieldPercentage?: number;
  estimatedTransactionCost?: number;
  estimatedBorrowCost?: number;
  estimatedDividendCost?: number;
  estimatedTotalCost?: number;
  estimatedTotalCostPercentage?: number;
  warnings: string[];
  blockers: string[];
  strengths: string[];
}

export interface PortfolioImplementationReport {
  status: PortfolioImplementationStatus;
  totalPositions: number;
  shortPositions: number;
  liquidityCoveredPositions: number;
  liquidityCoveragePercentage: number;
  borrowCoveredShortPositions: number;
  borrowCoveragePercentage: number;
  costCoveredPositions: number;
  costCoveragePercentage: number;
  grossNotional: number;
  estimatedCoveredCosts: number;
  positions: PositionImplementationResult[];
  warnings: string[];
  blockers: string[];
  strengths: string[];
  methodology: string;
}

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

function normaliseNonNegativeNumber(
  value: number | undefined,
): number | undefined {
  if (
    value === undefined ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    return undefined;
  }

  return value;
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

function isValidPosition(
  position: PortfolioImplementationPosition,
): boolean {
  return (
    position.companyId.trim().length > 0 &&
    Number.isFinite(position.notional) &&
    position.notional > 0
  );
}

export function auditPortfolioImplementation(
  requestedPositions:
    PortfolioImplementationPosition[],
  options: PortfolioImplementationOptions = {},
): PortfolioImplementationReport {
  const defaultHoldingDays =
    normalisePositiveNumber(
      options.defaultHoldingDays,
      60,
    );

  const maximumParticipationPercentage =
    normalisePositiveNumber(
      options.maximumParticipationPercentage,
      1,
    );

  const maximumBorrowFeePercentage =
    normalisePositiveNumber(
      options.maximumBorrowFeePercentage,
      10,
    );

  const validPositions =
    requestedPositions.filter(isValidPosition);

  const positionResults =
    validPositions.map((position) => {
      const warnings: string[] = [];
      const blockers: string[] = [];
      const strengths: string[] = [];

      const holdingDays =
        normalisePositiveNumber(
          position.holdingDays,
          defaultHoldingDays,
        );

      const averageDailyValueTraded =
        normalisePositiveNumber(
          position.averageDailyValueTraded,
          Number.NaN,
        );

      const hasLiquidityData =
        Number.isFinite(
          averageDailyValueTraded,
        );

      const participationPercentage =
        hasLiquidityData
          ? round(
              (position.notional /
                averageDailyValueTraded) *
                100,
              4,
            )
          : undefined;

      if (!hasLiquidityData) {
        warnings.push(
          "Average daily value traded is unavailable, so liquidity participation cannot be assessed.",
        );
      } else if (
        (participationPercentage ?? 0) >
        maximumParticipationPercentage
      ) {
        blockers.push(
          `The research notional represents ${participationPercentage}% of average daily value traded, above the configured ${maximumParticipationPercentage}% limit.`,
        );
      } else {
        strengths.push(
          "The research notional is within the configured liquidity-participation limit.",
        );
      }

      const roundTripCostPercentage =
        normaliseNonNegativeNumber(
          position
            .estimatedRoundTripCostPercentage,
        );

      const estimatedTransactionCost =
        roundTripCostPercentage === undefined
          ? undefined
          : round(
              position.notional *
                (roundTripCostPercentage /
                  100),
            );

      if (
        roundTripCostPercentage === undefined
      ) {
        warnings.push(
          "Estimated round-trip transaction costs are unavailable.",
        );
      }

      let annualBorrowFeePercentage:
        | number
        | undefined;

      let annualDividendYieldPercentage:
        | number
        | undefined;

      let estimatedBorrowCost:
        | number
        | undefined;

      let estimatedDividendCost:
        | number
        | undefined;

      if (position.side === "short") {
        annualBorrowFeePercentage =
          normaliseNonNegativeNumber(
            position
              .annualBorrowFeePercentage,
          );

        annualDividendYieldPercentage =
          normaliseNonNegativeNumber(
            position
              .annualDividendYieldPercentage,
          );

        if (
          position.borrowAvailable === false
        ) {
          blockers.push(
            "Short borrow is reported as unavailable.",
          );
        } else if (
          position.borrowAvailable ===
          undefined
        ) {
          warnings.push(
            "Short-borrow availability has not been confirmed.",
          );
        } else {
          strengths.push(
            "Short-borrow availability is confirmed for research review.",
          );
        }

        if (
          annualBorrowFeePercentage ===
          undefined
        ) {
          warnings.push(
            "The annual Short borrow fee is unavailable.",
          );
        } else {
          estimatedBorrowCost = round(
            position.notional *
              (annualBorrowFeePercentage /
                100) *
              (holdingDays / 365),
          );

          if (
            annualBorrowFeePercentage >
            maximumBorrowFeePercentage
          ) {
            blockers.push(
              `The annual Short borrow fee of ${annualBorrowFeePercentage}% exceeds the configured ${maximumBorrowFeePercentage}% limit.`,
            );
          }
        }

        if (
          annualDividendYieldPercentage ===
          undefined
        ) {
          warnings.push(
            "The dividend yield is unavailable, so the potential Short dividend obligation cannot be estimated.",
          );
        } else {
          estimatedDividendCost = round(
            position.notional *
              (annualDividendYieldPercentage /
                100) *
              (holdingDays / 365),
          );
        }
      }

      const costComponents = [
        estimatedTransactionCost,
        estimatedBorrowCost,
        estimatedDividendCost,
      ].filter(
        (value): value is number =>
          value !== undefined,
      );

      const hasCompleteCostCoverage =
        position.side === "long"
          ? estimatedTransactionCost !==
            undefined
          : estimatedTransactionCost !==
              undefined &&
            estimatedBorrowCost !==
              undefined &&
            estimatedDividendCost !==
              undefined;

      const estimatedTotalCost =
        costComponents.length === 0
          ? undefined
          : round(
              costComponents.reduce(
                (total, cost) =>
                  total + cost,
                0,
              ),
            );

      const estimatedTotalCostPercentage =
        estimatedTotalCost === undefined
          ? undefined
          : round(
              (estimatedTotalCost /
                position.notional) *
                100,
              4,
            );

      if (hasCompleteCostCoverage) {
        strengths.push(
          "Transaction and holding-cost inputs are complete for this position.",
        );
      }

      return {
        companyId: position.companyId,
        ticker: position.ticker,
        companyName: position.companyName,
        side: position.side,
        notional: round(position.notional),
        holdingDays: round(
          holdingDays,
          2,
        ),
        averageDailyValueTraded:
          hasLiquidityData
            ? round(
                averageDailyValueTraded,
              )
            : undefined,
        participationPercentage,
        borrowAvailable:
          position.side === "short"
            ? position.borrowAvailable
            : undefined,
        annualBorrowFeePercentage,
        annualDividendYieldPercentage,
        estimatedTransactionCost,
        estimatedBorrowCost,
        estimatedDividendCost,
        estimatedTotalCost,
        estimatedTotalCostPercentage,
        warnings,
        blockers,
        strengths,
      };
    });

  const shortPositionResults =
    positionResults.filter(
      (position) =>
        position.side === "short",
    );

  const liquidityCoveredPositions =
    positionResults.filter(
      (position) =>
        position
          .participationPercentage !==
        undefined,
    ).length;

  const borrowCoveredShortPositions =
    shortPositionResults.filter(
      (position) =>
        position.borrowAvailable !==
        undefined,
    ).length;

  const costCoveredPositions =
    positionResults.filter((position) => {
      if (position.side === "long") {
        return (
          position
            .estimatedTransactionCost !==
          undefined
        );
      }

      return (
        position
          .estimatedTransactionCost !==
          undefined &&
        position.estimatedBorrowCost !==
          undefined &&
        position.estimatedDividendCost !==
          undefined
      );
    }).length;

  const warnings = positionResults.flatMap(
    (position) =>
      position.warnings.map(
        (warning) =>
          `${position.ticker ?? position.companyId}: ${warning}`,
      ),
  );

  const blockers = positionResults.flatMap(
    (position) =>
      position.blockers.map(
        (blocker) =>
          `${position.ticker ?? position.companyId}: ${blocker}`,
      ),
  );

  const strengths = positionResults.flatMap(
    (position) =>
      position.strengths.map(
        (strength) =>
          `${position.ticker ?? position.companyId}: ${strength}`,
      ),
  );

  if (positionResults.length === 0) {
    warnings.push(
      "No valid portfolio positions are available for implementation review.",
    );
  }

  const status:
    PortfolioImplementationStatus =
    positionResults.length === 0
      ? "not-assessable"
      : blockers.length > 0 ||
          warnings.length > 0
        ? "review"
        : "research-implementable";

  return {
    status,
    totalPositions:
      positionResults.length,
    shortPositions:
      shortPositionResults.length,
    liquidityCoveredPositions,
    liquidityCoveragePercentage:
      calculateCoveragePercentage(
        liquidityCoveredPositions,
        positionResults.length,
      ),
    borrowCoveredShortPositions,
    borrowCoveragePercentage:
      calculateCoveragePercentage(
        borrowCoveredShortPositions,
        shortPositionResults.length,
      ),
    costCoveredPositions,
    costCoveragePercentage:
      calculateCoveragePercentage(
        costCoveredPositions,
        positionResults.length,
      ),
    grossNotional: round(
      positionResults.reduce(
        (total, position) =>
          total + position.notional,
        0,
      ),
    ),
    estimatedCoveredCosts: round(
      positionResults.reduce(
        (total, position) =>
          total +
          (position.estimatedTotalCost ??
            0),
        0,
      ),
    ),
    positions: positionResults,
    warnings,
    blockers,
    strengths,
    methodology:
      "This research implementation audit checks configured notional against average daily value traded and estimates transaction costs, annualised Short borrow fees and potential Short dividend obligations over the assumed holding period. Missing data remains a review warning. Results do not confirm executable prices, stock-loan inventory, margin availability, tax treatment, slippage during stress or broker-specific restrictions.",
  };
}