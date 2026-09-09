import type {
  PricePoint,
} from "../todayScore/providers/priceHistory";

export interface OutcomeReplayPoint {
  date: string;
  timestamp: number;
  close: number;
  returnFromEntry: number;
}

export interface BuildOutcomeReplaySeriesInput {
  prices: readonly PricePoint[];
  entryPrice: number;
  startDate: string;
  endDate: string;
}

function assertValidDate(
  value: string,
  fieldName: string,
): void {
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!datePattern.test(value)) {
    throw new Error(
      `${fieldName} must use YYYY-MM-DD format.`,
    );
  }

  const timestamp = Date.parse(
    `${value}T00:00:00Z`,
  );

  if (!Number.isFinite(timestamp)) {
    throw new Error(`${fieldName} is invalid.`);
  }

  const parsedDate = new Date(timestamp)
    .toISOString()
    .slice(0, 10);

  if (parsedDate !== value) {
    throw new Error(`${fieldName} is invalid.`);
  }
}

function assertPositivePrice(
  value: number,
  fieldName: string,
): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(
      `${fieldName} must be greater than zero.`,
    );
  }
}

function roundPercentage(value: number): number {
  return Math.round(value * 100) / 100;
}

export function buildOutcomeReplaySeries({
  prices,
  entryPrice,
  startDate,
  endDate,
}: BuildOutcomeReplaySeriesInput):
  OutcomeReplayPoint[] {
  assertPositivePrice(entryPrice, "Entry price");
  assertValidDate(startDate, "Start date");
  assertValidDate(endDate, "End date");

  const startTimestamp = Date.parse(
    `${startDate}T00:00:00Z`,
  );

  const endTimestamp = Date.parse(
    `${endDate}T00:00:00Z`,
  );

  if (endTimestamp < startTimestamp) {
    throw new Error(
      "End date must not be before start date.",
    );
  }

  return prices
    .filter(
      (point) =>
        Number.isFinite(point.timestamp) &&
        Number.isFinite(point.close) &&
        point.close > 0 &&
        point.timestamp >= startTimestamp &&
        point.timestamp <= endTimestamp,
    )
    .map((point) => ({
      date: point.date,
      timestamp: point.timestamp,
      close: point.close,
      returnFromEntry: roundPercentage(
        ((point.close - entryPrice) /
          entryPrice) *
          100,
      ),
    }))
    .sort(
      (left, right) =>
        left.timestamp - right.timestamp,
    );
}