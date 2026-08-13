import type { PortfolioCompanyRiskData } from "./portfolioAnalysis";

export type PortfolioDataQualityStatus =
  | "invalid"
  | "stale"
  | "incomplete"
  | "ready";

export interface PortfolioDataQualityOptions {
  asOfDate?: string;
  minimumPriceObservations?: number;
  maximumPriceAgeDays?: number;
  maximumAbsoluteBeta?: number;
}

export interface PortfolioPriceQuality {
  suppliedObservations: number;
  validObservations: number;
  invalidObservations: number;
  duplicateDates: string[];
  latestObservationDate?: string;
  ageInDays?: number;
  stale: boolean;
  sufficientHistory: boolean;
}

export interface PortfolioCompanyDataQuality {
  companyId: string;
  status: PortfolioDataQualityStatus;
  priceQuality: PortfolioPriceQuality;
  hasValidBeta: boolean;
  hasValidLiquidity: boolean;
  hasValidTransactionCost: boolean;
  hasValidBorrowFee: boolean;
  hasValidDividendYield: boolean;
  hasValidHoldingPeriod: boolean;
  errors: string[];
  warnings: string[];
  strengths: string[];
}

export interface PortfolioDataQualityAudit {
  status: PortfolioDataQualityStatus;
  companyCount: number;
  readyCompanyCount: number;
  staleCompanyCount: number;
  incompleteCompanyCount: number;
  invalidCompanyCount: number;
  companyResults: PortfolioCompanyDataQuality[];
  duplicateCompanyIds: string[];
  errors: string[];
  warnings: string[];
  strengths: string[];
  methodology: string;
}

interface NormalisedPriceObservation {
  date: string;
  timestamp: number;
  value: number;
}

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

function normalisePositiveInteger(
  value: number | undefined,
  fallback: number,
): number {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(1, Math.floor(value));
}

function normalisePositiveNumber(
  value: number | undefined,
  fallback: number,
): number {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0, value);
}

function parseDate(value: unknown): number | null {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const timestamp = Date.parse(value);

  return Number.isFinite(timestamp) ? timestamp : null;
}

function getPriceValue(
  observation: Record<string, unknown>,
): number | null {
  const possibleValue =
    observation.close ??
    observation.adjustedClose ??
    observation.value;

  return typeof possibleValue === "number" &&
    Number.isFinite(possibleValue) &&
    possibleValue > 0
    ? possibleValue
    : null;
}

function normalisePriceObservation(
  observation: unknown,
): NormalisedPriceObservation | null {
  if (
    typeof observation !== "object" ||
    observation === null
  ) {
    return null;
  }

  const record = observation as Record<string, unknown>;
  const date = record.date;
  const timestamp = parseDate(date);
  const value = getPriceValue(record);

  if (
    typeof date !== "string" ||
    timestamp === null ||
    value === null
  ) {
    return null;
  }

  return {
    date,
    timestamp,
    value,
  };
}

function calculateAgeInDays(
  observationTimestamp: number,
  asOfTimestamp: number,
): number {
  return Math.max(
    0,
    Math.floor(
      (asOfTimestamp - observationTimestamp) /
        DAY_IN_MILLISECONDS,
    ),
  );
}

function auditPriceHistory(
  prices: PortfolioCompanyRiskData["prices"],
  asOfTimestamp: number,
  minimumPriceObservations: number,
  maximumPriceAgeDays: number,
): PortfolioPriceQuality {
  const suppliedObservations = prices?.length ?? 0;

  const validPrices = (prices ?? [])
    .map((observation) =>
      normalisePriceObservation(observation),
    )
    .filter(
      (
        observation,
      ): observation is NormalisedPriceObservation =>
        observation !== null,
    )
    .sort(
      (first, second) =>
        first.timestamp - second.timestamp,
    );

  const dateCounts = new Map<string, number>();

  for (const observation of validPrices) {
    dateCounts.set(
      observation.date,
      (dateCounts.get(observation.date) ?? 0) + 1,
    );
  }

  const duplicateDates = [...dateCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([date]) => date)
    .sort();

  const latestObservation =
    validPrices.length > 0
      ? validPrices[validPrices.length - 1]
      : undefined;

  const ageInDays = latestObservation
    ? calculateAgeInDays(
        latestObservation.timestamp,
        asOfTimestamp,
      )
    : undefined;

  return {
    suppliedObservations,
    validObservations: validPrices.length,
    invalidObservations:
      suppliedObservations - validPrices.length,
    duplicateDates,
    latestObservationDate: latestObservation?.date,
    ageInDays,
    stale:
      ageInDays !== undefined &&
      ageInDays > maximumPriceAgeDays,
    sufficientHistory:
      validPrices.length >= minimumPriceObservations,
  };
}

function isValidFiniteNumber(
  value: number | undefined,
): value is number {
  return value !== undefined && Number.isFinite(value);
}

function isValidNonNegativeNumber(
  value: number | undefined,
): value is number {
  return isValidFiniteNumber(value) && value >= 0;
}

