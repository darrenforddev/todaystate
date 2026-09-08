import {
  describe,
  expect,
  it,
} from "vitest";

import {
  generateOutcomeExplanation,
} from "./outcomeExplanation";

import type {
  HorizonOutcome,
  OutcomeExplanationFactor,
  SelectionSnapshot,
} from "./types";

const selection: SelectionSnapshot = {
  selectionId: "selection-cat-2026-08",
  companyId: "caterpillar",
  ticker: "CAT",
  companyName: "Caterpillar",

  decision: "long",
  selectedAt: "2026-08-03",
  entryPrice: 425,

  todayScore: 78,
  qualityScore: 82,
  valueScore: 67,
  momentumScore: 85,

  themeId: "industrial-recovery",
  themeName: "Industrial Recovery",
  themeScore: 74,
  themeConfidence: 71,

  benchmarkId: "spy",
  benchmarkName: "S&P 500 ETF",
  benchmarkEntryPrice: 630,

  thesis:
    "Industrial recovery should support relative performance.",
  risks: [
    "Economic growth could weaken.",
    "Valuation could contract.",
  ],
};

const themeSupport: OutcomeExplanationFactor = {
  cause: "theme",
  impact: "supportive",
  title: "Industrial activity strengthened",
  explanation:
    "The industrial recovery theme continued to improve.",
};

const scoreSupport: OutcomeExplanationFactor = {
  cause: "today-score",
  impact: "supportive",
  title: "Strong TodayScore",
  explanation:
    "Quality and momentum remained supportive.",
};

const marketContradiction: OutcomeExplanationFactor = {
  cause: "market",
  impact: "contradictory",
  title: "Broader market leadership",
  explanation:
    "The benchmark outperformed the selected company.",
};

function createOutcome(
  overrides: Partial<HorizonOutcome>,
): HorizonOutcome {
  return {
    horizon: "three-month",
    measurementDate: "2026-11-03",
    companyReviewPrice: 455,
    benchmarkReviewPrice: 650,
    companyReturn: 7.06,
    benchmarkReturn: 3.17,
    relativeReturn: 3.89,
    status: "successful",
    ...overrides,
  };
}

describe(
  "generateOutcomeExplanation",
  () => {
    it(
      "explains a successful prediction",
      () => {
        const explanation =
          generateOutcomeExplanation({
            selection,
            outcome: createOutcome({}),
            supportingFactors: [
              themeSupport,
              scoreSupport,
            ],
            contradictoryFactors: [
              marketContradiction,
            ],
            lessons: [
              "Industrial momentum was useful.",
            ],
            generatedAt: "2026-11-04",
          });

        expect(
          explanation.predictionWasCorrect,
        ).toBe(true);

        expect(
          explanation.primaryCause,
        ).toBe("theme");

        expect(
          explanation.confidenceAdjustment,
        ).toBe(4);

        expect(
          explanation.generatedAt,
        ).toBe("2026-11-04");

        expect(
          explanation.summary,
        ).toContain(
          "Caterpillar's long selection was correct",
        );

        expect(
          explanation.summary,
        ).toContain(
          "+3.89% relative return",
        );
      },
    );

    it(
      "explains an unsuccessful prediction",
      () => {
        const explanation =
          generateOutcomeExplanation({
            selection,
            outcome: createOutcome({
              companyReturn: -4,
              benchmarkReturn: 2,
              relativeReturn: -6,
              status: "unsuccessful",
            }),
            contradictoryFactors: [
              marketContradiction,
              {
                cause: "timing",
                impact: "contradictory",
                title: "Signal was early",
                explanation:
                  "The expected recovery had not reached company earnings.",
              },
            ],
            unexpectedEvents: [
              "A sudden demand warning was issued.",
            ],
            generatedAt: "2026-11-04",
          });

        expect(
          explanation.predictionWasCorrect,
        ).toBe(false);

        expect(
          explanation.primaryCause,
        ).toBe("market");

        expect(
          explanation.confidenceAdjustment,
        ).toBe(-7);

        expect(
          explanation.summary,
        ).toContain(
          "Caterpillar's long selection was incorrect",
        );

        expect(
          explanation.summary,
        ).toContain(
          "-6.00% relative return",
        );
      },
    );

    it(
      "represents an inconclusive outcome without calling it incorrect",
      () => {
        const explanation =
          generateOutcomeExplanation({
            selection,
            outcome: createOutcome({
              relativeReturn: 0.45,
              status: "inconclusive",
            }),
            contradictoryFactors: [
              marketContradiction,
            ],
            generatedAt: "2026-11-04",
          });

        expect(
          explanation.predictionWasCorrect,
        ).toBeNull();

        expect(
          explanation.primaryCause,
        ).toBe(
          "insufficient-evidence",
        );

        expect(
          explanation.confidenceAdjustment,
        ).toBe(0);

        expect(
          explanation.summary,
        ).toContain(
          "outcome was inconclusive",
        );

        expect(
          explanation.summary,
        ).not.toContain(
          "was incorrect",
        );
      },
    );

    it(
      "rejects a pending outcome",
      () => {
        expect(() =>
          generateOutcomeExplanation({
            selection,
            outcome: createOutcome({
              status: "pending",
              companyReviewPrice:
                undefined,
              benchmarkReviewPrice:
                undefined,
              companyReturn: undefined,
              benchmarkReturn:
                undefined,
              relativeReturn: undefined,
            }),
          }),
        ).toThrow(
          "A pending outcome cannot be explained.",
        );
      },
    );

    it(
      "limits confidence adjustments to the allowed range",
      () => {
        const manySupportingFactors =
          Array.from(
            { length: 20 },
            () => themeSupport,
          );

        const manyContradictoryFactors =
          Array.from(
            { length: 20 },
            () => marketContradiction,
          );

        const successful =
          generateOutcomeExplanation({
            selection,
            outcome: createOutcome({}),
            supportingFactors:
              manySupportingFactors,
          });

        const unsuccessful =
          generateOutcomeExplanation({
            selection,
            outcome: createOutcome({
              status: "unsuccessful",
            }),
            contradictoryFactors:
              manyContradictoryFactors,
          });

        expect(
          successful.confidenceAdjustment,
        ).toBe(10);

        expect(
          unsuccessful.confidenceAdjustment,
        ).toBe(-10);
      },
    );
  },
);