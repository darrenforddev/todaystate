export interface ISMServicesRecord {
  reportDate: string;

  servicesPMI: number;
  businessActivity: number;
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

export const ismServicesHistory: ISMServicesRecord[] = [
  {
    reportDate: "2026-07",

    servicesPMI: 54.1,
    businessActivity: 59.1,
    newOrders: 57.2,
    employment: 47.4,
    supplierDeliveries: 52.8,
    inventories: 51.4,
    prices: 70.3,
    backlog: 50.9,
    newExportOrders: 52.0,
    imports: 51.8,

    overallAssessment:
      "Expansion continued with strong demand, improving business activity and elevated inflation pressures.",
  },
];