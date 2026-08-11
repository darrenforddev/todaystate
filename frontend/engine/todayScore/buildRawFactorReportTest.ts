import { strict as assert } from "node:assert";

import { buildRawTodayScoreReport } from "./buildRawFactorReport";
import type {
  ProviderCompanyIdentity,
  ProviderDatasetResult,
  TodayScoreDataset,
} from "./providers/types";

const company: ProviderCompanyIdentity = {
  companyId: "bt-trial",
  companyName: "BT Group trial",
  ticker: "BT.A",
  exchangeMic: "XLON",
};

const checkedAt = "2026-08-10T12:00:00.000Z";

function result(
  dataset: TodayScoreDataset,
  payload: unknown,
): ProviderDatasetResult {
  return {
    providerId: "twelve-data",
    providerName: "Twelve Data",
    companyId: company.companyId,
    companyName: company.companyName,
    symbol: "BT.A:LSE",
    dataset,
    endpoint: `/${dataset}`,
    status: "available",
    message: "Available",
    checkedAt,
    payload,
  };
}

const priceValues = Array.from({ length: 400 }, (_, index) => {
  const date = new Date(Date.UTC(2025, 0, 1 + index));

  return {
    datetime: date.toISOString().slice(0, 10),
    close: String(100 + index * 0.25),
  };
}).reverse();

const results: ProviderDatasetResult[] = [
  result("price-history", {
    meta: { symbol: "BT.A", currency: "GBP" },
    values: priceValues,
  }),
  result("statistics", {
    meta: { symbol: "BT.A", currency: "GBP" },
    statistics: {
      valuations_metrics: {
        market_capitalization: 20_000,
        enterprise_value: 30_000,
        trailing_pe: 8,
        forward_pe: 10,
        price_to_sales_ttm: 0.83,
        price_to_book_mrq: 1.11,
        enterprise_to_ebitda: 6,
      },
      financials: {
        most_recent_quarter: "2026-06-30",
        profit_margin: 0.1,
        operating_margin: 0.18,
        return_on_equity_ttm: 0.2,
        income_statement: {
          revenue_ttm: 24_000,
          ebitda: 5_000,
          net_income_to_common_ttm: 2_400,
        },
        balance_sheet: {
          total_cash_mrq: 2_000,
          total_debt_mrq: 12_000,
          current_ratio_mrq: 0.9,
        },
        cash_flow: {
          operating_cash_flow_ttm: 3_000,
          levered_free_cash_flow_ttm: 2_000,
        },
      },
    },
  }),
  result("income-statement", {
    meta: { symbol: "BT.A", currency: "GBP" },
    income_statement: [
      {
        fiscal_date: "2026-03-31",
        sales: 24_000,
        operating_income: 4_000,
        non_operating_interest: { expense: 1_000 },
        pretax_income: 3_000,
        income_tax: 600,
        net_income: 2_400,
        ebit: 4_000,
        basic_shares_outstanding: 9_500,
      },
      {
        fiscal_date: "2025-03-31",
        sales: 23_000,
        net_income: 2_000,
        basic_shares_outstanding: 9_700,
      },
      {
        fiscal_date: "2024-03-31",
        sales: 22_000,
        net_income: 1_800,
        basic_shares_outstanding: 9_900,
      },
    ],
  }),
  result("balance-sheet", {
    meta: { symbol: "BT.A", currency: "GBP" },
    balance_sheet: [
      {
        fiscal_date: "2026-03-31",
        assets: {
          current_assets: {
            cash_and_cash_equivalents: 2_000,
            total_current_assets: 8_000,
          },
          total_assets: 50_000,
        },
        liabilities: {
          current_liabilities: {
            short_term_debt: 2_000,
            total_current_liabilities: 10_000,
          },
          non_current_liabilities: { long_term_debt: 10_000 },
          total_liabilities: 32_000,
        },
        shareholders_equity: {
          retained_earnings: 9_000,
          total_shareholders_equity: 18_000,
        },
      },
      {
        fiscal_date: "2025-03-31",
        assets: { total_assets: 48_000 },
        liabilities: {
          current_liabilities: { short_term_debt: 2_500 },
          non_current_liabilities: { long_term_debt: 10_500 },
        },
      },
    ],
  }),
  result("cash-flow", {
    meta: { symbol: "BT.A", currency: "GBP" },
    cash_flow: [
      {
        fiscal_date: "2026-03-31",
        financing_activities: {
          common_dividends: -900,
          common_stock_repurchase: -100,
        },
      },
    ],
  }),
  result("eps-trend", {
    meta: { symbol: "BT.A", currency: "GBP" },
    eps_trend: [
      {
        date: "2027-03-31",
        period: "current_year",
        current_estimate: 0.2,
        "90_days_ago": 0.18,
      },
      {
        date: "2028-03-31",
        period: "next_year",
        current_estimate: 0.22,
      },
    ],
  }),
  result("eps-revisions", {
    meta: { symbol: "BT.A", currency: "GBP" },
    eps_revision: [
      {
        date: "2027-03-31",
        period: "current_year",
        up_last_month: 4,
        down_last_month: 1,
      },
    ],
  }),
];

