export interface ISMManufacturingRecord {
  reportPeriod: string;
  releasedAt: string;

  manufacturingPMI: number;
  previousManufacturingPMI: number;

  production: number;
  newOrders: number;
  employment: number;
  supplierDeliveries: number;
  inventories: number;
  prices: number;
  backlog: number;
  newExportOrders: number;
  imports: number;

  unit: "index";
  mbieAssessment: string;
}

export const ismManufacturingHistory: ISMManufacturingRecord[] = [
  {
    reportPeriod: "2026-07",
    releasedAt: "2026-08-03",

    manufacturingPMI: 55.6,
    previousManufacturingPMI: 53.3,

    production: 58.5,
    newOrders: 56.7,
    employment: 52.8,
    supplierDeliveries: 58.9,
    inventories: 51.2,
    prices: 71.1,
    backlog: 55.0,
    newExportOrders: 53.0,
    imports: 55.7,

    unit: "index",

    mbieAssessment:
      "Manufacturing strengthened materially in July. The PMI rose from 53.3 to 55.6, with production, new orders and employment all in expansion. Price pressures remain a significant risk, with the Prices Index elevated at 71.1.",
  },
];