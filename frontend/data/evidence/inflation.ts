export interface InflationRecord {
  reportPeriod: string;
  releasedAt: string;

  cpiYearOverYear: number;
  previousCpiYearOverYear: number;
  targetRate: number;

  unit: "percent";
  mbieAssessment: string;
}

export const inflationHistory: InflationRecord[] = [
  {
    reportPeriod: "2026-06",
    releasedAt: "2026-07-14",

    cpiYearOverYear: 3.5,
    previousCpiYearOverYear: 4.2,
    targetRate: 2.0,

    unit: "percent",

    mbieAssessment:
      "Inflation fell from 4.2% to 3.5%, which reduces price pressure, but it remains 1.5 percentage points above the 2% target.",
  },
];