const report = buildRawTodayScoreReport(
  company,
  results,
  "2026-08-10T12:01:00.000Z",
);

assert.equal(report.scoreStatus, "percentile-locked");
assert.equal(report.unitValidation.status, "normalised");
assert.equal(report.unitValidation.quoteToFinancialScale, 0.01);
assert.equal(report.unitValidation.rejectedFactorCount, 0);
assert.equal(report.unitValidation.diagnostics.exchangeMic, "XLON");
assert.equal(report.unitValidation.diagnostics.latestClose, 199.75);
assert.equal(report.unitValidation.diagnostics.sharesOutstanding, 9_500);
assert.equal(
  report.unitValidation.diagnostics.candidates.find(
    (candidate) => candidate.scale === 0.01,
  )?.selected,
  true,
);
assert.equal(report.datasets.length, 7);
assert.equal(report.pillars.quality.availableFactorCount, 15);
assert.equal(report.pillars.value.availableFactorCount, 9);
assert.equal(report.pillars.momentum.availableFactorCount, 10);

const returnOnEquity = report.pillars.quality.factors.find(
  (factor) => factor.factorId === "return-on-equity",
);
assert.equal(returnOnEquity?.rawValue, 20);
assert.equal(returnOnEquity?.scoreStatus, "percentile-locked");
assert.equal(returnOnEquity?.evidence[0].observedAt, "2026-06-30");

const netDebtToEbitda = report.pillars.quality.factors.find(
  (factor) => factor.factorId === "net-debt-to-ebitda",
);
assert.equal(netDebtToEbitda?.rawValue, 2);

const fcfYield = report.pillars.value.factors.find(
  (factor) => factor.factorId === "free-cash-flow-yield",
);
assert.equal(fcfYield?.rawValue, 10);

const enterpriseValueFallbackResults = structuredClone(results);
const enterpriseValueFallbackStatisticsResult =
  enterpriseValueFallbackResults.find(
    (providerResult) => providerResult.dataset === "statistics",
  );
const enterpriseValueFallbackIncomeResult = enterpriseValueFallbackResults.find(
  (providerResult) => providerResult.dataset === "income-statement",
);

if (
  !enterpriseValueFallbackStatisticsResult?.payload ||
  !enterpriseValueFallbackIncomeResult?.payload
) {
  throw new Error("Enterprise-value fallback fixture missing.");
}

const enterpriseValueFallbackStatistics =
  enterpriseValueFallbackStatisticsResult.payload as {
    statistics: {
      valuations_metrics: {
        market_capitalization: number;
        enterprise_value: number;
      };
    };
  };
const enterpriseValueFallbackIncome =
  enterpriseValueFallbackIncomeResult.payload as {
    income_statement: Array<{ basic_shares_outstanding?: number }>;
  };

enterpriseValueFallbackStatistics.statistics.valuations_metrics.market_capitalization =
  2_000_000;
enterpriseValueFallbackStatistics.statistics.valuations_metrics.enterprise_value =
  30_000;
for (const record of enterpriseValueFallbackIncome.income_statement) {
  delete record.basic_shares_outstanding;
}

const enterpriseValueFallbackReport = buildRawTodayScoreReport(
  company,
  enterpriseValueFallbackResults,
  "2026-08-10T12:01:30.000Z",
);
const fallbackAltman = enterpriseValueFallbackReport.pillars.quality.factors.find(
  (factor) => factor.factorId === "altman-z-score",
);
const fallbackShareDilution =
  enterpriseValueFallbackReport.pillars.quality.factors.find(
    (factor) => factor.factorId === "share-dilution",
  );
const fallbackPriceToSales =
  enterpriseValueFallbackReport.pillars.value.factors.find(
    (factor) => factor.factorId === "price-to-sales",
  );
