import {
  calculateOutcomeReview,
  isOutcomeDue,
  type OutcomeReviewInput,
  type OutcomeReviewResult,
} from "./outcomeReview";

interface OutcomeReviewTestCase {
  name: string;
  input: OutcomeReviewInput;
  expected: Pick<
    OutcomeReviewResult,
    | "companyReturn"
    | "benchmarkReturn"
    | "relativeReturn"
    | "status"
  >;
}

const baseInput: OutcomeReviewInput = {
  selectionId: "atlas-long-2026-08-09-test",
  decision: "long",
  horizon: "1-month",
  measurementDate: "2026-09-09",
  reviewedAt: "2026-09-09",
  companyEntryPrice: 100,
  companyReviewPrice: 100,
  benchmarkEntryPrice: 100,
  benchmarkReviewPrice: 100,
};

export const outcomeReviewTestCases: OutcomeReviewTestCase[] = [
  {
    name: "Successful long selection",
    input: {
      ...baseInput,
      decision: "long",
      companyReviewPrice: 110,
      benchmarkReviewPrice: 105,
    },
    expected: {
      companyReturn: 10,
      benchmarkReturn: 5,
      relativeReturn: 5,
      status: "successful",
    },
  },
  {
    name: "Unsuccessful long selection",
    input: {
      ...baseInput,
      decision: "long",
      companyReviewPrice: 102,
      benchmarkReviewPrice: 105,
    },
    expected: {
      companyReturn: 2,
      benchmarkReturn: 5,
      relativeReturn: -3,
      status: "unsuccessful",
    },
  },
  {
    name: "Successful short selection",
    input: {
      ...baseInput,
      selectionId: "beacon-short-2026-08-09-test",
      decision: "short",
      companyReviewPrice: 95,
      benchmarkReviewPrice: 102,
    },
    expected: {
      companyReturn: -5,
      benchmarkReturn: 2,
      relativeReturn: 7,
      status: "successful",
    },
  },
  {
    name: "Unsuccessful short selection",
    input: {
      ...baseInput,
      selectionId: "beacon-short-2026-08-09-test",
      decision: "short",
      companyReviewPrice: 108,
      benchmarkReviewPrice: 102,
    },
    expected: {
      companyReturn: 8,
      benchmarkReturn: 2,
      relativeReturn: -6,
      status: "unsuccessful",
    },
  },
  {
    name: "Equal performance has no relative advantage",
    input: {
      ...baseInput,
      companyReviewPrice: 105,
      benchmarkReviewPrice: 105,
    },
    expected: {
      companyReturn: 5,
      benchmarkReturn: 5,
      relativeReturn: 0,
      status: "unsuccessful",
    },
  },
];

function assertEqual<T>(
  actual: T,
  expected: T,
  message: string,
): void {
  if (actual !== expected) {
    throw new Error(
      `${message}: expected ${String(
        expected,
      )}, received ${String(actual)}.`,
    );
  }
}

function assertThrows(
  action: () => void,
  expectedMessage: string,
): void {
  try {
    action();
  } catch (error) {
    const actualMessage =
      error instanceof Error ? error.message : String(error);

    if (!actualMessage.includes(expectedMessage)) {
      throw new Error(
        `Expected error containing "${expectedMessage}", received "${actualMessage}".`,
      );
    }

    return;
  }

  throw new Error(
    `Expected an error containing "${expectedMessage}".`,
  );
}

export function runOutcomeReviewTests(): void {
  for (const testCase of outcomeReviewTestCases) {
    const result = calculateOutcomeReview(
      testCase.input,
    );

    assertEqual(
      result.companyReturn,
      testCase.expected.companyReturn,
      `${testCase.name} company return`,
    );

    assertEqual(
      result.benchmarkReturn,
      testCase.expected.benchmarkReturn,
      `${testCase.name} benchmark return`,
    );

    assertEqual(
      result.relativeReturn,
      testCase.expected.relativeReturn,
      `${testCase.name} relative return`,
    );

    assertEqual(
      result.status,
      testCase.expected.status,
      `${testCase.name} status`,
    );
  }

  assertEqual(
    isOutcomeDue("2026-09-09", "2026-09-08"),
    false,
    "Outcome should not be due before its measurement date",
  );

  assertEqual(
    isOutcomeDue("2026-09-09", "2026-09-09"),
    true,
    "Outcome should be due on its measurement date",
  );

  assertEqual(
    isOutcomeDue("2026-09-09", "2026-09-10"),
    true,
    "Outcome should remain due after its measurement date",
  );

  assertThrows(
    () => {
      calculateOutcomeReview({
        ...baseInput,
        reviewedAt: "2026-09-08",
      });
    },
    "cannot be reviewed before its measurement date",
  );

  assertThrows(
    () => {
      calculateOutcomeReview({
        ...baseInput,
        companyReviewPrice: 0,
      });
    },
    "Company review price must be greater than zero",
  );

  assertThrows(
    () => {
      isOutcomeDue("2026-02-30", "2026-09-09");
    },
    "Measurement date is invalid",
  );
}

export const outcomeReviewTestResults =
  outcomeReviewTestCases.map((testCase) => ({
    name: testCase.name,
    result: calculateOutcomeReview(testCase.input),
  }));

runOutcomeReviewTests();