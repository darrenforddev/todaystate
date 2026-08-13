import type { DatedPrice } from "./portfolioBeta";
import type { PortfolioCompanyRiskData } from "./portfolioAnalysis";

export type PortfolioMarketDataAdapterStatus =
  | "invalid"
  | "incomplete"
  | "ready";

export type PortfolioLiquiditySource =
  | "supplied"
  | "calculated"
  | "unavailable";

export interface ProviderPriceObservation {
  date: unknown;
  price?: unknown;
  close?: unknown;
  adjustedClose?: unknown;
  value?: unknown;
  volume?: unknown;
}

export interface PortfolioCompanyMarketDataInput {
  companyId: string;
  source: string;
  fetchedAt?: string;
  currency?: string;
  prices?: ProviderPriceObservation[];
  beta?: unknown;
  averageDailyValueTraded?: unknown;
  borrowAvailable?: unknown;
  annualBorrowFeePercentage?: unknown;
  annualDividendYieldPercentage?: unknown;
  estimatedRoundTripCostPercentage?: unknown;
  holdingDays?: unknown;
}

export interface PortfolioMarketDataAdapterOptions {
  liquidityLookbackObservations?: number;
  expectedCurrency?: string;
}

export interface PortfolioCompanyMarketDataResult {
  companyId: string;
  source: string;
  fetchedAt?: string;
  currency?: string;
  status: PortfolioMarketDataAdapterStatus;
  riskData: PortfolioCompanyRiskData;
  suppliedPriceObservations: number;
  acceptedPriceObservations: number;
  rejectedPriceObservations: number;
  liquiditySource: PortfolioLiquiditySource;
  errors: string[];
  warnings: string[];
  strengths: string[];
}

export interface PortfolioMarketDataAdapterReport {
  status: PortfolioMarketDataAdapterStatus;
  suppliedCompanyCount: number;
  acceptedCompanyCount: number;
  rejectedCompanyCount: number;
  duplicateCompanyIds: string[];
  companyData: PortfolioCompanyRiskData[];
  companyResults: PortfolioCompanyMarketDataResult[];
  errors: string[];
  warnings: string[];
  strengths: string[];
  methodology: string;
}

interface NormalisedPriceObservation {
  date: string;
  timestamp: number;
  price: number;
  volume?: number;
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

  return Math.max(1, Math.floor(value));
}

function parseProviderNumber(
  value: unknown,
): number | undefined {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const cleanedValue = value
    .trim()
    .replaceAll(",", "");

  if (cleanedValue === "") {
    return undefined;
  }

  const parsedValue = Number(cleanedValue);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : undefined;
}

function parseProviderBoolean(
  value: unknown,
): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === 1 || value === "1") {
    return true;
  }

  if (value === 0 || value === "0") {
    return false;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const normalisedValue =
    value.trim().toLowerCase();

  if (normalisedValue === "true") {
    return true;
  }

  if (normalisedValue === "false") {
    return false;
  }

  return undefined;
}

function normaliseDate(
  value: unknown,
): {
  date: string;
  timestamp: number;
} | null {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    return null;
  }

  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    return null;
  }

  return {
    date: new Date(timestamp)
      .toISOString()
      .slice(0, 10),
    timestamp,
  };
}

function getObservationPrice(
  observation: ProviderPriceObservation,
): number | undefined {
  return parseProviderNumber(
    observation.adjustedClose ??
      observation.close ??
      observation.price ??
      observation.value,
  );
}

function normalisePriceObservation(
  observation: ProviderPriceObservation,
  index: number,
  errors: string[],
): NormalisedPriceObservation | null {
  const date = normaliseDate(
    observation.date,
  );

  const price = getObservationPrice(
    observation,
  );

  if (!date) {
    errors.push(
      `Price observation ${index + 1} has an invalid date.`,
    );
  }

  if (
    price === undefined ||
    price <= 0
  ) {
    errors.push(
      `Price observation ${index + 1} must contain a finite price greater than zero.`,
    );
  }

  if (
    !date ||
    price === undefined ||
    price <= 0
  ) {
    return null;
  }

  const suppliedVolume =
    observation.volume;

  const parsedVolume =
    parseProviderNumber(suppliedVolume);

  if (
    suppliedVolume !== undefined &&
    (parsedVolume === undefined ||
      parsedVolume < 0)
  ) {
    errors.push(
      `Price observation ${index + 1} contains an invalid volume.`,
    );
  }

  return {
    date: date.date,
    timestamp: date.timestamp,
    price,
    volume:
      parsedVolume !== undefined &&
      parsedVolume >= 0
        ? parsedVolume
        : undefined,
  };
}

function calculateAverageDailyValueTraded(
  prices: NormalisedPriceObservation[],
  lookbackObservations: number,
): number | undefined {
  const observationsWithVolume = prices
    .filter(
      (
        observation,
      ): observation is NormalisedPriceObservation & {
        volume: number;
      } =>
        observation.volume !== undefined &&
        observation.volume > 0,
    )
    .sort(
      (first, second) =>
        first.timestamp - second.timestamp,
    )
    .slice(-lookbackObservations);

  if (observationsWithVolume.length === 0) {
    return undefined;
  }

  const totalDailyValue =
    observationsWithVolume.reduce(
      (total, observation) =>
        total +
        observation.price *
          observation.volume,
      0,
    );

  return (
    totalDailyValue /
    observationsWithVolume.length
  );
}

