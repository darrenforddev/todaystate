import { momentumFactorDefinitions } from "./momentumFactors";
import { qualityFactorDefinitions } from "./qualityFactors";
import type {
  RawFactorEvidence,
  RawFactorPillarReport,
  RawFactorResult,
  RawFactorUnit,
  RawTodayScoreReport,
} from "./rawFactors";
import type {
  ProviderCompanyIdentity,
  ProviderDatasetResult,
  TodayScoreDataset,
} from "./providers/types";
import type { TodayScorePillar } from "./types";
import { valueFactorDefinitions } from "./valueFactors";

type JsonRecord = Record<string, unknown>;

interface FactorSeed {
  rawValue: number;
  unit: RawFactorUnit;
  explanation: string;
  evidence: RawFactorEvidence[];
}

interface PricePoint {
  date: string;
  timestamp: number;
  close: number;
}

const datasetCollectionKey: Partial<Record<TodayScoreDataset, string>> = {
  "price-history": "values",
  "income-statement": "income_statement",
  "balance-sheet": "balance_sheet",
  "cash-flow": "cash_flow",
  "eps-trend": "eps_trend",
  "eps-revisions": "eps_revision",
};

function asRecord(value: unknown): JsonRecord | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function readPath(value: unknown, path: string): unknown {
  let current = value;

  for (const part of path.split(".")) {
    const record = asRecord(current);

    if (!record) {
      return undefined;
    }

    current = record[part];
  }

  return current;
}

function readNumber(value: unknown, path: string): number | undefined {
  const candidate = readPath(value, path);
  const parsed =
    typeof candidate === "number"
      ? candidate
      : typeof candidate === "string" && candidate.trim() !== ""
        ? Number(candidate)
        : Number.NaN;

  return Number.isFinite(parsed) ? parsed : undefined;
}

function readString(value: unknown, path: string): string | undefined {
  const candidate = readPath(value, path);

  return typeof candidate === "string" && candidate.trim() !== ""
    ? candidate
    : undefined;
}

function round(value: number, decimals = 4): number {
  const scale = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * scale) / scale;
}

function safeDivide(
  numerator: number | undefined,
  denominator: number | undefined,
): number | undefined {
  return numerator === undefined ||
    denominator === undefined ||
    denominator === 0
    ? undefined
    : numerator / denominator;
}

function percentageChange(
  current: number | undefined,
  previous: number | undefined,
): number | undefined {
  const change = safeDivide(
    current === undefined || previous === undefined
      ? undefined
      : current - previous,
    previous === undefined ? undefined : Math.abs(previous),
  );

  return change === undefined ? undefined : change * 100;
}

function resultFor(
  results: readonly ProviderDatasetResult[],
  dataset: TodayScoreDataset,
): ProviderDatasetResult | undefined {
  return results.find((result) => result.dataset === dataset);
}

function recordsFor(result: ProviderDatasetResult | undefined): JsonRecord[] {
  if (!result?.payload) {
    return [];
  }

  const collectionKey = datasetCollectionKey[result.dataset];
  const collection = collectionKey
    ? readPath(result.payload, collectionKey)
    : undefined;

  return Array.isArray(collection)
    ? collection.flatMap((item) => {
        const record = asRecord(item);
        return record ? [record] : [];
      })
    : [];
}

function latestAnnualRecords(
  result: ProviderDatasetResult | undefined,
): JsonRecord[] {
  return recordsFor(result).sort((left, right) =>
    (readString(right, "fiscal_date") ?? "").localeCompare(
      readString(left, "fiscal_date") ?? "",
    ),
  );
}

function currencyFor(result: ProviderDatasetResult | undefined): string | undefined {
  return result?.payload
    ? readString(result.payload, "meta.currency")
    : undefined;
}

function evidenceFor(
  result: ProviderDatasetResult | undefined,
  observedAt?: string,
): RawFactorEvidence[] {
  if (!result) {
    return [];
  }

  return [
    {
      providerId: result.providerId,
      providerName: result.providerName,
      symbol: result.symbol,
      dataset: result.dataset,
      endpoint: result.endpoint,
      fetchedAt: result.checkedAt,
      observedAt,
      currency: currencyFor(result),
    },
  ];
}

