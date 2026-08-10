import "server-only";

import type {
  FinancialDataProvider,
  ProviderCompanyIdentity,
  ProviderCoverageProbe,
  TodayScoreDataset,
} from "./types";
import { assessTwelveDataResponse } from "./twelveDataResponse";

const TWELVE_DATA_BASE_URL = "https://api.twelvedata.com";
const TWELVE_DATA_EXCHANGE = "LSE";
const REQUEST_TIMEOUT_MS = 15_000;

const endpointByDataset: Record<TodayScoreDataset, string> = {
  "price-history": "time_series",
  statistics: "statistics",
  "income-statement": "income_statement",
  "balance-sheet": "balance_sheet",
  "cash-flow": "cash_flow",
  "eps-trend": "eps_trend",
  "eps-revisions": "eps_revisions",
};

export const twelveDataLseTrialCompany: ProviderCompanyIdentity = {
  companyId: "twelve-data-lse-trial",
  companyName: "BT Group (Twelve Data trial)",
  ticker: "BT.A",
  exchangeMic: "XLON",
};

function buildDatasetUrl(
  company: ProviderCompanyIdentity,
  dataset: TodayScoreDataset,
): URL {
  const endpoint = endpointByDataset[dataset];
  const url = new URL(endpoint, `${TWELVE_DATA_BASE_URL}/`);

  url.searchParams.set("symbol", company.ticker);
  url.searchParams.set("exchange", TWELVE_DATA_EXCHANGE);

  if (dataset === "price-history") {
    url.searchParams.set("interval", "1day");
    url.searchParams.set("outputsize", "5");
    url.searchParams.set("order", "DESC");
  }

  if (
    dataset === "income-statement" ||
    dataset === "balance-sheet" ||
    dataset === "cash-flow"
  ) {
    url.searchParams.set("period", "annual");
  }

  return url;
}

async function readJsonSafely(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function hasTwelveDataApiKey(): boolean {
  return Boolean(process.env.TWELVE_DATA_API_KEY?.trim());
}

export class TwelveDataProvider implements FinancialDataProvider {
  readonly id = "twelve-data";
  readonly name = "Twelve Data";

  constructor(
    private readonly apiKey: string,
    private readonly request: typeof fetch = fetch,
  ) {
    if (!apiKey.trim()) {
      throw new Error("TWELVE_DATA_API_KEY is not configured.");
    }
  }

  async probeCoverage(
    company: ProviderCompanyIdentity,
    dataset: TodayScoreDataset,
  ): Promise<ProviderCoverageProbe> {
    const endpoint = endpointByDataset[dataset];
    const url = buildDatasetUrl(company, dataset);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await this.request(url, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `apikey ${this.apiKey}`,
        },
        signal: controller.signal,
      });
      const payload = await readJsonSafely(response);
      const assessment = assessTwelveDataResponse(
        response.status,
        response.ok,
        payload,
      );

      return {
        providerId: this.id,
        providerName: this.name,
        companyId: company.companyId,
        companyName: company.companyName,
        symbol: `${company.ticker}:${TWELVE_DATA_EXCHANGE}`,
        dataset,
        endpoint: `/${endpoint}`,
        ...assessment,
        checkedAt: new Date().toISOString(),
      };
    } catch (error) {
      const timedOut = error instanceof Error && error.name === "AbortError";

      return {
        providerId: this.id,
        providerName: this.name,
        companyId: company.companyId,
        companyName: company.companyName,
        symbol: `${company.ticker}:${TWELVE_DATA_EXCHANGE}`,
        dataset,
        endpoint: `/${endpoint}`,
        status: "provider-error",
        message: timedOut
          ? "The Twelve Data coverage check timed out."
          : "The Twelve Data coverage check could not reach the provider.",
        checkedAt: new Date().toISOString(),
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function createTwelveDataProvider(): TwelveDataProvider | null {
  const apiKey = process.env.TWELVE_DATA_API_KEY?.trim();

  return apiKey ? new TwelveDataProvider(apiKey) : null;
}
