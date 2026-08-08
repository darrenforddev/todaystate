export interface EmploymentRecord {
  reportPeriod: string;
  releasedAt: string;

  nonfarmPayrolls: number;
  previousNonfarmPayrolls: number;

  unit: "thousands";
  mbieAssessment: string;
}

export const employmentHistory: EmploymentRecord[] = [
  {
    reportPeriod: "2026-06",
    releasedAt: "2026-07-02",

    nonfarmPayrolls: 57,
    previousNonfarmPayrolls: 129,

    unit: "thousands",

    mbieAssessment:
      "Payrolls increased by 57,000, so employment was still growing, but growth slowed sharply from the previous 129,000 gain. This weakening momentum is a macroeconomic headwind.",
  },
];