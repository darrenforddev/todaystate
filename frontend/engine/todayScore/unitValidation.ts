export interface MarketValueValidationInput {
  quoteCurrency?: string;
  financialCurrency?: string;
  latestClose?: number;
  sharesOutstanding?: number;
  reportedMarketCap?: number;
  reportedEnterpriseValue?: number;
  totalDebt?: number;
  totalCash?: number;
}

export interface MarketValueValidation {
  status: "validated" | "normalised" | "rejected";
  quoteCurrency?: string;
  financialCurrency?: string;
  quoteToFinancialScale?: number;
  latestPriceInFinancialCurrency?: number;
  marketCap?: number;
  enterpriseValue?: number;
  marketCapMessage: string;
  enterpriseValueMessage: string;
  messages: string[];
}

const RECONCILIATION_TOLERANCE = 0.25;

function finite(value: number | undefined): value is number {
  return value !== undefined && Number.isFinite(value);
}

function relativeDifference(left: number, right: number): number {
  const denominator = Math.max(Math.abs(left), Math.abs(right));

  return denominator === 0 ? 0 : Math.abs(left - right) / denominator;
}

function reconciles(left: number, right: number): boolean {
  return relativeDifference(left, right) <= RECONCILIATION_TOLERANCE;
}

export function quoteToFinancialScale(
  quoteCurrency: string | undefined,
  financialCurrency: string | undefined,
): number | undefined {
  if (!quoteCurrency || !financialCurrency) {
    return undefined;
  }

  if (quoteCurrency === financialCurrency) {
    return 1;
  }

  if (quoteCurrency === "GBX" && financialCurrency === "GBP") {
    return 0.01;
  }

  if (quoteCurrency === "GBP" && financialCurrency === "GBX") {
    return 100;
  }

  return undefined;
}

export function validateMarketValues(
  input: MarketValueValidationInput,
): MarketValueValidation {
  const scale = quoteToFinancialScale(
    input.quoteCurrency,
    input.financialCurrency,
  );
  const latestPriceInFinancialCurrency =
    finite(input.latestClose) && finite(scale)
      ? input.latestClose * scale
      : undefined;
  const independentlyDerivedMarketCap =
    finite(latestPriceInFinancialCurrency) && finite(input.sharesOutstanding)
      ? latestPriceInFinancialCurrency * input.sharesOutstanding
      : undefined;
  let status: MarketValueValidation["status"] = "rejected";
  let marketCap: number | undefined;
  let marketCapMessage: string;

  if (
    finite(input.reportedMarketCap) &&
    finite(independentlyDerivedMarketCap) &&
    reconciles(input.reportedMarketCap, independentlyDerivedMarketCap)
  ) {
    status = "validated";
    marketCap = input.reportedMarketCap;
    marketCapMessage =
      "Reported market capitalisation reconciles with adjusted price multiplied by reported shares outstanding.";
  } else if (
    finite(input.reportedMarketCap) &&
    finite(independentlyDerivedMarketCap) &&
    finite(scale) &&
    scale !== 1 &&
    reconciles(input.reportedMarketCap * scale, independentlyDerivedMarketCap)
  ) {
    status = "normalised";
    marketCap = input.reportedMarketCap * scale;
    marketCapMessage = `Reported market capitalisation used ${input.quoteCurrency ?? "quote-currency"} units. It was multiplied by ${scale} and independently reconciled in ${input.financialCurrency ?? "the financial-statement currency"}.`;
  } else {
    marketCapMessage =
      "Market capitalisation could not be reconciled with adjusted price and reported shares outstanding, so dependent factors were rejected.";
  }

  const independentlyDerivedEnterpriseValue =
    finite(marketCap) && finite(input.totalDebt) && finite(input.totalCash)
      ? marketCap + input.totalDebt - input.totalCash
      : undefined;
  let enterpriseValue: number | undefined;
  let enterpriseValueMessage: string;

  if (
    finite(input.reportedEnterpriseValue) &&
    finite(independentlyDerivedEnterpriseValue) &&
    reconciles(input.reportedEnterpriseValue, independentlyDerivedEnterpriseValue)
  ) {
    enterpriseValue = independentlyDerivedEnterpriseValue;
    enterpriseValueMessage =
      "Enterprise value reconciles with normalised market capitalisation plus debt less cash.";
  } else if (
    finite(input.reportedEnterpriseValue) &&
    finite(input.reportedMarketCap) &&
    finite(marketCap) &&
    finite(independentlyDerivedEnterpriseValue)
  ) {
    const correctedEnterpriseValue =
      input.reportedEnterpriseValue - input.reportedMarketCap + marketCap;

    if (reconciles(correctedEnterpriseValue, independentlyDerivedEnterpriseValue)) {
      enterpriseValue = independentlyDerivedEnterpriseValue;
      status = status === "rejected" ? "rejected" : "normalised";
      enterpriseValueMessage =
        "Enterprise value was rebuilt by replacing its quote-unit market-cap component while preserving debt and cash in the financial-statement currency.";
    } else {
      enterpriseValueMessage =
        "Enterprise value could not be reconciled with normalised market capitalisation plus debt less cash, so dependent factors were rejected.";
    }
  } else if (finite(independentlyDerivedEnterpriseValue)) {
    enterpriseValue = independentlyDerivedEnterpriseValue;
    enterpriseValueMessage =
      "Enterprise value was independently rebuilt from normalised market capitalisation plus debt less cash.";
  } else {
    enterpriseValueMessage =
      "Enterprise value could not be validated because market capitalisation, debt or cash was unavailable.";
  }

  return {
    status,
    quoteCurrency: input.quoteCurrency,
    financialCurrency: input.financialCurrency,
    quoteToFinancialScale: scale,
    latestPriceInFinancialCurrency,
    marketCap,
    enterpriseValue,
    marketCapMessage,
    enterpriseValueMessage,
    messages: [marketCapMessage, enterpriseValueMessage],
  };
}

export function valuesReconcile(
  reported: number,
  derived: number,
  tolerance = RECONCILIATION_TOLERANCE,
): boolean {
  return relativeDifference(reported, derived) <= tolerance;
}
