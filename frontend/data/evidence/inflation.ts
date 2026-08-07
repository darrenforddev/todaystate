export interface InflationRecord {
  reportPeriod: string;

  cpiYearOverYear: number;
  previousCpiYearOverYear: number;
  targetRate: number;

  mbieAssessment: string;
}

export const inflationHistory: InflationRecord[] = [
  {
    reportPeriod: "2026-06",

    cpiYearOverYear: 3.5,
    previousCpiYearOverYear: 4.2,
    targetRate: 2.0,

    mbieAssessment:
      "Inflation eased significantly compared with the previous month, but remains above the 2% reference rate and continues to act as a macroeconomic headwind.",
  },
];