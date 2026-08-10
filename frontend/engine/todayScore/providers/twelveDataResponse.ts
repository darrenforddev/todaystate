import type { ProviderCoverageStatus } from "./types";

interface TwelveDataErrorPayload {
  status?: unknown;
  code?: unknown;
  message?: unknown;
}

export interface TwelveDataResponseAssessment {
  status: ProviderCoverageStatus;
  message: string;
  httpStatus?: number;
  sampleSize?: number;
}

function getErrorPayload(payload: unknown): TwelveDataErrorPayload | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  return payload as TwelveDataErrorPayload;
}

function getSampleSize(payload: unknown): number | undefined {
  if (Array.isArray(payload)) {
    return payload.length;
  }

  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const record = payload as Record<string, unknown>;
  const collectionKeys = [
    "values",
    "data",
    "income_statement",
    "balance_sheet",
    "cash_flow",
    "eps_trend",
    "eps_revision",
    "eps_revisions",
  ];

  for (const key of collectionKeys) {
    const value = record[key];

    if (Array.isArray(value)) {
      return value.length;
    }
  }

  return undefined;
}

export function assessTwelveDataResponse(
  httpStatus: number,
  responseOk: boolean,
  payload: unknown,
): TwelveDataResponseAssessment {
  const error = getErrorPayload(payload);
  const providerStatus =
    typeof error?.status === "string" ? error.status.toLowerCase() : "";
  const providerCode =
    typeof error?.code === "number" ? error.code : undefined;
  const providerMessage =
    typeof error?.message === "string" ? error.message.toLowerCase() : "";
  const isError = !responseOk || providerStatus === "error";

  if (!isError) {
    const sampleSize = getSampleSize(payload);
    const isEmptyObject =
      typeof payload === "object" &&
      payload !== null &&
      !Array.isArray(payload) &&
      Object.keys(payload).length === 0;

    if (payload === null || sampleSize === 0 || isEmptyObject) {
      return {
        status: "unavailable",
        message: "Twelve Data returned no records for this symbol and dataset.",
        httpStatus,
        sampleSize: sampleSize ?? 0,
      };
    }

    return {
      status: "available",
      message: "The provider returned data for this dataset.",
      httpStatus,
      sampleSize,
    };
  }

  if (
    httpStatus === 429 ||
    providerCode === 429 ||
    providerMessage.includes("credit") ||
    providerMessage.includes("rate limit")
  ) {
    return {
      status: "rate-limited",
      message: "Twelve Data's request or credit limit has been reached.",
      httpStatus,
    };
  }

  if (
    providerMessage.includes("api key") ||
    providerMessage.includes("apikey") ||
    providerMessage.includes("authentication") ||
    providerMessage.includes("unauthorized")
  ) {
    return {
      status: "authentication-error",
      message: "Twelve Data did not accept the configured API key.",
      httpStatus,
    };
  }

  if (
    providerMessage.includes("plan") ||
    providerMessage.includes("subscription") ||
    providerMessage.includes("upgrade") ||
    providerMessage.includes("grow") ||
    providerMessage.includes("not authorized")
  ) {
    return {
      status: "plan-restricted",
      message: "This dataset or market is not included in the current Twelve Data plan.",
      httpStatus,
    };
  }

  if (
    httpStatus === 404 ||
    providerCode === 404 ||
    providerMessage.includes("symbol") ||
    providerMessage.includes("not found") ||
    providerMessage.includes("no data")
  ) {
    return {
      status: "unavailable",
      message: "Twelve Data did not return coverage for this symbol and dataset.",
      httpStatus,
    };
  }

  return {
    status: "provider-error",
    message: "Twelve Data could not complete the coverage check.",
    httpStatus,
  };
}
