export interface ISMServicesRecord {
  reportPeriod: string;
  releasedAt: string;

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

  unit: "index";
  mbieAssessment: string;
}

export const ismServicesHistory: ISMServicesRecord[] = [
  {
    reportPeriod: "2026-07",
    releasedAt: "2026-08-05",

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

    unit: "index",

    mbieAssessment:
      "Services remained in expansion in July, with strong business activity and new orders. However, employment returned to contraction at 47.4 and price pressures increased to a highly elevated 70.3, creating important risks beneath the positive headline PMI.",
  },
];