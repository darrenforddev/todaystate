export interface ISMServicesRecord {
  reportPeriod: string;

  servicesPMI: number;
  previousServicesPMI: number;

  businessActivity: number;
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

export const ismServicesHistory: ISMServicesRecord[] = [
  {
    reportPeriod: "2026-07",

    servicesPMI: 54.1,
    previousServicesPMI: 54.0,

    businessActivity: 59.1,
    newOrders: 57.2,
    employment: 47.4,
    supplierDeliveries: 52.8,
    inventories: 51.4,
    prices: 70.3,
    backlog: 50.9,
    newExportOrders: 52.0,
    imports: 51.8,

    mbieAssessment:
      "Services activity remained in expansion with strong business activity and new orders, while employment weakened and price pressures increased.",
  },
];