export interface HousingRecord {
  reportPeriod: string;
  releasedAt: string;

  buildingPermits: number;
  previousBuildingPermits: number;

  unit: "millions";
  mbieAssessment: string;
}

export const housingHistory: HousingRecord[] = [
  {
    reportPeriod: "2026-06",
    releasedAt: "2026-07-17",

    buildingPermits: 1.367,
    previousBuildingPermits: 1.410,

    unit: "millions",

    mbieAssessment:
      "Building permits fell from 1.410 million to 1.367 million, a 3.0% monthly decline. This indicates softer forward-looking housing activity and is a macroeconomic headwind.",
  },
];