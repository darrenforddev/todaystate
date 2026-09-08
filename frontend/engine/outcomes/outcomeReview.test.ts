import {
  describe,
  expect,
  it,
} from "vitest";

import {
  calculateOutcomeReview,
} from "./outcomeReview";

import type {
  OutcomeReviewInput,
} from "./outcomeReview";

const baseInput: OutcomeReviewInput = {
  selectionId: "selection-cat-2026-08",
  decision: "long",
  horizon: "one-month",

  measurementDate: "2026-09-03",
  reviewedAt: "2026-09-03",

  companyEntryPrice: 100,
  companyReviewPrice: 100,

  benchmarkEntryPrice: 100,
  benchmarkReviewPrice: 100,
};

describe(
  "calculateOutcomeReview",
  () => {
    it(
      "classifies relative outperformance above one percent as successful",
      () => {
        const result =
          calculateOutcomeReview({
            ...baseInput,
            companyReviewPrice: 102,
          });

        expect(
          result.relativeReturn,
        ).toBe(2);

        expect(result.status).toBe(
          "successful",
        );
      },
    );

    it(
      "classifies relative underperformance below minus one percent as unsuccessful",
      () => {
        const result =
          calculateOutcomeReview({
            ...baseInput,
            companyReviewPrice: 98,
          });

        expect(
          result.relativeReturn,
        ).toBe(-2);

        expect(result.status).toBe(
          "unsuccessful",
        );
      },
    );

    it(
      "classifies exactly positive one percent as inconclusive",
      () => {
        const result =
          calculateOutcomeReview({
            ...baseInput,
            companyReviewPrice: 101,
          });

        expect(
          result.relativeReturn,
        ).toBe(1);

        expect(result.status).toBe(
          "inconclusive",
        );

        expect(
          result.explanation,
        ).toContain(
          "was inconclusive",
        );
      },
    );

    it(
      "classifies exactly negative one percent as inconclusive",
      () => {
        const result =
          calculateOutcomeReview({
            ...baseInput,
            companyReviewPrice: 99,
          });

        expect(
          result.relativeReturn,
        ).toBe(-1);

        expect(result.status).toBe(
          "inconclusive",
        );
      },
    );

    it(
      "classifies matching performance as inconclusive",
      () => {
        const result =
          calculateOutcomeReview(
            baseInput,
          );

        expect(
          result.relativeReturn,
        ).toBe(0);

        expect(result.status).toBe(
          "inconclusive",
        );
      },
    );

    it(
      "aligns short returns with the predicted direction",
      () => {
        const successfulShort =
          calculateOutcomeReview({
            ...baseInput,
            decision: "short",
            companyReviewPrice: 98,
          });

        const unsuccessfulShort =
          calculateOutcomeReview({
            ...baseInput,
            decision: "short",
            companyReviewPrice: 102,
          });

        expect(
          successfulShort.relativeReturn,
        ).toBe(2);

        expect(
          successfulShort.status,
        ).toBe("successful");

        expect(
          unsuccessfulShort.relativeReturn,
        ).toBe(-2);

        expect(
          unsuccessfulShort.status,
        ).toBe("unsuccessful");
      },
    );
  },
);