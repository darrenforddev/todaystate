import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildThemeOutcomeRecord,
  type ApprovedThemeSignalInput,
} from "./themeOutcomeBuilder";

import {
  evaluateThemeOutcomeStatus,
  measureThemeOutcome,
} from "./themeOutcomeEvaluator";

const baseInput: ApprovedThemeSignalInput = {
  themeId: "industrial-recovery",
  themeName: "Industrial Recovery",

  reportPeriod: "2026-08",
  signalDate: "2026-09-03",
  marketEntryDate: "2026-09-04",

  direction: "positive",

  conviction: 78,
  confidence: 72,

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

  risks: [
    "Inflation pressure",
    "Weak employment",
  ],

  evidenceIds: [
    "ism-manufacturing-pmi-2026-08",
    "ism-services-pmi-2026-08",
    "ism-services-employment-2026-08",
  ],
};

const positiveRecord =
  buildThemeOutcomeRecord(
    baseInput,
  );

const repeatedPositiveRecord =
  buildThemeOutcomeRecord(
    baseInput,
  );

const negativeRecord =
  buildThemeOutcomeRecord({
    ...baseInput,
    reportPeriod: "2026-07",
    direction: "negative",
  });

const neutralRecord =
  buildThemeOutcomeRecord({
    ...baseInput,
    reportPeriod: "2026-06",
    direction: "neutral",
  });

const successfulPositiveOutcome =
  measureThemeOutcome({
    signal: positiveRecord.signal,
    horizon: "one-month",

    measurementDate:
      positiveRecord.outcomes[0]
        .measurementDate,

    reviewedAt: "2026-10-05",

    instrumentReviewPrice: 110,
    benchmarkReviewPrice: 525,
  });

const unsuccessfulPositiveOutcome =
  measureThemeOutcome({
    signal: positiveRecord.signal,
    horizon: "three-month",

    measurementDate:
      positiveRecord.outcomes[1]
        .measurementDate,

    reviewedAt: "2026-12-04",

    instrumentReviewPrice: 102,
    benchmarkReviewPrice: 550,
  });

const successfulNegativeOutcome =
  measureThemeOutcome({
    signal: negativeRecord.signal,
    horizon: "six-month",

    measurementDate:
      negativeRecord.outcomes[2]
        .measurementDate,

    reviewedAt: "2027-03-04",

    instrumentReviewPrice: 90,
    benchmarkReviewPrice: 510,
  });

const unsuccessfulNegativeOutcome =
  measureThemeOutcome({
    signal: negativeRecord.signal,
    horizon: "twelve-month",

    measurementDate:
      negativeRecord.outcomes[3]
        .measurementDate,

    reviewedAt: "2027-09-06",

    instrumentReviewPrice: 115,
    benchmarkReviewPrice: 525,
  });

const neutralOutcome =
  measureThemeOutcome({
    signal: neutralRecord.signal,
    horizon: "one-month",

    measurementDate:
      neutralRecord.outcomes[0]
        .measurementDate,

    reviewedAt: "2026-10-05",

    instrumentReviewPrice: 105,
    benchmarkReviewPrice: 510,
  });

const pendingOutcome =
  measureThemeOutcome({
    signal: positiveRecord.signal,
    horizon: "twelve-month",

    measurementDate:
      positiveRecord.outcomes[3]
        .measurementDate,
  });

let earlierMarketEntryProtected = false;
let invalidConvictionProtected = false;
let invalidInstrumentPriceProtected = false;

try {
  buildThemeOutcomeRecord({
    ...baseInput,
    marketEntryDate: "2026-09-02",
  });
} catch {
  earlierMarketEntryProtected = true;
}

try {
  buildThemeOutcomeRecord({
    ...baseInput,
    conviction: 101,
  });
} catch {
  invalidConvictionProtected = true;
}

try {
  buildThemeOutcomeRecord({
    ...baseInput,
    instrumentEntryPrice: 0,
  });
} catch {
  invalidInstrumentPriceProtected = true;
}

export interface ThemeOutcomeEngineTestResults {
  deterministicSignalIdPassed: boolean;
  separateDatesPassed: boolean;
  horizonSchedulingPassed: boolean;

  positiveThesisPassed: boolean;
  negativeThesisPassed: boolean;
  neutralThesisPassed: boolean;

