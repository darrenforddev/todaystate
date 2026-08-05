export interface ISMManufacturingRecord {
  reportDate: string;

  manufacturingPMI: number;
  production: number;
  newOrders: number;
  employment: number;
  supplierDeliveries: number;
  inventories: number;
  prices: number;
  backlog: number;
  newExportOrders: number;
  imports: number;

  overallAssessment: string;
}

export const ismManufacturingHistory: ISMManufacturingRecord[] = [
  {
    reportDate: "2026-07",

    manufacturingPMI: 55.6,
    production: 58.5,
    newOrders: 56.7,
    employment: 52.8,
    supplierDeliveries: 58.9,
    inventories: 51.2,
    prices: 71.1,
    backlog: 55.0,
    newExportOrders: 53.0,
    imports: 55.7,

    overallAssessment:
      "Manufacturing strengthened with improving production and new orders, although price pressures remained elevated.",
  },
];