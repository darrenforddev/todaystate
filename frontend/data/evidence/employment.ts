export interface EmploymentRecord {
  reportPeriod: string;

  nonfarmPayrolls: number;
  previousNonfarmPayrolls: number;

  mbieAssessment: string;
}

export const employmentHistory: EmploymentRecord[] = [
  {
    reportPeriod: "2026-06",

    nonfarmPayrolls: 57,
    previousNonfarmPayrolls: 129,

    mbieAssessment:
      "Employment remained positive, but payroll growth slowed significantly compared with the previous month.",
  },
];