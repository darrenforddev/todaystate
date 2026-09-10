import {
  todayScoreWeights,
  type TodayScoreResult,
} from "../todayScore/todayScore";

import {
  classifyTodayScore,
} from "../todayScore/scoreBands";

import {
  explainTodayScore,
} from "../todayScore/todayScoreExplanation";

import type {
  SelectionDecision,
} from "./types";

export interface SelectionApprovalDraftInput {
  ticker: string;
  companyName: string;
  decision: SelectionDecision;

  todayScore: number;
  qualityScore: number;
  valueScore: number;
  momentumScore: number;

  benchmarkTicker: string;

  themeName?: string;
  themeConfidence?: number;
}

export interface SelectionApprovalDraft {
  thesis: string;
  risks: string[];
}

function buildTodayScoreResult(
  input: SelectionApprovalDraftInput,
): TodayScoreResult {
  return {
    score: input.todayScore,
    quality: input.qualityScore,
    value: input.valueScore,
    momentum: input.momentumScore,
    weights: {
      ...todayScoreWeights,
    },
  };
}

export function buildSelectionApprovalDraft(
  input: SelectionApprovalDraftInput,
): SelectionApprovalDraft {
  const result =
    buildTodayScoreResult(input);

  const classification =
    classifyTodayScore(result);

  const explanation =
    explainTodayScore(
      result,
      classification,
    );

  const ticker =
    input.ticker.trim().toUpperCase();

  const benchmarkTicker =
    input.benchmarkTicker
      .trim()
      .toUpperCase();

  const expectedPerformance =
    input.decision === "long"
      ? "outperform"
      : "underperform";

  const themeSentence =
    input.themeName?.trim()
      ? (
          ` The selection is also aligned with the ` +
          `${input.themeName.trim()} theme` +
          (
            input.themeConfidence !== undefined
              ? ` at ${input.themeConfidence}% confidence.`
              : "."
          )
        )
      : "";

  const thesis =
    `${input.companyName.trim()} is classified as ` +
    `${classification.band} with a TodayScore of ` +
    `${result.score}/100. The ${input.decision} selection ` +
    `expects ${ticker} to ${expectedPerformance} ` +
    `${benchmarkTicker}. ${explanation.summary}` +
    themeSentence;

  const risks = [
    ...explanation.weaknesses,
    ...explanation.warnings,
  ];

  if (
    input.themeConfidence !== undefined &&
    input.themeConfidence < 65
  ) {
    risks.push(
      `Theme confidence is only ${input.themeConfidence}%, so the thematic signal may be unreliable.`,
    );
  }

  if (risks.length === 0) {
    risks.push(
      "Company-specific developments may not be captured by the current TodayScore factors.",
    );

    risks.push(
      `${ticker} may perform differently from the expected direction relative to ${benchmarkTicker}.`,
    );
  }

  return {
    thesis,
    risks,
  };
}