function addOptionalNumber(
  riskData: PortfolioCompanyRiskData,
  field:
    | "beta"
    | "annualBorrowFeePercentage"
    | "annualDividendYieldPercentage"
    | "estimatedRoundTripCostPercentage"
    | "holdingDays",
  value: unknown,
  label: string,
  errors: string[],
): void {
  if (value === undefined) {
    return;
  }

  const parsedValue =
    parseProviderNumber(value);

  if (parsedValue === undefined) {
    errors.push(
      `${label} must be a finite number.`,
    );

    return;
  }

  riskData[field] = parsedValue;
}

function determineCompanyStatus(
  errors: string[],
  warnings: string[],
): PortfolioMarketDataAdapterStatus {
  if (errors.length > 0) {
    return "invalid";
  }

  if (warnings.length > 0) {
    return "incomplete";
  }

  return "ready";
}

function adaptCompanyMarketData(
  input: PortfolioCompanyMarketDataInput,
  liquidityLookbackObservations: number,
  expectedCurrency: string | undefined,
): PortfolioCompanyMarketDataResult {
  const companyId = input.companyId.trim();
  const source = input.source.trim();
  const currency =
    input.currency?.trim().toUpperCase();

  const errors: string[] = [];
  const warnings: string[] = [];
  const strengths: string[] = [];

  if (companyId === "") {
    errors.push(
      "The company identifier is missing.",
    );
  }

  if (source === "") {
    errors.push(
      "The market-data source is missing.",
    );
  }

  if (input.fetchedAt !== undefined) {
    if (!normaliseDate(input.fetchedAt)) {
      errors.push(
        "The market-data fetch timestamp is invalid.",
      );
    }
  } else {
    warnings.push(
      "The market-data fetch timestamp is missing.",
    );
  }

  if (!currency) {
    warnings.push(
      "Currency is missing, so liquidity values cannot be currency-normalised.",
    );
  }

  if (
    expectedCurrency &&
    currency &&
    currency !== expectedCurrency
  ) {
    errors.push(
      `Currency ${currency} does not match the expected portfolio currency ${expectedCurrency}.`,
    );
  }

  const suppliedPrices =
    input.prices ?? [];

  const normalisedPrices = suppliedPrices
    .map((observation, index) =>
      normalisePriceObservation(
        observation,
        index,
        errors,
      ),
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

  const datedPrices: DatedPrice[] =
    normalisedPrices.map(
      (observation) => ({
        date: observation.date,
        price: observation.price,
      }),
    );

  if (suppliedPrices.length === 0) {
    warnings.push(
      "No historical price observations were supplied.",
    );
  }

  if (normalisedPrices.length > 0) {
    strengths.push(
      `${normalisedPrices.length} provider price observation${
        normalisedPrices.length === 1
          ? " was"
          : "s were"
      } normalised successfully.`,
    );
  }

  const riskData: PortfolioCompanyRiskData = {
    companyId,
    prices:
      datedPrices.length > 0
        ? datedPrices
        : undefined,
  };

  addOptionalNumber(
    riskData,
    "beta",
    input.beta,
    "Beta",
    errors,
  );

  addOptionalNumber(
    riskData,
    "annualBorrowFeePercentage",
    input.annualBorrowFeePercentage,
    "Annual Short-borrow fee",
    errors,
  );

  addOptionalNumber(
    riskData,
    "annualDividendYieldPercentage",
    input.annualDividendYieldPercentage,
    "Annual dividend yield",
    errors,
  );

  addOptionalNumber(
    riskData,
    "estimatedRoundTripCostPercentage",
    input.estimatedRoundTripCostPercentage,
    "Estimated round-trip transaction cost",
    errors,
  );

  addOptionalNumber(
    riskData,
    "holdingDays",
    input.holdingDays,
    "Holding period",
    errors,
  );

  if (input.borrowAvailable !== undefined) {
    const borrowAvailable =
      parseProviderBoolean(
        input.borrowAvailable,
      );

    if (borrowAvailable === undefined) {
      errors.push(
        "Short-borrow availability must be a boolean value.",
      );
    } else {
      riskData.borrowAvailable =
        borrowAvailable;
    }
  }

  const suppliedLiquidity =
    parseProviderNumber(
      input.averageDailyValueTraded,
    );

  const calculatedLiquidity =
    calculateAverageDailyValueTraded(
      normalisedPrices,
      liquidityLookbackObservations,
    );

  let liquiditySource:
    PortfolioLiquiditySource =
    "unavailable";

  if (
    input.averageDailyValueTraded !==
    undefined
  ) {
    if (
      suppliedLiquidity === undefined ||
      suppliedLiquidity <= 0
    ) {
      errors.push(
        "Average daily value traded must be a finite number greater than zero.",
      );
    } else {
      riskData.averageDailyValueTraded =
        suppliedLiquidity;

      liquiditySource = "supplied";

      strengths.push(
        "Provider-supplied liquidity was accepted.",
      );
    }
  } else if (
    calculatedLiquidity !== undefined
  ) {
    riskData.averageDailyValueTraded =
      calculatedLiquidity;

    liquiditySource = "calculated";

    strengths.push(
      `Average daily value traded was calculated from the latest ${Math.min(
        liquidityLookbackObservations,
        normalisedPrices.filter(
          (observation) =>
            observation.volume !==
              undefined &&
            observation.volume > 0,
        ).length,
      )} price-and-volume observations.`,
    );
  } else {
    warnings.push(
      "Liquidity is unavailable because neither average daily value traded nor usable volume history was supplied.",
    );
  }

  if (
    riskData.beta === undefined &&
    datedPrices.length < 2
  ) {
    warnings.push(
      "Beta is unavailable and there is insufficient price history to calculate it.",
    );
  }

  if (
    errors.length === 0 &&
    source !== "" &&
    datedPrices.length > 0
  ) {
    strengths.push(
      "The provider record passed structural market-data normalisation.",
    );
  }

  return {
    companyId,
    source,
    fetchedAt: input.fetchedAt,
    currency,
    status: determineCompanyStatus(
      errors,
      warnings,
    ),
    riskData,
    suppliedPriceObservations:
      suppliedPrices.length,
    acceptedPriceObservations:
      normalisedPrices.length,
    rejectedPriceObservations:
      suppliedPrices.length -
      normalisedPrices.length,
    liquiditySource,
    errors,
    warnings,
    strengths,
  };
}

function findDuplicateCompanyIds(
  results: PortfolioCompanyMarketDataResult[],
): string[] {
  const counts = new Map<string, number>();

  for (const result of results) {
    if (result.companyId === "") {
      continue;
    }

    counts.set(
      result.companyId,
      (counts.get(result.companyId) ?? 0) +
        1,
    );
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([companyId]) => companyId)
    .sort();
}

export function adaptPortfolioMarketData(
  inputs: PortfolioCompanyMarketDataInput[],
  options: PortfolioMarketDataAdapterOptions = {},
): PortfolioMarketDataAdapterReport {
  const liquidityLookbackObservations =
    normalisePositiveInteger(
      options.liquidityLookbackObservations,
      20,
    );

  const expectedCurrency =
    options.expectedCurrency
      ?.trim()
      .toUpperCase() || undefined;

  const companyResults = inputs.map(
    (input) =>
      adaptCompanyMarketData(
        input,
        liquidityLookbackObservations,
        expectedCurrency,
      ),
  );

  const duplicateCompanyIds =
    findDuplicateCompanyIds(
      companyResults,
    );

  const duplicateCompanyIdSet =
    new Set(duplicateCompanyIds);

  const errors = companyResults.flatMap(
    (result) =>
      result.errors.map(
        (error) =>
          `${result.companyId || "Unknown company"}: ${error}`,
      ),
  );

  if (duplicateCompanyIds.length > 0) {
    errors.push(
      `Duplicate company identifiers were supplied: ${duplicateCompanyIds.join(
        ", ",
      )}.`,
    );
  }

  const warnings =
    companyResults.flatMap((result) =>
      result.warnings.map(
        (warning) =>
          `${result.companyId || "Unknown company"}: ${warning}`,
      ),
    );

  if (inputs.length === 0) {
    warnings.push(
      "No provider market data was supplied for adaptation.",
    );
  }

  const companyData = companyResults
    .filter(
      (result) =>
        result.status !== "invalid" &&
        !duplicateCompanyIdSet.has(
          result.companyId,
        ),
    )
    .map((result) => result.riskData);

  const rejectedCompanyCount =
    companyResults.length -
    companyData.length;

  const status:
    PortfolioMarketDataAdapterStatus =
    errors.length > 0
      ? "invalid"
      : warnings.length > 0
        ? "incomplete"
        : "ready";

  const strengths: string[] = [];

  if (
    companyResults.length > 0 &&
    rejectedCompanyCount === 0
  ) {
    strengths.push(
      "Every supplied provider record was accepted for downstream data-quality review.",
    );
  }

  if (
    companyResults.length > 0 &&
    status === "ready"
  ) {
    strengths.push(
      "Every supplied provider record contains complete adapter metadata and passed normalisation.",
    );
  }

  return {
    status,
    suppliedCompanyCount:
      companyResults.length,
    acceptedCompanyCount:
      companyData.length,
    rejectedCompanyCount,
    duplicateCompanyIds,
    companyData,
    companyResults,
    errors,
    warnings,
    strengths,
    methodology:
      "This provider-neutral adapter converts numeric strings, common price-field names, dates, volumes, liquidity, beta and implementation inputs into TodayScore portfolio risk data. Invalid and duplicated provider records are excluded from its accepted output. A successful adaptation still requires the downstream portfolio data-quality gate before analysis.",
  };
}