function determineCompanyStatus(
  errors: string[],
  warnings: string[],
  priceQuality: PortfolioPriceQuality,
): PortfolioDataQualityStatus {
  if (errors.length > 0) {
    return "invalid";
  }

  if (priceQuality.stale) {
    return "stale";
  }

  if (warnings.length > 0) {
    return "incomplete";
  }

  return "ready";
}

function auditCompanyData(
  companyData: PortfolioCompanyRiskData,
  asOfTimestamp: number,
  minimumPriceObservations: number,
  maximumPriceAgeDays: number,
  maximumAbsoluteBeta: number,
): PortfolioCompanyDataQuality {
  const errors: string[] = [];
  const warnings: string[] = [];
  const strengths: string[] = [];

  const companyId = companyData.companyId.trim();

  const priceQuality = auditPriceHistory(
    companyData.prices,
    asOfTimestamp,
    minimumPriceObservations,
    maximumPriceAgeDays,
  );

  if (companyId === "") {
    errors.push("The company identifier is missing.");
  }

  if (priceQuality.suppliedObservations === 0) {
    warnings.push("No historical price observations were supplied.");
  } else {
    if (priceQuality.invalidObservations > 0) {
      errors.push(
        `${priceQuality.invalidObservations} historical price observation${
          priceQuality.invalidObservations === 1
            ? " is"
            : "s are"
        } invalid.`,
      );
    }

    if (priceQuality.duplicateDates.length > 0) {
      errors.push(
        `Duplicate price dates were found: ${priceQuality.duplicateDates.join(
          ", ",
        )}.`,
      );
    }

    if (!priceQuality.sufficientHistory) {
      warnings.push(
        `Only ${priceQuality.validObservations} valid price observations are available; at least ${minimumPriceObservations} are required.`,
      );
    }

    if (priceQuality.stale) {
      warnings.push(
        `The latest price observation is ${priceQuality.ageInDays} days old and exceeds the ${maximumPriceAgeDays}-day freshness limit.`,
      );
    }

    if (
      priceQuality.invalidObservations === 0 &&
      priceQuality.duplicateDates.length === 0 &&
      priceQuality.sufficientHistory &&
      !priceQuality.stale
    ) {
      strengths.push(
        "Historical price coverage passes the configured validity, depth and freshness checks.",
      );
    }
  }

  const hasValidBeta =
    isValidFiniteNumber(companyData.beta) &&
    Math.abs(companyData.beta) <= maximumAbsoluteBeta;

  if (companyData.beta === undefined) {
    warnings.push("Historical beta is not available.");
  } else if (!hasValidBeta) {
    errors.push(
      `Beta must be finite and between -${maximumAbsoluteBeta} and ${maximumAbsoluteBeta}.`,
    );
  } else {
    strengths.push("The supplied beta passes validation.");
  }

  const hasValidLiquidity =
    isValidFiniteNumber(
      companyData.averageDailyValueTraded,
    ) && companyData.averageDailyValueTraded > 0;

  if (
    companyData.averageDailyValueTraded === undefined
  ) {
    warnings.push(
      "Average daily value traded is not available.",
    );
  } else if (!hasValidLiquidity) {
    errors.push(
      "Average daily value traded must be a finite number greater than zero.",
    );
  } else {
    strengths.push(
      "The supplied liquidity measure passes validation.",
    );
  }

  const hasValidTransactionCost =
    isValidNonNegativeNumber(
      companyData.estimatedRoundTripCostPercentage,
    );

  if (
    companyData.estimatedRoundTripCostPercentage ===
    undefined
  ) {
    warnings.push(
      "Estimated round-trip transaction cost is not available.",
    );
  } else if (!hasValidTransactionCost) {
    errors.push(
      "Estimated round-trip transaction cost must be a finite non-negative number.",
    );
  }

  const hasValidBorrowFee =
    isValidNonNegativeNumber(
      companyData.annualBorrowFeePercentage,
    );

  if (
    companyData.annualBorrowFeePercentage !== undefined &&
    !hasValidBorrowFee
  ) {
    errors.push(
      "Annual Short-borrow fee must be a finite non-negative number.",
    );
  }

  const hasValidDividendYield =
    isValidNonNegativeNumber(
      companyData.annualDividendYieldPercentage,
    );

  if (
    companyData.annualDividendYieldPercentage !==
      undefined &&
    !hasValidDividendYield
  ) {
    errors.push(
      "Annual dividend yield must be a finite non-negative number.",
    );
  }

  const hasValidHoldingPeriod =
    isValidFiniteNumber(companyData.holdingDays) &&
    companyData.holdingDays > 0;

  if (
    companyData.holdingDays !== undefined &&
    !hasValidHoldingPeriod
  ) {
    errors.push(
      "Holding period must be a finite number greater than zero.",
    );
  }

  if (
    companyData.borrowAvailable === true &&
    companyData.annualBorrowFeePercentage === undefined
  ) {
    warnings.push(
      "Short borrow is marked as available but its annual fee is missing.",
    );
  }

  if (
    hasValidTransactionCost &&
    (companyData.annualBorrowFeePercentage ===
      undefined ||
      hasValidBorrowFee) &&
    (companyData.annualDividendYieldPercentage ===
      undefined ||
      hasValidDividendYield) &&
    (companyData.holdingDays === undefined ||
      hasValidHoldingPeriod)
  ) {
    strengths.push(
      "Supplied implementation-cost inputs pass validation.",
    );
  }

  const status = determineCompanyStatus(
    errors,
    warnings,
    priceQuality,
  );

  return {
    companyId,
    status,
    priceQuality,
    hasValidBeta,
    hasValidLiquidity,
    hasValidTransactionCost,
    hasValidBorrowFee,
    hasValidDividendYield,
    hasValidHoldingPeriod,
    errors,
    warnings,
    strengths,
  };
}

