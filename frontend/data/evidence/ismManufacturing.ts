export interface ISMManufacturingRecord {
  reportPeriod: string;

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

  mbieAssessment: string;
}

export const ismManufacturingHistory: ISMManufacturingRecord[] = [
  {
    reportPeriod: "2026-07",

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

    mbieAssessment:
      "Manufacturing strengthened with improving production and new orders, although price pressures remained elevated.",
  },
];