  successfulPositivePassed: boolean;
  unsuccessfulPositivePassed: boolean;
  successfulNegativePassed: boolean;
  unsuccessfulNegativePassed: boolean;
  neutralOutcomePassed: boolean;
  pendingOutcomePassed: boolean;

  earlierMarketEntryProtectionPassed: boolean;
  invalidConvictionProtectionPassed: boolean;
  invalidInstrumentPriceProtectionPassed: boolean;

  allPassed: boolean;
}

const deterministicSignalIdPassed =
  positiveRecord.signal.signalId ===
    "industrial-recovery-2026-08-xli" &&
  repeatedPositiveRecord.signal.signalId ===
    positiveRecord.signal.signalId;

const separateDatesPassed =
  positiveRecord.signal.signalDate ===
    "2026-09-03" &&
  positiveRecord.signal.marketEntryDate ===
    "2026-09-04";

const horizonSchedulingPassed =
  positiveRecord.outcomes.length === 4 &&
  positiveRecord.outcomes[0]
    .horizon === "one-month" &&
  positiveRecord.outcomes[0]
    .measurementDate === "2026-10-04" &&
  positiveRecord.outcomes[1]
    .horizon === "three-month" &&
  positiveRecord.outcomes[1]
    .measurementDate === "2026-12-04" &&
  positiveRecord.outcomes[2]
    .horizon === "six-month" &&
  positiveRecord.outcomes[2]
    .measurementDate === "2027-03-04" &&
  positiveRecord.outcomes[3]
    .horizon === "twelve-month" &&
  positiveRecord.outcomes[3]
    .measurementDate === "2027-09-04";

const positiveThesisPassed =
  positiveRecord.signal.thesis ===
  "The positive Industrial Recovery signal expected XLI to outperform SPY.";

const negativeThesisPassed =
  negativeRecord.signal.thesis ===
  "The negative Industrial Recovery signal expected XLI to underperform SPY.";

const neutralThesisPassed =
  neutralRecord.signal.thesis ===
  "The neutral Industrial Recovery signal expected XLI to perform broadly in line with SPY.";

const successfulPositivePassed =
  successfulPositiveOutcome.instrumentReturn ===
    10 &&
  successfulPositiveOutcome.benchmarkReturn ===
    5 &&
  successfulPositiveOutcome.relativeReturn ===
    5 &&
  successfulPositiveOutcome.status ===
    "successful";

const unsuccessfulPositivePassed =
  unsuccessfulPositiveOutcome.instrumentReturn ===
    2 &&
  unsuccessfulPositiveOutcome.benchmarkReturn ===
    10 &&
  unsuccessfulPositiveOutcome.relativeReturn ===
    -8 &&
  unsuccessfulPositiveOutcome.status ===
    "unsuccessful";

const successfulNegativePassed =
  successfulNegativeOutcome.instrumentReturn ===
    -10 &&
  successfulNegativeOutcome.benchmarkReturn ===
    2 &&
  successfulNegativeOutcome.relativeReturn ===
    -12 &&
  successfulNegativeOutcome.status ===
    "successful";

const unsuccessfulNegativePassed =
  unsuccessfulNegativeOutcome.instrumentReturn ===
    15 &&
  unsuccessfulNegativeOutcome.benchmarkReturn ===
    5 &&
  unsuccessfulNegativeOutcome.relativeReturn ===
    10 &&
  unsuccessfulNegativeOutcome.status ===
    "unsuccessful";

const neutralOutcomePassed =
  neutralOutcome.status ===
    "inconclusive";

const pendingOutcomePassed =
  pendingOutcome.status ===
    "pending" &&
  pendingOutcome.instrumentReviewPrice ===
    undefined &&
  pendingOutcome.benchmarkReviewPrice ===
    undefined &&
  pendingOutcome.instrumentReturn ===
    undefined &&
  pendingOutcome.benchmarkReturn ===
    undefined &&
  pendingOutcome.relativeReturn ===
    undefined &&
  pendingOutcome.reviewedAt ===
    undefined;

