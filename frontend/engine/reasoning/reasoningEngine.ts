import {
  buildEvidence,
  type Evidence,
} from "@/engine/evidence/index";

import {
  getThemesForIndicator,
  type ThemeLink,
} from "@/engine/themeEngine";

export interface ReasoningResult {
  evidence: Evidence;
  themes: ThemeLink[];
}

export function reasonFromIndicator(
  indicatorId: string,
  current: number,
  previous: number
): ReasoningResult {
  const evidence = buildEvidence(
    indicatorId,
    current,
    previous
  );

  const themes = getThemesForIndicator(
    evidence.indicatorId
  );

  return {
    evidence,
    themes,
  };
}