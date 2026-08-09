import type {
  OutcomeHorizon,
  SelectionDecision,
  SelectionOutcomeRecord,
} from "./types";

export interface ApprovedSelectionInput {
  companyId: string;
  ticker: string;
  companyName: string;

  decision: SelectionDecision;
  selectedAt?: string;
  entryPrice: number;

  todayScore: number;
  qualityScore: number;
  valueScore: number;
  momentumScore: number;

  themeId?: string;
  themeName?: string;
  themeScore?: number;
  themeConfidence?: number;

  benchmarkId: string;
  benchmarkName: string;
  benchmarkEntryPrice: number;

  thesis: string;
  risks: string[];
}

interface HorizonDefinition {
  horizon: OutcomeHorizon;
  months: number;
}

const HORIZON_DEFINITIONS: HorizonDefinition[] = [
  {
    horizon: "one-month",
    months: 1,
  },
  {
    horizon: "three-month",
    months: 3,
  },
  {
    horizon: "six-month",
    months: 6,
  },
  {
    horizon: "twelve-month",
    months: 12,
  },
];

function toDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function parseDateOnly(value: string): Date {
  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error(
      `Invalid selection date: ${value}`,
    );
  }

  return date;
}

function addCalendarMonths(
  dateValue: string,
  months: number,
): string {
  const sourceDate = parseDateOnly(dateValue);
  const sourceDay = sourceDate.getUTCDate();

  /*
   * Move to the first day before changing the month. This
   * prevents dates near the end of a month from overflowing
   * into the following month.
   */
  const targetDate = new Date(
    Date.UTC(
      sourceDate.getUTCFullYear(),
      sourceDate.getUTCMonth() + months,
      1,
    ),
  );

  const finalDayOfTargetMonth = new Date(
    Date.UTC(
      targetDate.getUTCFullYear(),
      targetDate.getUTCMonth() + 1,
      0,
    ),
  ).getUTCDate();

  targetDate.setUTCDate(
    Math.min(sourceDay, finalDayOfTargetMonth),
  );

  return toDateOnly(targetDate);
}

function createSelectionId(
  input: ApprovedSelectionInput,
  selectedAt: string,
): string {
  const ticker = input.ticker
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const uniquePart = crypto.randomUUID().slice(0, 8);

  return [
    ticker || "selection",
    input.decision,
    selectedAt,
    uniquePart,
  ].join("-");
}

function validateInput(
  input: ApprovedSelectionInput,
): void {
  if (!input.companyId.trim()) {
    throw new Error("A company ID is required.");
  }

  if (!input.ticker.trim()) {
    throw new Error("A ticker is required.");
  }

  if (!input.companyName.trim()) {
    throw new Error("A company name is required.");
  }

  if (!input.thesis.trim()) {
    throw new Error("A selection thesis is required.");
  }

  if (
    !Number.isFinite(input.entryPrice) ||
    input.entryPrice <= 0
  ) {
    throw new Error(
      "The company entry price must be greater than zero.",
    );
  }

  if (
    !Number.isFinite(input.benchmarkEntryPrice) ||
    input.benchmarkEntryPrice <= 0
  ) {
    throw new Error(
      "The benchmark entry price must be greater than zero.",
    );
  }
}

export function buildSelectionOutcomeRecord(
  input: ApprovedSelectionInput,
): SelectionOutcomeRecord {
  validateInput(input);

  const selectedAt =
    input.selectedAt ?? toDateOnly(new Date());

  /*
   * Validate an explicitly supplied date before building the
   * snapshot and its future measurement dates.
   */
  parseDateOnly(selectedAt);

  const selectionId = createSelectionId(
    input,
    selectedAt,
  );

  return {
    selection: {
      selectionId,
      companyId: input.companyId.trim(),
      ticker: input.ticker.trim().toUpperCase(),
      companyName: input.companyName.trim(),

      decision: input.decision,
      selectedAt,
      entryPrice: input.entryPrice,

      todayScore: input.todayScore,
      qualityScore: input.qualityScore,
      valueScore: input.valueScore,
      momentumScore: input.momentumScore,

      themeId: input.themeId,
      themeName: input.themeName,
      themeScore: input.themeScore,
      themeConfidence: input.themeConfidence,

      benchmarkId: input.benchmarkId.trim(),
      benchmarkName: input.benchmarkName.trim(),
      benchmarkEntryPrice:
        input.benchmarkEntryPrice,

      thesis: input.thesis.trim(),
      risks: input.risks
        .map((risk) => risk.trim())
        .filter(Boolean),
    },

    outcomes: HORIZON_DEFINITIONS.map(
      ({ horizon, months }) => ({
        horizon,
        measurementDate: addCalendarMonths(
          selectedAt,
          months,
        ),
        status: "pending",
      }),
    ),
  };
}