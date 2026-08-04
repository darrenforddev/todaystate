import { calculateThemeScore } from "./scoring";
import { calculateThemeConfidence } from "./confidence";
import { themes } from "@/data/themes";
import { getThemeEvidence } from "./query";
import { getThemeReasoning } from "./reasoning";

export interface ThemeIntelligence {
  id: string;
  name: string;
  conviction: number;
  confidence: number;
  signal: string;
  narrative: string;
  evidence: ThemeEvidence[];
  reasoning: string[];
}

export interface ThemeEvidence {
  id: string;
  title: string;
  weight: number;
}

export interface ThemeEvidence {
  id: string;
  title: string;
  weight: number;
  latestValue: number;
  previousValue: number;
  trend: "improving" | "stable" | "weakening";
  interpretation: string;
  releasedAt: string;
}

export function getTheme(themeId: string): ThemeIntelligence {
    const themeDefinition = themes.find((theme) => theme.id === themeId);

  if (!themeDefinition) {
    throw new Error(`Theme not found: ${themeId}`);
  }
  const conviction = calculateThemeScore(themeId);
  const confidence = calculateThemeConfidence(themeId);
  const supportingEvidence = getThemeEvidence(themeId); 
  const reasoning = getThemeReasoning(themeId);

  let signal = "Neutral";

  if (conviction >= 90) {
    signal = "Strong Positive";
  } else if (conviction >= 75) {
    signal = "Positive";
  } else if (conviction >= 50) {
    signal = "Neutral";
  } else if (conviction >= 25) {
    signal = "Negative";
  } else {
    signal = "Strong Negative";
  }

  return {
    id: themeId,
    name: themeDefinition.name,
    conviction,
    confidence,
    signal,
    narrative: themeDefinition.opinion,
    evidence: supportingEvidence,
    reasoning,
  };
}