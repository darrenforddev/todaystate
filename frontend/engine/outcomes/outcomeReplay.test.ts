import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildOutcomeReplaySeries,
  rebaseOutcomeReplaySeries,
} from "./outcomeReplay";

const prices = [
  {
    date: "2026-01-05",
    timestamp: Date.parse(
      "2026-01-05T00:00:00Z",
    ),
    close: 100,
  },
  {
    date: "2026-01-06",
    timestamp: Date.parse(
      "2026-01-06T00:00:00Z",
    ),
    close: 105,
  },
  {
    date: "2026-01-07",
    timestamp: Date.parse(
      "2026-01-07T00:00:00Z",
    ),
    close: 95,
  },
];

describe("buildOutcomeReplaySeries", () => {
  it("calculates each return from the recorded entry price", () => {
    const result = buildOutcomeReplaySeries({
      prices,
      entryPrice: 100,
      startDate: "2026-01-05",
      endDate: "2026-01-07",
    });

    expect(
      result.map(
        (point) => point.returnFromEntry,
      ),
    ).toEqual([0, 5, -5]);
  });

  it("includes points on both date boundaries", () => {
    const result = buildOutcomeReplaySeries({
      prices,
      entryPrice: 100,
      startDate: "2026-01-06",
      endDate: "2026-01-07",
    });

    expect(
      result.map((point) => point.date),
    ).toEqual([
      "2026-01-06",
      "2026-01-07",
    ]);
  });

  it("sorts points into chronological order", () => {
    const result = buildOutcomeReplaySeries({
      prices: [...prices].reverse(),
      entryPrice: 100,
      startDate: "2026-01-05",
      endDate: "2026-01-07",
    });

    expect(
      result.map((point) => point.date),
    ).toEqual([
      "2026-01-05",
      "2026-01-06",
      "2026-01-07",
    ]);
  });

  it("rounds percentage returns to two decimal places", () => {
    const result = buildOutcomeReplaySeries({
      prices: [
        {
          date: "2026-01-05",
          timestamp: Date.parse(
            "2026-01-05T00:00:00Z",
          ),
          close: 101,
        },
      ],
      entryPrice: 3,
      startDate: "2026-01-05",
      endDate: "2026-01-05",
    });

    expect(
      result[0]?.returnFromEntry,
    ).toBe(3266.67);
  });

  it("rejects a non-positive entry price", () => {
    expect(() =>
      buildOutcomeReplaySeries({
        prices,
        entryPrice: 0,
        startDate: "2026-01-05",
        endDate: "2026-01-07",
      }),
    ).toThrow(
      "Entry price must be greater than zero.",
    );
  });

  it("rejects an end date before the start date", () => {
    expect(() =>
      buildOutcomeReplaySeries({
        prices,
        entryPrice: 100,
        startDate: "2026-01-07",
        endDate: "2026-01-05",
      }),
    ).toThrow(
      "End date must not be before start date.",
    );
  });

  it("rebases a replay series to its first available close", () => {
    const original = buildOutcomeReplaySeries({
      prices,
      entryPrice: 80,
      startDate: "2026-01-05",
      endDate: "2026-01-07",
    });

    const result =
      rebaseOutcomeReplaySeries(original);

    expect(
      result.map(
        (point) => point.returnFromEntry,
      ),
    ).toEqual([0, 5, -5]);
  });

  it("returns an empty rebased series when no prices exist", () => {
    expect(
      rebaseOutcomeReplaySeries([]),
    ).toEqual([]);
  });
});