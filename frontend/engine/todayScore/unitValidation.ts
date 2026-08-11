export interface MarketValueValidationInput {
  quoteCurrency?: string;
  financialCurrency?: string;
  exchangeMic?: string;
  symbol?: string;
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

interface ScaleReconciliation {
  scale: number;
  latestPriceInFinancialCurrency: number;
  independentlyDerivedMarketCap: number;
  marketCap: number;
  reportedMarketCapWasNormalised: boolean;
  inferredFromListingEvidence: boolean;
}

function isLondonListing(input: MarketValueValidationInput): boolean {
  const exchangeMic = input.exchangeMic?.trim().toUpperCase();
  const symbol = input.symbol?.trim().toUpperCase();

  return exchangeMic === "XLON" || symbol?.endsWith(":LSE") === true;
}

function scaleCandidates(input: MarketValueValidationInput): number[] {
  const declaredScale = quoteToFinancialScale(
    input.quoteCurrency,
    input.financialCurrency,
  );
  const candidates = new Set<number>();

  if (declaredScale !== undefined) {
    candidates.add(declaredScale);
  }

  if (
    input.quoteCurrency === "GBP" &&
    input.financialCurrency === "GBP" &&
    isLondonListing(input)
  ) {
    candidates.add(0.01);
  }

  return [...candidates];
}

function reconcileScale(
  input: MarketValueValidationInput,
  scale: number,
  declaredScale: number | undefined,
): ScaleReconciliation | undefined {
  if (
    !finite(input.latestClose) ||
    !finite(input.sharesOutstanding) ||
    !finite(input.reportedMarketCap)
  ) {
    return undefined;
  }

  const latestPriceInFinancialCurrency = input.latestClose * scale;
  const independentlyDerivedMarketCap =
    latestPriceInFinancialCurrency * input.sharesOutstanding;

  if (reconciles(input.reportedMarketCap, independentlyDerivedMarketCap)) {
    return {
      scale,
      latestPriceInFinancialCurrency,
      independentlyDerivedMarketCap,
      marketCap: input.reportedMarketCap,
      reportedMarketCapWasNormalised: false,
      inferredFromListingEvidence: scale !== declaredScale,
    };
  }

  if (
    scale !== 1 &&
    reconciles(input.reportedMarketCap * scale, independentlyDerivedMarketCap)
  ) {
    return {
      scale,
      latestPriceInFinancialCurrency,
      independentlyDerivedMarketCap,
      marketCap: input.reportedMarketCap * scale,
      reportedMarketCapWasNormalised: true,
      inferredFromListingEvidence: scale !== declaredScale,
    };
  }

  return undefined;
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
  const declaredScale = quoteToFinancialScale(
    input.quoteCurrency,
    input.financialCurrency,
  );
  const reconciliations = scaleCandidates(input).flatMap((candidate) => {
    const reconciliation = reconcileScale(input, candidate, declaredScale);
    return reconciliation ? [reconciliation] : [];
  });
  const reconciliation =
    reconciliations.length === 1 ? reconciliations[0] : undefined;
  const scale = reconciliation?.scale ?? declaredScale;
  const latestPriceInFinancialCurrency =
    reconciliation?.latestPriceInFinancialCurrency ??
    (finite(input.latestClose) && finite(declaredScale)
      ? input.latestClose * declaredScale
      : undefined);
  let status: MarketValueValidation["status"] = "rejected";
  let marketCap: number | undefined;
  let marketCapMessage: string;

  if (reconciliations.length > 1) {
    marketCapMessage =
      "Market capitalisation matched more than one GBP/GBX interpretation, so the quote scale was ambiguous and dependent factors were rejected.";
  } else if (reconciliation?.inferredFromListingEvidence) {
    status = "normalised";
    marketCap = reconciliation.marketCap;
    marketCapMessage = `The provider labelled this London quote as ${input.quoteCurrency ?? "unknown"}, but adjusted price multiplied by reported shares reconciled uniquely with the ${input.financialCurrency ?? "financial-statement"} market capitalisation only at scale ${reconciliation.scale}. The LSE pence-to-pounds scale was therefore inferred from independent listing and market-value evidence.`;
  } else if (reconciliation?.reportedMarketCapWasNormalised) {
    status = "normalised";
    marketCap = reconciliation.marketCap;
    marketCapMessage = `Reported market capitalisation used ${input.quoteCurrency ?? "quote-currency"} units. It was multiplied by ${reconciliation.scale} and independently reconciled in ${input.financialCurrency ?? "the financial-statement currency"}.`;
  } else if (reconciliation) {
    status = "validated";
    marketCap = reconciliation.marketCap;
    marketCapMessage =
      "Reported market capitalisation reconciles with adjusted price multiplied by reported shares outstanding.";
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
