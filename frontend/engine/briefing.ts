import { getMarketBrain } from "./marketBrain";
import { getThemeEvidence } from "./query";
import { getTopCompanies, getTopThemes } from "./ranking";
import { describeMarket } from "./reasoning/market";

export interface MorningInsight {
  title: string;
  introduction: string;
  themeSummary: string;
  companySummary: string;
  conclusion: string;
  confidence: number;
}

export function generateMorningInsight(): MorningInsight {
  const market = getMarketBrain();

  const topTheme = getTopThemes(1)[0];
  const topCompany = getTopCompanies(1)[0];

  const supportingEvidence = topTheme
    ? getThemeEvidence(topTheme.id)
    : [];

  const leadEvidence = supportingEvidence[0];

  return {
    title: "Morning Assessment",

    introduction:
      `Overall market conditions remain ${describeMarket(market.signal)}.`,

    themeSummary: topTheme
      ? `${topTheme.name} is currently today's strongest investment theme with a conviction score of ${topTheme.conviction}.`
      : "No leading investment theme is currently available.",

    companySummary: topCompany
      ? `${topCompany.name} remains one of today's highest-conviction companies benefiting from current market conditions.`
      : "No leading company assessment is currently available.",

    conclusion: leadEvidence
      ? `${leadEvidence.title} remains one of the strongest supporting indicators behind today's assessment.`
      : "Current evidence continues to support this outlook.",

    confidence: market.confidence,
  };
}