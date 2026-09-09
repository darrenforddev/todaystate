import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildOutcomeReviewEvidence,
} from "./outcomeReviewEvidence";

describe(
  "buildOutcomeReviewEvidence",
  () => {
    it(
      "maps successful evidence to supporting factors",
      () => {
        const result =
          buildOutcomeReviewEvidence({
            status: "successful",
            relativeReturn: 4.5,
            cause: "theme",
            notes:
              "Industrial demand strengthened.",
          });

        expect(
          result.supportingFactors,
        ).toHaveLength(1);

        expect(
          result.supportingFactors[0],
        ).toMatchObject({
          cause: "theme",
          impact: "supportive",
          explanation:
            "Industrial demand strengthened.",
        });

        expect(
          result.contradictoryFactors,
        ).toEqual([]);
      },
    );

    it(
      "maps unsuccessful evidence to contradictory factors",
      () => {
        const result =
          buildOutcomeReviewEvidence({
            status: "unsuccessful",
            relativeReturn: -6.2,
            cause: "timing",
            notes:
              "The signal arrived too early.",
          });

        expect(
          result.supportingFactors,
        ).toEqual([]);

        expect(
          result.contradictoryFactors,
        ).toHaveLength(1);

        expect(
          result.contradictoryFactors[0],
        ).toMatchObject({
          cause: "timing",
          impact: "contradictory",
        });
      },
    );

    it(
      "treats a positive inconclusive result as weakly supportive",
      () => {
        const result =
          buildOutcomeReviewEvidence({
            status: "inconclusive",
            relativeReturn: 0.4,
            cause: "company",
            notes:
              "Company execution was modestly supportive.",
          });

        expect(
          result.supportingFactors,
        ).toHaveLength(1);

        expect(
          result.contradictoryFactors,
        ).toEqual([]);
      },
    );

    it(
      "treats a negative inconclusive result as weakly contradictory",
      () => {
        const result =
          buildOutcomeReviewEvidence({
            status: "inconclusive",
            relativeReturn: -0.4,
            cause: "market",
            notes:
              "Market leadership moved elsewhere.",
          });

        expect(
          result.supportingFactors,
        ).toEqual([]);

        expect(
          result.contradictoryFactors,
        ).toHaveLength(1);
      },
    );

    it(
      "does not force a direction when relative performance is zero",
      () => {
        const result =
          buildOutcomeReviewEvidence({
            status: "inconclusive",
            relativeReturn: 0,
            cause: "macro",
            notes:
              "The macro evidence remained mixed.",
          });

        expect(result).toEqual({
          supportingFactors: [],
          contradictoryFactors: [],
        });
      },
    );

    it(
      "does not create a factor when evidence is insufficient",
      () => {
        const result =
          buildOutcomeReviewEvidence({
            status: "unsuccessful",
            relativeReturn: -3,
            cause:
              "insufficient-evidence",
            notes: "   ",
          });

        expect(result).toEqual({
          supportingFactors: [],
          contradictoryFactors: [],
        });
      },
    );
  },
);