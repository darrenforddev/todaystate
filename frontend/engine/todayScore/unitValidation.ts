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
  marketCapScale?: number;
  latestPriceInFinancialCurrency?: number;
  marketCap?: number;
  enterpriseValue?: number;
  marketCapMessage: string;
  enterpriseValueMessage: string;
  messages: string[];
  diagnostics: MarketValueDiagnostics;
}

export interface MarketValueScaleDiagnostic {
  scale: number;
  source: "declared-currency" | "lse-pence-candidate";
  latestPriceInFinancialCurrency?: number;
  independentlyDerivedMarketCap?: number;
  reportedMarketCap?: number;
  reportedMarketCapAtScale?: number;
  directRelativeDifference?: number;
  scaledRelativeDifference?: number;
  enterpriseValueFromScaledMarketCap?: number;
  enterpriseValueRelativeDifference?: number;
  directMatch: boolean;
  scaledMatch: boolean;
  enterpriseValueMatch: boolean;
  selected: boolean;
}

export interface MarketValueDiagnostics {
  exchangeMic?: string;
  symbol?: string;
  londonListing: boolean;
  latestClose?: number;
  sharesOutstanding?: number;
  reportedMarketCap?: number;
  reportedEnterpriseValue?: number;
  totalDebt?: number;
  totalCash?: number;
  candidates: MarketValueScaleDiagnostic[];
}

const RECONCILIATION_TOLERANCE = 0.25;
const ENTERPRISE_VALUE_IDENTITY_TOLERANCE = 0.02;

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

