export type CompanyDataStatus = "awaiting-live-data" | "live";

export interface CompanyUniverseMember {
  companyId: string;
  companyName: string;
  ticker: string;
  exchangeMic: "XLON";
  isin: string;
  quoteCurrency: "GBX";
  brandDomain: string;
  sector: string;
  industry: string;
  dataStatus: CompanyDataStatus;
}

export interface CompanyUniverseValidation {
  valid: boolean;
  errors: string[];
}

export function validateCompanyUniverse(
  companies: readonly CompanyUniverseMember[],
): CompanyUniverseValidation {
  const errors: string[] = [];
  const companyIds = new Set<string>();
  const tickers = new Set<string>();
  const isins = new Set<string>();

  companies.forEach((company) => {
    if (companyIds.has(company.companyId)) {
      errors.push(`Duplicate company ID: ${company.companyId}`);
    }

    if (tickers.has(company.ticker)) {
      errors.push(`Duplicate ticker: ${company.ticker}`);
    }

    if (isins.has(company.isin)) {
      errors.push(`Duplicate ISIN: ${company.isin}`);
    }

    if (!/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(company.isin)) {
      errors.push(`Invalid ISIN format for ${company.companyName}`);
    }

    if (!company.brandDomain.includes(".")) {
      errors.push(`Invalid brand domain for ${company.companyName}`);
    }

    companyIds.add(company.companyId);
    tickers.add(company.ticker);
    isins.add(company.isin);
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