function findDuplicateCompanyIds(
  companyData: PortfolioCompanyRiskData[],
): string[] {
  const counts = new Map<string, number>();

  for (const company of companyData) {
    const companyId = company.companyId.trim();

    if (companyId === "") {
      continue;
    }

    counts.set(
      companyId,
      (counts.get(companyId) ?? 0) + 1,
    );
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([companyId]) => companyId)
    .sort();
}

function determineAuditStatus(
  companyResults: PortfolioCompanyDataQuality[],
  duplicateCompanyIds: string[],
): PortfolioDataQualityStatus {
  if (
    duplicateCompanyIds.length > 0 ||
    companyResults.some(
      (company) => company.status === "invalid",
    )
  ) {
    return "invalid";
  }

  if (
    companyResults.some(
      (company) => company.status === "stale",
    )
  ) {
    return "stale";
  }

  if (
    companyResults.length === 0 ||
    companyResults.some(
      (company) => company.status === "incomplete",
    )
  ) {
    return "incomplete";
  }

  return "ready";
}

export function auditPortfolioDataQuality(
  companyData: PortfolioCompanyRiskData[],
  options: PortfolioDataQualityOptions = {},
): PortfolioDataQualityAudit {
  const minimumPriceObservations =
    normalisePositiveInteger(
      options.minimumPriceObservations,
      60,
    );

  const maximumPriceAgeDays =
    normalisePositiveInteger(
      options.maximumPriceAgeDays,
      7,
    );

  const maximumAbsoluteBeta =
    normalisePositiveNumber(
      options.maximumAbsoluteBeta,
      5,
    );

  const asOfTimestamp =
    parseDate(options.asOfDate) ?? Date.now();

  const companyResults = companyData.map((company) =>
    auditCompanyData(
      company,
      asOfTimestamp,
      minimumPriceObservations,
      maximumPriceAgeDays,
      maximumAbsoluteBeta,
    ),
  );

  const duplicateCompanyIds =
    findDuplicateCompanyIds(companyData);

  const errors = companyResults.flatMap((company) =>
    company.errors.map(
      (error) =>
        `${company.companyId || "Unknown company"}: ${error}`,
    ),
  );

  if (duplicateCompanyIds.length > 0) {
    errors.push(
      `Duplicate company identifiers were supplied: ${duplicateCompanyIds.join(
        ", ",
      )}.`,
    );
  }

  const warnings = companyResults.flatMap((company) =>
    company.warnings.map(
      (warning) =>
        `${company.companyId || "Unknown company"}: ${warning}`,
    ),
  );

  if (companyData.length === 0) {
    warnings.push(
      "No portfolio company risk data was supplied for quality review.",
    );
  }

  const status = determineAuditStatus(
    companyResults,
    duplicateCompanyIds,
  );

  const readyCompanyCount = companyResults.filter(
    (company) => company.status === "ready",
  ).length;

  const staleCompanyCount = companyResults.filter(
    (company) => company.status === "stale",
  ).length;

  const incompleteCompanyCount =
    companyResults.filter(
      (company) => company.status === "incomplete",
    ).length;

  const invalidCompanyCount = companyResults.filter(
    (company) => company.status === "invalid",
  ).length;

  const strengths: string[] = [];

  if (
    companyResults.length > 0 &&
    errors.length === 0
  ) {
    strengths.push(
      "No structurally invalid portfolio risk inputs were detected.",
    );
  }

  if (
    companyResults.length > 0 &&
    readyCompanyCount === companyResults.length
  ) {
    strengths.push(
      "Every supplied company passes the configured data-quality checks.",
    );
  }

  return {
    status,
    companyCount: companyResults.length,
    readyCompanyCount,
    staleCompanyCount,
    incompleteCompanyCount,
    invalidCompanyCount,
    companyResults,
    duplicateCompanyIds,
    errors,
    warnings,
    strengths,
    methodology:
      "This gate checks portfolio inputs for missing, invalid, duplicated and stale values before risk analysis. Passing these checks confirms data structure and coverage only; it does not confirm that the source is authoritative or that an investment is suitable.",
  };
}