interface EnterpriseValueReconciliation {
  scale: number;
  marketCap: number;
  enterpriseValue: number;
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

function reconcileMarketCapUsingEnterpriseValue(
  input: MarketValueValidationInput,
  scale: number,
): EnterpriseValueReconciliation | undefined {
  if (
    finite(input.sharesOutstanding) ||
    !finite(input.reportedMarketCap) ||
    input.reportedMarketCap <= 0 ||
    !finite(input.reportedEnterpriseValue) ||
    input.reportedEnterpriseValue <= 0 ||
    !finite(input.totalDebt) ||
    input.totalDebt < 0 ||
    !finite(input.totalCash) ||
    input.totalCash < 0
  ) {
    return undefined;
  }

  const marketCap = input.reportedMarketCap * scale;
  const enterpriseValue = marketCap + input.totalDebt - input.totalCash;

  if (
    relativeDifference(input.reportedEnterpriseValue, enterpriseValue) >
    ENTERPRISE_VALUE_IDENTITY_TOLERANCE
  ) {
    return undefined;
  }

  return { scale, marketCap, enterpriseValue };
}

function buildScaleDiagnostic(
  input: MarketValueValidationInput,
  scale: number,
  declaredScale: number | undefined,
  selectedScale: number | undefined,
): MarketValueScaleDiagnostic {
  const latestPriceInFinancialCurrency = finite(input.latestClose)
    ? input.latestClose * scale
    : undefined;
  const independentlyDerivedMarketCap =
    finite(latestPriceInFinancialCurrency) && finite(input.sharesOutstanding)
      ? latestPriceInFinancialCurrency * input.sharesOutstanding
      : undefined;
  const reportedMarketCapAtScale = finite(input.reportedMarketCap)
    ? input.reportedMarketCap * scale
    : undefined;
  const directRelativeDifference =
    finite(input.reportedMarketCap) && finite(independentlyDerivedMarketCap)
      ? relativeDifference(input.reportedMarketCap, independentlyDerivedMarketCap)
      : undefined;
  const scaledRelativeDifference =
    scale !== 1 &&
    finite(reportedMarketCapAtScale) &&
    finite(independentlyDerivedMarketCap)
      ? relativeDifference(reportedMarketCapAtScale, independentlyDerivedMarketCap)
      : undefined;
  const enterpriseValueFromScaledMarketCap =
    finite(reportedMarketCapAtScale) &&
    finite(input.totalDebt) &&
    finite(input.totalCash)
      ? reportedMarketCapAtScale + input.totalDebt - input.totalCash
      : undefined;
  const enterpriseValueRelativeDifference =
    finite(input.reportedEnterpriseValue) &&
    finite(enterpriseValueFromScaledMarketCap)
      ? relativeDifference(
          input.reportedEnterpriseValue,
          enterpriseValueFromScaledMarketCap,
        )
      : undefined;

  return {
    scale,
    source:
      scale === declaredScale ? "declared-currency" : "lse-pence-candidate",
    latestPriceInFinancialCurrency,
    independentlyDerivedMarketCap,
    reportedMarketCap: input.reportedMarketCap,
    reportedMarketCapAtScale,
    directRelativeDifference,
    scaledRelativeDifference,
    directMatch:
      directRelativeDifference !== undefined &&
      directRelativeDifference <= RECONCILIATION_TOLERANCE,
    scaledMatch:
      scaledRelativeDifference !== undefined &&
      scaledRelativeDifference <= RECONCILIATION_TOLERANCE,
    enterpriseValueFromScaledMarketCap,
    enterpriseValueRelativeDifference,
    enterpriseValueMatch:
      enterpriseValueRelativeDifference !== undefined &&
      enterpriseValueRelativeDifference <=
        ENTERPRISE_VALUE_IDENTITY_TOLERANCE,
    selected: scale === selectedScale,
  };
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
  const candidates = scaleCandidates(input);
  const reconciliations = candidates.flatMap((candidate) => {
    const reconciliation = reconcileScale(input, candidate, declaredScale);
    return reconciliation ? [reconciliation] : [];
  });
  const reconciliation =
    reconciliations.length === 1 ? reconciliations[0] : undefined;
  const enterpriseValueReconciliations =
    reconciliations.length === 0 && !finite(input.sharesOutstanding)
      ? candidates.flatMap((candidate) => {
          const enterpriseValueReconciliation =
            reconcileMarketCapUsingEnterpriseValue(input, candidate);
          return enterpriseValueReconciliation
            ? [enterpriseValueReconciliation]
            : [];
        })
      : [];
  const enterpriseValueReconciliation =
    enterpriseValueReconciliations.length === 1
      ? enterpriseValueReconciliations[0]
      : undefined;
  const enterpriseValueScaleConflictsWithDeclaredQuote =
    enterpriseValueReconciliation !== undefined &&
    enterpriseValueReconciliation.scale !== declaredScale;
  const quoteScale =
    reconciliation?.scale ??
    (enterpriseValueScaleConflictsWithDeclaredQuote
      ? undefined
      : declaredScale);
  const marketCapScale = reconciliation
    ? reconciliation.reportedMarketCapWasNormalised
      ? reconciliation.scale
      : 1
    : enterpriseValueReconciliation?.scale;
  const latestPriceInFinancialCurrency =
    reconciliation?.latestPriceInFinancialCurrency ??
    (!enterpriseValueScaleConflictsWithDeclaredQuote &&
    finite(input.latestClose) &&
    finite(quoteScale)
      ? input.latestClose * quoteScale
      : undefined);
  let status: MarketValueValidation["status"] = "rejected";
  let marketCap: number | undefined;
  let marketCapMessage: string;

  if (reconciliations.length > 1) {
    marketCapMessage =
      "Market capitalisation matched more than one GBP/GBX interpretation, so the quote scale was ambiguous and dependent factors were rejected.";
  } else if (enterpriseValueReconciliations.length > 1) {
    marketCapMessage =
      "Market capitalisation matched more than one enterprise-value interpretation, so the unit scale was ambiguous and dependent factors were rejected.";
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
  } else if (enterpriseValueReconciliation) {
    status = enterpriseValueReconciliation.scale === 1
      ? "validated"
      : "normalised";
    marketCap = enterpriseValueReconciliation.marketCap;
    marketCapMessage =
      enterpriseValueReconciliation.scale === 1
        ? "Shares outstanding were unavailable, but reported market capitalisation reconciled uniquely with reported enterprise value through market capitalisation plus debt less cash. This independently validates the market-cap units without adding evidence about the declared quote-price scale."
        : `Shares outstanding were unavailable, but only reported market capitalisation multiplied by ${enterpriseValueReconciliation.scale} reconciled uniquely with reported enterprise value through market capitalisation plus debt less cash. The LSE market-cap units were therefore normalised independently; the quote-price scale remains unverified.`;
  } else if (!finite(input.sharesOutstanding)) {
    marketCapMessage =
      "Shares outstanding were unavailable and market capitalisation could not be reconciled uniquely through the enterprise-value identity, so dependent factors were rejected.";
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

  if (enterpriseValueReconciliation) {
    enterpriseValue = enterpriseValueReconciliation.enterpriseValue;
    enterpriseValueMessage =
      "Enterprise value reconciles uniquely with the normalised market capitalisation plus debt less cash. This identity does not validate the separate quote-price scale.";
  } else if (
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
    quoteToFinancialScale: quoteScale,
    marketCapScale,
    latestPriceInFinancialCurrency,
    marketCap,
    enterpriseValue,
    marketCapMessage,
    enterpriseValueMessage,
    messages: [marketCapMessage, enterpriseValueMessage],
    diagnostics: {
      exchangeMic: input.exchangeMic,
      symbol: input.symbol,
      londonListing: isLondonListing(input),
      latestClose: input.latestClose,
      sharesOutstanding: input.sharesOutstanding,
      reportedMarketCap: input.reportedMarketCap,
      reportedEnterpriseValue: input.reportedEnterpriseValue,
      totalDebt: input.totalDebt,
      totalCash: input.totalCash,
      candidates: candidates.map((candidate) =>
        buildScaleDiagnostic(
          input,
          candidate,
          declaredScale,
          reconciliation?.scale ?? enterpriseValueReconciliation?.scale,
        ),
      ),
    },
  };
}

export function valuesReconcile(
  reported: number,
  derived: number,
  tolerance = RECONCILIATION_TOLERANCE,
): boolean {
  return relativeDifference(reported, derived) <= tolerance;
}
