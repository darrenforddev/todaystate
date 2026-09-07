import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  OutcomeStatus,
} from "./types";

import {
  buildThemeOutcomeRecord,
} from "./themeOutcomeBuilder";

import type {
  ThemeValidationPreview,
} from "./themeValidation";

import {
  buildThemeValidationSummary,
} from "./themeValidationSummary";

type FourOutcomeStatuses = [
  OutcomeStatus,
  OutcomeStatus,
  OutcomeStatus,
  OutcomeStatus,
];

function createPreview(
  reportPeriod: string,
  statuses: FourOutcomeStatuses,
): ThemeValidationPreview {
  const record =
    buildThemeOutcomeRecord({
      themeId:
        "industrial-recovery",

      themeName:
        "Industrial Recovery",

      reportPeriod,
      signalDate:
        "2026-09-03",

      marketEntryDate:
        "2026-09-04",

      direction:
        "positive",

      conviction: 75,
      confidence: 70,

      instrumentId: "xli",
      instrumentTicker: "XLI",
      instrumentName:
        "Industrial Select Sector SPDR Fund",
      instrumentEntryPrice: 100,

      benchmarkId: "spy",
      benchmarkTicker: "SPY",
      benchmarkName:
        "SPDR S&P 500 ETF Trust",
      benchmarkEntryPrice: 500,

      risks: [],
      evidenceIds: [],
    });

  return {
    signalLabel:
      "Positive",

    signalDate:
      record.signal.signalDate,

    marketEntryDate:
      record.signal.marketEntryDate,

    record: {
      ...record,

      outcomes:
        record.outcomes.map(
          (outcome, index) => ({
            ...outcome,
            status:
              statuses[index],
          }),
        ),
    },
  };
}

describe(
  "theme validation summary",
  () => {
    it(
      "counts every outcome status",
      () => {
        const previews = [
          createPreview(
            "2026-07",
            [
              "successful",
              "unsuccessful",
              "inconclusive",
              "pending",
            ],
          ),

          createPreview(
            "2026-08",
            [
              "unsuccessful",
              "successful",
              "pending",
              "pending",
            ],
          ),
        ];

        const summary =
          buildThemeValidationSummary(
            previews,
          );

        expect(
          summary.periodCount,
        ).toBe(2);

        expect(
          summary.outcomeCount,
        ).toBe(8);

        expect(
          summary.overall,
        ).toEqual({
          successful: 2,
          unsuccessful: 2,
          inconclusive: 1,
          pending: 3,
          completed: 5,
          decisive: 4,
          successRate: 50,
        });
      },
    );

    it(
      "calculates each horizon independently",
      () => {
        const previews = [
          createPreview(
            "2026-07",
            [
              "successful",
              "unsuccessful",
              "inconclusive",
              "pending",
            ],
          ),

          createPreview(
            "2026-08",
            [
              "unsuccessful",
              "successful",
              "pending",
              "pending",
            ],
          ),
        ];

        const summary =
          buildThemeValidationSummary(
            previews,
          );

        expect(
          summary.byHorizon[0],
        ).toEqual({
          horizon: "one-month",
          successful: 1,
          unsuccessful: 1,
          inconclusive: 0,
          pending: 0,
          completed: 2,
          decisive: 2,
          successRate: 50,
        });

        expect(
          summary.byHorizon[2],
        ).toEqual({
          horizon: "six-month",
          successful: 0,
          unsuccessful: 0,
          inconclusive: 1,
          pending: 1,
          completed: 1,
          decisive: 0,
          successRate: null,
        });

        expect(
          summary.byHorizon[3],
        ).toEqual({
          horizon: "twelve-month",
          successful: 0,
          unsuccessful: 0,
          inconclusive: 0,
          pending: 2,
          completed: 0,
          decisive: 0,
          successRate: null,
        });
      },
    );

    it(
      "returns null accuracy when no decisive outcomes exist",
      () => {
        const summary =
          buildThemeValidationSummary([
            createPreview(
              "2026-08",
              [
                "inconclusive",
                "pending",
                "pending",
                "pending",
              ],
            ),
          ]);

        expect(
          summary.overall.completed,
        ).toBe(1);

        expect(
          summary.overall.decisive,
        ).toBe(0);

        expect(
          summary.overall.successRate,
        ).toBeNull();
      },
    );

    it(
      "handles an empty archive",
      () => {
        const summary =
          buildThemeValidationSummary(
            [],
          );

        expect(
          summary.periodCount,
        ).toBe(0);

        expect(
          summary.outcomeCount,
        ).toBe(0);

        expect(
          summary.overall.successRate,
        ).toBeNull();

        expect(
          summary.byHorizon,
        ).toHaveLength(4);
      },
    );
  },
);