const fallbackEnterpriseToEbitda =
  enterpriseValueFallbackReport.pillars.value.factors.find(
    (factor) => factor.factorId === "enterprise-value-to-ebitda",
  );
const fallbackForwardPe = enterpriseValueFallbackReport.pillars.value.factors.find(
  (factor) => factor.factorId === "forward-price-to-earnings",
);

assert.equal(
  enterpriseValueFallbackReport.unitValidation.quoteToFinancialScale,
  undefined,
);
assert.equal(enterpriseValueFallbackReport.unitValidation.marketCapScale, 0.01);
assert.equal(
  enterpriseValueFallbackReport.unitValidation.diagnostics.sharesOutstanding,
  undefined,
);
assert.equal(
  enterpriseValueFallbackReport.unitValidation.diagnostics.candidates.find(
    (candidate) => candidate.scale === 0.01,
  )?.selected,
  true,
);
assert.equal(enterpriseValueFallbackReport.unitValidation.rejectedFactorCount, 1);
assert.equal(
  enterpriseValueFallbackReport.pillars.quality.availableFactorCount,
  14,
);
assert.equal(enterpriseValueFallbackReport.pillars.value.availableFactorCount, 8);
assert.equal(
  enterpriseValueFallbackReport.pillars.momentum.availableFactorCount,
  10,
);
assert.equal(fallbackAltman?.status, "available");
assert.equal(fallbackShareDilution?.status, "unavailable");
assert.equal(fallbackPriceToSales?.status, "available");
assert.equal(fallbackPriceToSales?.rawValue, 0.8333);
assert.equal(fallbackEnterpriseToEbitda?.status, "available");
assert.equal(fallbackEnterpriseToEbitda?.rawValue, 6);
assert.equal(fallbackForwardPe?.status, "rejected");
assert.match(fallbackForwardPe?.explanation ?? "", /independently recalculated/);

const historicalPe = report.pillars.value.factors.find(
  (factor) => factor.factorId === "pe-versus-five-year-average",
);
assert.equal(historicalPe?.status, "unavailable");
assert.equal(historicalPe?.rawValue, undefined);

const estimateRevision = report.pillars.momentum.factors.find(
  (factor) =>
    factor.factorId === "earnings-estimate-revisions-three-month",
);
assert.equal(estimateRevision?.rawValue, 11.1111);
assert.match(estimateRevision?.explanation ?? "", /4 upward and 1 downward/);

const relativeStrength = report.pillars.momentum.factors.find(
  (factor) => factor.factorId === "relative-strength",
);
assert.equal(relativeStrength?.status, "unavailable");
assert.match(relativeStrength?.explanation ?? "", /comparison-universe/);

const rejectedResults = structuredClone(results);
const rejectedStatisticsResult = rejectedResults.find(
  (providerResult) => providerResult.dataset === "statistics",
);

if (!rejectedStatisticsResult?.payload) {
  throw new Error("Statistics fixture missing.");
}

const rejectedStatisticsPayload = rejectedStatisticsResult.payload as {
  statistics: {
    valuations_metrics: {
      market_capitalization: number;
      enterprise_value: number;
    };
  };
};
rejectedStatisticsPayload.statistics.valuations_metrics.market_capitalization =
  700_000;
rejectedStatisticsPayload.statistics.valuations_metrics.enterprise_value =
  710_000;

const rejectedReport = buildRawTodayScoreReport(
  company,
  rejectedResults,
  "2026-08-10T12:02:00.000Z",
);
const rejectedPriceToSales = rejectedReport.pillars.value.factors.find(
  (factor) => factor.factorId === "price-to-sales",
);
const rejectedAltman = rejectedReport.pillars.quality.factors.find(
  (factor) => factor.factorId === "altman-z-score",
);

assert.equal(rejectedReport.unitValidation.status, "rejected");
assert.ok(rejectedReport.unitValidation.rejectedFactorCount >= 8);
assert.equal(
  rejectedReport.unitValidation.diagnostics.candidates.some(
    (candidate) => candidate.selected,
  ),
  false,
);
assert.equal(rejectedPriceToSales?.status, "rejected");
assert.equal(rejectedPriceToSales?.rawValue, undefined);
assert.match(rejectedPriceToSales?.explanation ?? "", /failed unit validation/);
assert.equal(rejectedAltman?.status, "rejected");

console.log("Raw TodayScore factor report tests passed.");