function combinedEvidence(
  ...groups: RawFactorEvidence[][]
): RawFactorEvidence[] {
  const evidence = groups.flat();
  const seen = new Set<string>();

  return evidence.filter((item) => {
    const key = `${item.dataset}:${item.observedAt ?? ""}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function addSeed(
  seeds: Map<string, FactorSeed>,
  factorId: string,
  rawValue: number | undefined,
  unit: RawFactorUnit,
  explanation: string,
  evidence: RawFactorEvidence[],
): void {
  if (rawValue === undefined || !Number.isFinite(rawValue)) {
    return;
  }

  seeds.set(factorId, {
    rawValue: round(rawValue),
    unit,
    explanation,
    evidence,
  });
}

function average(values: readonly number[]): number | undefined {
  return values.length === 0
    ? undefined
    : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values: readonly number[]): number | undefined {
  const mean = average(values);

  if (mean === undefined) {
    return undefined;
  }

  return Math.sqrt(
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
      values.length,
  );
}

function growthSeries(
  records: readonly JsonRecord[],
  path: string,
): number[] {
  const chronological = [...records].reverse();
  const growth: number[] = [];

  for (let index = 1; index < chronological.length; index += 1) {
    const change = percentageChange(
      readNumber(chronological[index], path),
      readNumber(chronological[index - 1], path),
    );

    if (change !== undefined) {
      growth.push(change);
    }
  }

  return growth;
}

function balanceDebt(record: JsonRecord | undefined): number | undefined {
  if (!record) {
    return undefined;
  }

  const shortTermDebt =
    readNumber(record, "liabilities.current_liabilities.short_term_debt");
  const longTermDebt =
    readNumber(record, "liabilities.non_current_liabilities.long_term_debt");

  if (shortTermDebt === undefined && longTermDebt === undefined) {
    return undefined;
  }

  return (shortTermDebt ?? 0) + (longTermDebt ?? 0);
}

function buildQualitySeeds(
  results: readonly ProviderDatasetResult[],
): Map<string, FactorSeed> {
  const seeds = new Map<string, FactorSeed>();
  const statisticsResult = resultFor(results, "statistics");
  const incomeResult = resultFor(results, "income-statement");
  const balanceResult = resultFor(results, "balance-sheet");
  const statistics = statisticsResult?.payload
    ? readPath(statisticsResult.payload, "statistics")
    : undefined;
  const financials = readPath(statistics, "financials");
  const statisticsDate = readString(financials, "most_recent_quarter");
  const statisticsEvidence = evidenceFor(statisticsResult, statisticsDate);
  const income = latestAnnualRecords(incomeResult);
  const balances = latestAnnualRecords(balanceResult);
  const latestIncome = income[0];
  const latestBalance = balances[0];
  const fiscalDate = readString(latestIncome, "fiscal_date");
  const balanceDate = readString(latestBalance, "fiscal_date");
  const incomeEvidence = evidenceFor(incomeResult, fiscalDate);
  const balanceEvidence = evidenceFor(balanceResult, balanceDate);

  addSeed(
    seeds,
    "return-on-equity",
    readNumber(financials, "return_on_equity_ttm") === undefined
      ? undefined
      : readNumber(financials, "return_on_equity_ttm")! * 100,
    "percent",
    "Trailing net income as a percentage of shareholders' equity.",
    statisticsEvidence,
  );
  addSeed(
    seeds,
    "operating-margin",
    readNumber(financials, "operating_margin") === undefined
      ? undefined
      : readNumber(financials, "operating_margin")! * 100,
    "percent",
    "Trailing operating profit as a percentage of revenue.",
    statisticsEvidence,
  );
  addSeed(
    seeds,
    "net-profit-margin",
    readNumber(financials, "profit_margin") === undefined
      ? undefined
      : readNumber(financials, "profit_margin")! * 100,
    "percent",
    "Trailing net income as a percentage of revenue.",
    statisticsEvidence,
  );

  const ebit = readNumber(latestIncome, "ebit");
  const pretaxIncome = readNumber(latestIncome, "pretax_income");
  const incomeTax = readNumber(latestIncome, "income_tax");
  const taxRate = safeDivide(incomeTax, pretaxIncome);
  const debt = balanceDebt(latestBalance);
  const equity = readNumber(
    latestBalance,
    "shareholders_equity.total_shareholders_equity",
  );
  const cash = readNumber(
    latestBalance,
    "assets.current_assets.cash_and_cash_equivalents",
  );
  const investedCapital =
    debt === undefined || equity === undefined || cash === undefined
      ? undefined
      : debt + equity - cash;
  const nopat =
    ebit === undefined || taxRate === undefined
      ? undefined
      : ebit * (1 - Math.min(1, Math.max(0, taxRate)));
  const roic = safeDivide(nopat, investedCapital);

  addSeed(
    seeds,
    "return-on-invested-capital",
    roic === undefined ? undefined : roic * 100,
    "percent",
    "Annual EBIT after the reported tax rate divided by debt plus equity less cash.",
    combinedEvidence(incomeEvidence, balanceEvidence),
  );

  const totalDebt = readNumber(financials, "balance_sheet.total_debt_mrq");
  const totalCash = readNumber(financials, "balance_sheet.total_cash_mrq");
  const ebitda = readNumber(financials, "income_statement.ebitda");
  addSeed(
    seeds,
    "net-debt-to-ebitda",
    safeDivide(
      totalDebt === undefined || totalCash === undefined
        ? undefined
        : totalDebt - totalCash,
      ebitda,
    ),
    "multiple",
    "Most-recent-quarter debt less cash, divided by trailing EBITDA.",
    statisticsEvidence,
  );

  const interestExpense = readNumber(
    latestIncome,
    "non_operating_interest.expense",
  );
  addSeed(
    seeds,
    "interest-coverage",
    safeDivide(
      readNumber(latestIncome, "operating_income"),
      interestExpense === undefined ? undefined : Math.abs(interestExpense),
    ),
    "multiple",
    "Annual operating income divided by the absolute reported interest expense.",
    incomeEvidence,
  );
  addSeed(
    seeds,
    "current-ratio",
    readNumber(financials, "balance_sheet.current_ratio_mrq"),
    "ratio",
    "Most-recent-quarter current assets divided by current liabilities.",
    statisticsEvidence,
  );

  const totalAssets = readNumber(latestBalance, "assets.total_assets");
  const currentAssets = readNumber(
    latestBalance,
    "assets.current_assets.total_current_assets",
  );
  const currentLiabilities = readNumber(
    latestBalance,
    "liabilities.current_liabilities.total_current_liabilities",
  );
  const retainedEarnings = readNumber(
    latestBalance,
    "shareholders_equity.retained_earnings",
  );
  const totalLiabilities = readNumber(
    latestBalance,
    "liabilities.total_liabilities",
  );
  const sales = readNumber(latestIncome, "sales");
  const marketCap = readNumber(statistics, "valuations_metrics.market_capitalization");
  const altmanInputs = [
    totalAssets,
    currentAssets,
    currentLiabilities,
    retainedEarnings,
    totalLiabilities,
    ebit,
    sales,
    marketCap,
  ];
  const altman =
    altmanInputs.every((value) => value !== undefined) &&
    totalAssets &&
    totalLiabilities
    ? 1.2 * ((currentAssets! - currentLiabilities!) / totalAssets) +
      1.4 * (retainedEarnings! / totalAssets) +
      3.3 * (ebit! / totalAssets) +
      0.6 * (marketCap! / totalLiabilities!) +
      sales! / totalAssets
    : undefined;
  addSeed(
    seeds,
    "altman-z-score",
    altman,
    "ratio",
    "The public-company Altman Z formula using the latest annual statements and current market capitalisation.",
    combinedEvidence(incomeEvidence, balanceEvidence, statisticsEvidence),
  );

  const revenueTtm = readNumber(financials, "income_statement.revenue_ttm");
  const freeCashFlowTtm = readNumber(
    financials,
    "cash_flow.levered_free_cash_flow_ttm",
  );
  const operatingCashFlowTtm = readNumber(
    financials,
    "cash_flow.operating_cash_flow_ttm",
  );
  const netIncomeTtm = readNumber(
    financials,
    "income_statement.net_income_to_common_ttm",
  );
  const fcfMargin = safeDivide(freeCashFlowTtm, revenueTtm);
  addSeed(
    seeds,
    "free-cash-flow-margin",
    fcfMargin === undefined ? undefined : fcfMargin * 100,
    "percent",
    "Trailing levered free cash flow as a percentage of trailing revenue.",
    statisticsEvidence,
  );
  addSeed(
    seeds,
    "cash-conversion",
    safeDivide(operatingCashFlowTtm, netIncomeTtm),
    "ratio",
    "Trailing operating cash flow divided by trailing net income.",
    statisticsEvidence,
  );

  const previousAssets = readNumber(balances[1], "assets.total_assets");
  const averageAssets =
    totalAssets === undefined || previousAssets === undefined
      ? undefined
      : (totalAssets + previousAssets) / 2;
  const accrualRatio = safeDivide(
    netIncomeTtm === undefined || operatingCashFlowTtm === undefined
      ? undefined
      : netIncomeTtm - operatingCashFlowTtm,
    averageAssets,
  );
  addSeed(
    seeds,
    "accrual-ratio",
    accrualRatio === undefined ? undefined : accrualRatio * 100,
    "percent",
    "Trailing net income less operating cash flow, divided by average annual total assets.",
    combinedEvidence(statisticsEvidence, balanceEvidence),
  );

  const earningsGrowth = growthSeries(income, "net_income");
  const revenueGrowth = growthSeries(income, "sales");
  addSeed(
    seeds,
    "earnings-volatility",
    standardDeviation(earningsGrowth),
    "percent",
    `Standard deviation of ${earningsGrowth.length} available annual net-income growth observations.`,
    evidenceFor(incomeResult, fiscalDate),
  );
  addSeed(
    seeds,
    "revenue-growth-consistency",
    revenueGrowth.length === 0
      ? undefined
      : (revenueGrowth.filter((value) => value > 0).length /
          revenueGrowth.length) *
        100,
    "percent",
    `Share of ${revenueGrowth.length} available annual periods with positive revenue growth.`,
    incomeEvidence,
  );
  addSeed(
    seeds,
    "earnings-growth-consistency",
    earningsGrowth.length === 0
      ? undefined
      : (earningsGrowth.filter((value) => value > 0).length /
          earningsGrowth.length) *
        100,
    "percent",
    `Share of ${earningsGrowth.length} available annual periods with positive net-income growth.`,
    incomeEvidence,
  );
  addSeed(
    seeds,
    "share-dilution",
    percentageChange(
      readNumber(income[0], "basic_shares_outstanding"),
      readNumber(income.at(-1), "basic_shares_outstanding"),
    ),
    "percent",
    `Change in basic shares outstanding from ${readString(income.at(-1), "fiscal_date") ?? "the oldest available year"} to ${fiscalDate ?? "the latest available year"}.`,
    incomeEvidence,
  );

  return seeds;
}

function buildValueSeeds(
  results: readonly ProviderDatasetResult[],
): Map<string, FactorSeed> {
  const seeds = new Map<string, FactorSeed>();
  const statisticsResult = resultFor(results, "statistics");
  const cashFlowResult = resultFor(results, "cash-flow");
  const balanceResult = resultFor(results, "balance-sheet");
  const statistics = statisticsResult?.payload
    ? readPath(statisticsResult.payload, "statistics")
    : undefined;
  const financials = readPath(statistics, "financials");
  const statisticsDate = readString(financials, "most_recent_quarter");
  const statisticsEvidence = evidenceFor(statisticsResult, statisticsDate);
  const metricPaths = [
    ["price-to-earnings", "trailing_pe"],
    ["forward-price-to-earnings", "forward_pe"],
    ["price-to-sales", "price_to_sales_ttm"],
    ["price-to-book", "price_to_book_mrq"],
    ["enterprise-value-to-ebitda", "enterprise_to_ebitda"],
  ] as const;

  for (const [factorId, field] of metricPaths) {
    addSeed(
      seeds,
      factorId,
      readNumber(statistics, `valuations_metrics.${field}`),
      "multiple",
      `Current ${field.replaceAll("_", " ")} reported by Twelve Data.`,
      statisticsEvidence,
    );
  }

  const marketCap = readNumber(statistics, "valuations_metrics.market_capitalization");
  const enterpriseValue = readNumber(
    statistics,
    "valuations_metrics.enterprise_value",
  );
  const freeCashFlow = readNumber(
    financials,
    "cash_flow.levered_free_cash_flow_ttm",
  );
  addSeed(
    seeds,
    "price-to-free-cash-flow",
    safeDivide(marketCap, freeCashFlow),
    "multiple",
    "Current market capitalisation divided by trailing levered free cash flow.",
    statisticsEvidence,
  );
  addSeed(
    seeds,
    "enterprise-value-to-free-cash-flow",
    safeDivide(enterpriseValue, freeCashFlow),
    "multiple",
    "Current enterprise value divided by trailing levered free cash flow.",
    statisticsEvidence,
  );
  const fcfYield = safeDivide(freeCashFlow, marketCap);
  addSeed(
    seeds,
    "free-cash-flow-yield",
    fcfYield === undefined ? undefined : fcfYield * 100,
    "percent",
    "Trailing levered free cash flow as a percentage of current market capitalisation.",
    statisticsEvidence,
  );

  const cashFlows = latestAnnualRecords(cashFlowResult);
  const balances = latestAnnualRecords(balanceResult);
  const latestCashFlow = cashFlows[0];
  const dividends = readNumber(
    latestCashFlow,
    "financing_activities.common_dividends",
  );
  const repurchases = readNumber(
    latestCashFlow,
    "financing_activities.common_stock_repurchase",
  );
  const currentDebt = balanceDebt(balances[0]);
  const previousDebt = balanceDebt(balances[1]);
  const debtReduction =
    currentDebt === undefined || previousDebt === undefined
      ? undefined
      : previousDebt - currentDebt;
  const shareholderReturn =
    dividends === undefined ||
    repurchases === undefined ||
    debtReduction === undefined
      ? undefined
      : -dividends - repurchases + debtReduction;
  const shareholderYield = safeDivide(shareholderReturn, marketCap);
  addSeed(
    seeds,
    "shareholder-yield",
    shareholderYield === undefined ? undefined : shareholderYield * 100,
    "percent",
    "Latest annual dividends and net repurchases plus year-on-year debt reduction, divided by current market capitalisation.",
    combinedEvidence(
      statisticsEvidence,
      evidenceFor(cashFlowResult, readString(latestCashFlow, "fiscal_date")),
      evidenceFor(balanceResult, readString(balances[0], "fiscal_date")),
    ),
  );

  return seeds;
}

function pricePoints(result: ProviderDatasetResult | undefined): PricePoint[] {
  return recordsFor(result)
    .flatMap((record) => {
      const date = readString(record, "datetime");
      const close = readNumber(record, "close");
      const timestamp = date ? Date.parse(`${date}T00:00:00Z`) : Number.NaN;

      return date && close !== undefined && Number.isFinite(timestamp)
        ? [{ date, timestamp, close }]
        : [];
    })
    .sort((left, right) => left.timestamp - right.timestamp);
}

function pointAtOrBefore(
  points: readonly PricePoint[],
  target: number,
): PricePoint | undefined {
  for (let index = points.length - 1; index >= 0; index -= 1) {
    if (points[index].timestamp <= target) {
      return points[index];
    }
  }

  return undefined;
}

function buildMomentumSeeds(
  results: readonly ProviderDatasetResult[],
): Map<string, FactorSeed> {
  const seeds = new Map<string, FactorSeed>();
  const priceResult = resultFor(results, "price-history");
  const trendResult = resultFor(results, "eps-trend");
  const revisionsResult = resultFor(results, "eps-revisions");
  const points = pricePoints(priceResult);
  const latest = points.at(-1);
  const priceEvidence = evidenceFor(priceResult, latest?.date);

  if (latest) {
    const returnWindows = [
      ["one-month-price-return", 30],
      ["three-month-price-return", 90],
      ["six-month-price-return", 182],
      ["twelve-month-price-return", 365],
    ] as const;

    for (const [factorId, calendarDays] of returnWindows) {
      const previous = pointAtOrBefore(
        points,
        latest.timestamp - calendarDays * 86_400_000,
      );
      addSeed(
        seeds,
        factorId,
        percentageChange(latest.close, previous?.close),
        "percent",
        previous
          ? `Price return from ${previous.date} to ${latest.date}, using split- and dividend-adjusted daily closes.`
          : `At least ${calendarDays} calendar days of price history are required.`,
        priceEvidence,
      );
    }

    const recentCloses = [...points].reverse().map((point) => point.close);
    const movingAverage = (period: number) =>
      recentCloses.length >= period
        ? average(recentCloses.slice(0, period))
        : undefined;
    const day50 = movingAverage(50);
    const day200 = movingAverage(200);
    const latestVs50 = percentageChange(latest.close, day50);
    const latestVs200 = percentageChange(latest.close, day200);
    const day50Vs200 = percentageChange(day50, day200);
    addSeed(
      seeds,
      "price-versus-50-day-moving-average",
      latestVs50,
      "percent",
      `Latest close on ${latest.date} relative to the mean of the latest 50 daily closes.`,
      priceEvidence,
    );
    addSeed(
      seeds,
      "price-versus-200-day-moving-average",
      latestVs200,
      "percent",
      `Latest close on ${latest.date} relative to the mean of the latest 200 daily closes.`,
      priceEvidence,
    );
    addSeed(
      seeds,
      "fifty-day-versus-200-day-moving-average",
      day50Vs200,
      "percent",
      "The 50-day moving average relative to the 200-day moving average.",
      priceEvidence,
    );

    const yearPoints = points.filter(
      (point) => point.timestamp >= latest.timestamp - 365 * 86_400_000,
    );
    const yearHigh =
      yearPoints.length === 0
        ? undefined
        : Math.max(...yearPoints.map((point) => point.close));
    addSeed(
      seeds,
      "distance-from-52-week-high",
      percentageChange(latest.close, yearHigh),
      "percent",
      `Latest close on ${latest.date} relative to the highest available close in the preceding 365 days.`,
      priceEvidence,
    );
  }

  const trends = recordsFor(trendResult);
  const revisions = recordsFor(revisionsResult);
  const currentYear = trends.find(
    (record) => readString(record, "period") === "current_year",
  );
  const nextYear = trends.find(
    (record) => readString(record, "period") === "next_year",
  );
  const currentYearRevision = revisions.find(
    (record) => readString(record, "period") === "current_year",
  );
  const estimateChange = percentageChange(
    readNumber(currentYear, "current_estimate"),
    readNumber(currentYear, "90_days_ago"),
  );
  const upLastMonth = readNumber(currentYearRevision, "up_last_month");
  const downLastMonth = readNumber(currentYearRevision, "down_last_month");
  const revisionBreadth =
    upLastMonth === undefined || downLastMonth === undefined
      ? ""
      : ` Last month recorded ${upLastMonth} upward and ${downLastMonth} downward analyst revisions.`;
  addSeed(
    seeds,
    "earnings-estimate-revisions-three-month",
    estimateChange,
    "percent",
    `Current-year consensus EPS estimate change versus 90 days ago.${revisionBreadth}`,
    combinedEvidence(
      evidenceFor(trendResult, readString(currentYear, "date")),
      evidenceFor(revisionsResult, readString(currentYearRevision, "date")),
    ),
  );
  const forwardGrowth = percentageChange(
    readNumber(nextYear, "current_estimate"),
    readNumber(currentYear, "current_estimate"),
  );
  addSeed(
    seeds,
    "forward-eps-growth",
    forwardGrowth,
    "percent",
    "Next-year consensus EPS estimate relative to the current-year consensus estimate.",
    evidenceFor(trendResult, readString(nextYear, "date")),
  );

  return seeds;
}

const unavailableReasons: Record<string, string> = {
  "relative-strength":
    "Relative strength requires a validated comparison-universe return series.",
  "earnings-estimate-revisions-six-month":
    "The validated Twelve Data EPS trend response extends to 90 days, not six months.",
  "earnings-surprise":
    "No validated reported-versus-estimated earnings dataset is connected yet.",
  "revenue-surprise":
    "No validated reported-versus-estimated revenue dataset is connected yet.",
  "pe-versus-five-year-average":
    "Five years of point-in-time P/E history is not available in the validated snapshot.",
  "ev-ebitda-versus-five-year-average":
    "Five years of point-in-time EV/EBITDA history is not available in the validated snapshot.",
  "price-to-sales-versus-five-year-average":
    "Five years of point-in-time price-to-sales history is not available in the validated snapshot.",
  "free-cash-flow-yield-versus-five-year-average":
    "Five years of point-in-time free-cash-flow yield history is not available in the validated snapshot.",
};

function buildPillar(
  pillar: TodayScorePillar,
  definitions: readonly {
    id: string;
    name: string;
    category: string;
    direction: "higherIsBetter" | "lowerIsBetter";
  }[],
  seeds: Map<string, FactorSeed>,
): RawFactorPillarReport {
  const factors: RawFactorResult[] = definitions.map((definition) => {
    const seed = seeds.get(definition.id);

    return seed
      ? {
          factorId: definition.id,
          name: definition.name,
          pillar,
          category: definition.category,
          direction: definition.direction,
          status: "available",
          scoreStatus: "percentile-locked",
          ...seed,
        }
      : {
          factorId: definition.id,
          name: definition.name,
          pillar,
          category: definition.category,
          direction: definition.direction,
          status: "unavailable",
          scoreStatus: "percentile-locked",
          explanation:
            unavailableReasons[definition.id] ??
            "The required validated provider fields were absent, so no raw value was inferred.",
          evidence: [],
        };
  });

  return {
    pillar,
    scoreStatus: "percentile-locked",
    availableFactorCount: factors.filter(
      (factor) => factor.status === "available",
    ).length,
    totalFactorCount: factors.length,
    factors,
  };
}

export function buildRawTodayScoreReport(
  company: ProviderCompanyIdentity,
  results: readonly ProviderDatasetResult[],
  generatedAt = new Date().toISOString(),
): RawTodayScoreReport {
  const provider = results[0];

  return {
    company,
    providerId: provider?.providerId ?? "unknown",
    providerName: provider?.providerName ?? "Unknown provider",
    symbol: provider?.symbol ?? company.ticker,
    generatedAt,
    scoreStatus: "percentile-locked",
    scoreMessage:
      "Raw factors are evidence, not scores. Factor percentiles and Q/V/M scores remain locked until a validated comparison universe is available.",
    datasets: results.map((result) => ({
      dataset: result.dataset,
      status: result.status,
      message: result.message,
      endpoint: result.endpoint,
      fetchedAt: result.checkedAt,
      sampleSize: result.sampleSize,
    })),
    pillars: {
      quality: buildPillar(
        "quality",
        qualityFactorDefinitions,
        buildQualitySeeds(results),
      ),
      value: buildPillar(
        "value",
        valueFactorDefinitions,
        buildValueSeeds(results),
      ),
      momentum: buildPillar(
        "momentum",
        momentumFactorDefinitions,
        buildMomentumSeeds(results),
      ),
    },
  };
}
