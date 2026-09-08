import type {
  ProviderCompanyIdentity,
} from "../todayScore/providers/types";

export type ThemeValidationInstrumentType =
  | "etf"
  | "company";

export interface ThemeValidationInstrument
  extends ProviderCompanyIdentity {
  themeId: string;

  instrumentType:
    ThemeValidationInstrumentType;

  validationRole: string;
}

/**
 * Instruments used to test whether the Industrial
 * Recovery signal translated into market performance.
 *
 * These are deliberately separate from the UK-focused
 * TodayScore company universe.
 */
export const industrialRecoveryValidationInstruments:
  readonly ThemeValidationInstrument[] = [
    {
      companyId: "xli",
      companyName:
        "Industrial Select Sector SPDR Fund",
      ticker: "XLI",
      exchangeMic: "ARCX",

      themeId:
        "industrial-recovery",

      instrumentType: "etf",

      validationRole:
        "Primary broad US industrial-sector proxy",
    },

    {
      companyId: "vis",
      companyName:
        "Vanguard Industrials ETF",
      ticker: "VIS",
      exchangeMic: "ARCX",

      themeId:
        "industrial-recovery",

      instrumentType: "etf",

      validationRole:
        "Alternative diversified US industrial-sector proxy",
    },

    {
      companyId: "caterpillar",
      companyName:
        "Caterpillar",
      ticker: "CAT",
      exchangeMic: "XNYS",

      themeId:
        "industrial-recovery",

      instrumentType:
        "company",

      validationRole:
        "Industrial machinery and construction-cycle exposure",
    },

    {
      companyId: "eaton",
      companyName:
        "Eaton",
      ticker: "ETN",
      exchangeMic: "XNYS",

      themeId:
        "industrial-recovery",

      instrumentType:
        "company",

      validationRole:
        "Electrical equipment and industrial infrastructure exposure",
    },
  ];