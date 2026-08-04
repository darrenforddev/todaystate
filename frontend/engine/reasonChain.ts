import { getMarketBrain } from "./marketBrain";
import { getTopThemes, getTopCompanies } from "./ranking";
import { getThemeEvidence } from "./query";

export interface ReasonNode {
  title: string;
  value: string;
}

export interface ReasonChain {
  market: ReasonNode;
  theme: ReasonNode;
  evidence: ReasonNode;
  company: ReasonNode;
}

export function getReasonChain(): ReasonChain {
  const market = getMarketBrain();

  const theme = getTopThemes(1)[0];

  const company = getTopCompanies(1)[0];

  const evidence = theme
    ? getThemeEvidence(theme.id)[0]
    : undefined;

  return {
    market: {
      title: "Market",
      value: market.signal,
    },

    theme: {
      title: "Theme",
      value: theme?.name ?? "Unknown",
    },

    evidence: {
      title: "Evidence",
      value: evidence?.title ?? "None",
    },

    company: {
      title: "Company",
      value: company?.name ?? "Unknown",
    },
  };
}