export const themeOutcomeEngineTestResults:
  ThemeOutcomeEngineTestResults = {
    deterministicSignalIdPassed,
    separateDatesPassed,
    horizonSchedulingPassed,

    positiveThesisPassed,
    negativeThesisPassed,
    neutralThesisPassed,

    successfulPositivePassed,
    unsuccessfulPositivePassed,
    successfulNegativePassed,
    unsuccessfulNegativePassed,
    neutralOutcomePassed,
    pendingOutcomePassed,

    earlierMarketEntryProtectionPassed:
      earlierMarketEntryProtected,

    invalidConvictionProtectionPassed:
      invalidConvictionProtected,

    invalidInstrumentPriceProtectionPassed:
      invalidInstrumentPriceProtected,

    allPassed:
      deterministicSignalIdPassed &&
      separateDatesPassed &&
      horizonSchedulingPassed &&
      positiveThesisPassed &&
      negativeThesisPassed &&
      neutralThesisPassed &&
      successfulPositivePassed &&
      unsuccessfulPositivePassed &&
      successfulNegativePassed &&
      unsuccessfulNegativePassed &&
      neutralOutcomePassed &&
      pendingOutcomePassed &&
      earlierMarketEntryProtected &&
      invalidConvictionProtected &&
      invalidInstrumentPriceProtected,
  };

  describe(
  "theme outcome engine",
  () => {
    it(
      "creates deterministic signal identities",
      () => {
        expect(
          deterministicSignalIdPassed,
        ).toBe(true);
      },
    );

    it(
      "stores signal and market-entry dates separately",
      () => {
        expect(
          separateDatesPassed,
        ).toBe(true);
      },
    );

    it(
      "schedules all four outcome horizons",
      () => {
        expect(
          horizonSchedulingPassed,
        ).toBe(true);
      },
    );

    it(
      "generates directionally correct thesis wording",
      () => {
        expect(
          positiveThesisPassed,
        ).toBe(true);

        expect(
          negativeThesisPassed,
        ).toBe(true);

        expect(
          neutralThesisPassed,
        ).toBe(true);
      },
    );

    it(
      "evaluates positive signals correctly",
      () => {
        expect(
          successfulPositivePassed,
        ).toBe(true);

        expect(
          unsuccessfulPositivePassed,
        ).toBe(true);
      },
    );

    it(
      "evaluates negative signals correctly",
      () => {
        expect(
          successfulNegativePassed,
        ).toBe(true);

        expect(
          unsuccessfulNegativePassed,
        ).toBe(true);
      },
    );

    it(
      "classifies neutral signals as inconclusive",
      () => {
        expect(
          neutralOutcomePassed,
        ).toBe(true);
      },
    );

    it(
      "leaves outcomes pending when prices are unavailable",
      () => {
        expect(
          pendingOutcomePassed,
        ).toBe(true);
      },
    );

    it(
      "rejects invalid signal inputs",
      () => {
        expect(
          earlierMarketEntryProtected,
        ).toBe(true);

        expect(
          invalidConvictionProtected,
        ).toBe(true);

        expect(
          invalidInstrumentPriceProtected,
        ).toBe(true);
      },
    );
    it(
      "applies the theme materiality threshold",
      () => {
        expect(
          evaluateThemeOutcomeStatus(
            "positive",
            1,
          ),
        ).toBe("inconclusive");

        expect(
          evaluateThemeOutcomeStatus(
            "positive",
            -1,
          ),
        ).toBe("inconclusive");

        expect(
          evaluateThemeOutcomeStatus(
            "negative",
            0.3,
          ),
        ).toBe("inconclusive");

        expect(
          evaluateThemeOutcomeStatus(
            "positive",
            1.01,
          ),
        ).toBe("successful");

        expect(
          evaluateThemeOutcomeStatus(
            "positive",
            -1.01,
          ),
        ).toBe("unsuccessful");

        expect(
          evaluateThemeOutcomeStatus(
            "negative",
            -1.01,
          ),
        ).toBe("successful");

        expect(
          evaluateThemeOutcomeStatus(
            "negative",
            1.01,
          ),
        ).toBe("unsuccessful");

        expect(
          evaluateThemeOutcomeStatus(
            "neutral",
            20,
          ),
        ).toBe("inconclusive");

        expect(() =>
          evaluateThemeOutcomeStatus(
            "positive",
            5,
            -1,
          ),
        ).toThrow(
          "The materiality threshold must be zero or greater.",
        );
      },
    );
    it(
      "passes the complete validation suite",
      () => {
        expect(
          themeOutcomeEngineTestResults
            .allPassed,
        ).toBe(true);
      },
    );
  },
);