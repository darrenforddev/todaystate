import type {
  ProviderDatasetResult,
} from "./types";

type JsonRecord =
  Record<string, unknown>;

export interface PricePoint {
  date: string;
  timestamp: number;
  close: number;
}

function asRecord(
  value: unknown,
): JsonRecord | null {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return null;
  }

  return value as JsonRecord;
}

function readString(
  record: JsonRecord,
  key: string,
): string | undefined {
  const value = record[key];

  return typeof value === "string"
    ? value
    : undefined;
}

function readNumber(
  record: JsonRecord,
  key: string,
): number | undefined {
  const value = record[key];

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string" &&
    value.trim() !== ""
  ) {
    const parsed = Number(value);

    return Number.isFinite(parsed)
      ? parsed
      : undefined;
  }

  return undefined;
}

export function parsePricePoints(
  result:
    | ProviderDatasetResult
    | undefined,
): PricePoint[] {
  if (
    !result ||
    result.status !== "available"
  ) {
    return [];
  }

  const payload =
    asRecord(result.payload);

  if (!payload) {
    return [];
  }

  const values = payload.values;

  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .flatMap((value) => {
      const record = asRecord(value);

      if (!record) {
        return [];
      }

      const date =
        readString(
          record,
          "datetime",
        );

      const close =
        readNumber(
          record,
          "close",
        );

      const timestamp =
        date
          ? Date.parse(
              `${date}T00:00:00Z`,
            )
          : Number.NaN;

      return (
        date &&
        close !== undefined &&
        close > 0 &&
        Number.isFinite(timestamp)
      )
        ? [
            {
              date,
              timestamp,
              close,
            },
          ]
        : [];
    })
    .sort(
      (left, right) =>
        left.timestamp -
        right.timestamp,
    );
}

export function pointAtOrBefore(
  points: readonly PricePoint[],
  targetDate: string,
): PricePoint | undefined {
  const target = Date.parse(
    `${targetDate}T00:00:00Z`,
  );

  if (!Number.isFinite(target)) {
    throw new Error(
      `Invalid target date: ${targetDate}`,
    );
  }

  for (
    let index = points.length - 1;
    index >= 0;
    index -= 1
  ) {
    const point = points[index];

    if (
      point &&
      point.timestamp <= target
    ) {
      return point;
    }
  }

  return undefined;
}

export function pointAtOrAfter(
  points: readonly PricePoint[],
  targetDate: string,
): PricePoint | undefined {
  const target = Date.parse(
    `${targetDate}T00:00:00Z`,
  );

  if (!Number.isFinite(target)) {
    throw new Error(
      `Invalid target date: ${targetDate}`,
    );
  }

  return points.find(
    (point) =>
      point.timestamp >= target,
  );
}