export interface HousingRecord {
  reportPeriod: string;

  buildingPermits: number;
  previousBuildingPermits: number;

  mbieAssessment: string;
}

export const housingHistory: HousingRecord[] = [
  {
    reportPeriod: "2026-06",

    buildingPermits: 1.367,
    previousBuildingPermits: 1.410,

    mbieAssessment:
      "Building permits declined compared with the previous month, indicating softer forward-looking housing activity and acting as a macroeconomic headwind.",
  },
];