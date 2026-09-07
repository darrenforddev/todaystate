export interface EconomicHistoryPoint {
  period: string;
  month: string;

  manufacturingPmi: number;
  servicesPmi: number;

  manufacturingNewOrders: number;
  servicesNewOrders: number;

  manufacturingOutput: number;
  servicesOutput: number;

  manufacturingEmployment: number;
  servicesEmployment: number;

  manufacturingPrices: number;
  servicesPrices: number;

  manufacturingBacklogs: number;
  servicesBacklogs: number;
}

export const economicHistory: EconomicHistoryPoint[] = [
  {
    period: "2025-09",
    month: "September",

    manufacturingPmi: 49.1,
    servicesPmi: 50.0,

    manufacturingNewOrders: 48.9,
    servicesNewOrders: 50.4,

    manufacturingOutput: 51.0,
    servicesOutput: 49.9,

    manufacturingEmployment: 45.3,
    servicesEmployment: 47.2,

    manufacturingPrices: 61.9,
    servicesPrices: 69.4,

    manufacturingBacklogs: 46.2,
    servicesBacklogs: 47.3,
  },

  {
    period: "2025-10",
    month: "October",

    manufacturingPmi: 48.7,
    servicesPmi: 52.4,

    manufacturingNewOrders: 49.4,
    servicesNewOrders: 56.2,

    manufacturingOutput: 48.2,
    servicesOutput: 54.3,

    manufacturingEmployment: 46.0,
    servicesEmployment: 48.2,

    manufacturingPrices: 58.0,
    servicesPrices: 70.0,

    manufacturingBacklogs: 47.9,
    servicesBacklogs: 40.8,
  },

  {
    period: "2025-11",
    month: "November",

    manufacturingPmi: 48.2,
    servicesPmi: 52.6,

    manufacturingNewOrders: 47.4,
    servicesNewOrders: 52.9,

    manufacturingOutput: 51.4,
    servicesOutput: 54.5,

    manufacturingEmployment: 44.0,
    servicesEmployment: 48.9,

    manufacturingPrices: 58.5,
    servicesPrices: 65.4,

    manufacturingBacklogs: 44.0,
    servicesBacklogs: 49.1,
  },

  {
    period: "2025-12",
    month: "December",

    manufacturingPmi: 47.9,
    servicesPmi: 54.4,

    manufacturingNewOrders: 47.7,
    servicesNewOrders: 57.9,

    manufacturingOutput: 51.0,
    servicesOutput: 56.0,

    manufacturingEmployment: 44.9,
    servicesEmployment: 52.0,

    manufacturingPrices: 58.5,
    servicesPrices: 64.3,

    manufacturingBacklogs: 45.8,
    servicesBacklogs: 42.6,
  },

  {
    period: "2026-01",
    month: "January",

    manufacturingPmi: 52.6,
    servicesPmi: 53.8,

    manufacturingNewOrders: 57.1,
    servicesNewOrders: 53.1,

    manufacturingOutput: 55.9,
    servicesOutput: 57.4,

    manufacturingEmployment: 48.1,
    servicesEmployment: 50.3,

    manufacturingPrices: 59.0,
    servicesPrices: 66.6,

    manufacturingBacklogs: 51.6,
    servicesBacklogs: 44.0,
  },

  {
    period: "2026-02",
    month: "February",

    manufacturingPmi: 52.4,
    servicesPmi: 56.1,

    manufacturingNewOrders: 55.8,
    servicesNewOrders: 58.6,

    manufacturingOutput: 53.5,
    servicesOutput: 59.9,

    manufacturingEmployment: 48.8,
    servicesEmployment: 51.8,

    manufacturingPrices: 70.5,
    servicesPrices: 63.0,

    manufacturingBacklogs: 56.6,
    servicesBacklogs: 55.9,
  },

  {
    period: "2026-03",
    month: "March",

    manufacturingPmi: 52.7,
    servicesPmi: 54.0,

    manufacturingNewOrders: 53.5,
    servicesNewOrders: 60.6,

    manufacturingOutput: 55.1,
    servicesOutput: 53.9,

    manufacturingEmployment: 48.7,
    servicesEmployment: 45.2,

    manufacturingPrices: 78.3,
    servicesPrices: 70.7,

    manufacturingBacklogs: 54.4,
    servicesBacklogs: 53.6,
  },

  {
    period: "2026-04",
    month: "April",

    manufacturingPmi: 52.7,
    servicesPmi: 53.6,

    manufacturingNewOrders: 54.1,
    servicesNewOrders: 53.5,

    manufacturingOutput: 53.4,
    servicesOutput: 55.9,

    manufacturingEmployment: 46.4,
    servicesEmployment: 48.0,

    manufacturingPrices: 84.6,
    servicesPrices: 70.7,

    manufacturingBacklogs: 51.4,
    servicesBacklogs: 53.0,
  },

  {
    period: "2026-05",
    month: "May",

    manufacturingPmi: 54.0,
    servicesPmi: 54.5,

    manufacturingNewOrders: 56.8,
    servicesNewOrders: 57.3,

    manufacturingOutput: 54.3,
    servicesOutput: 57.7,

    manufacturingEmployment: 48.6,
    servicesEmployment: 47.9,

    manufacturingPrices: 82.1,
    servicesPrices: 71.3,

    manufacturingBacklogs: 52.2,
    servicesBacklogs: 51.3,
  },

  {
    period: "2026-06",
    month: "June",

    manufacturingPmi: 53.3,
    servicesPmi: 54.0,

    manufacturingNewOrders: 56.0,
    servicesNewOrders: 55.1,

    manufacturingOutput: 52.2,
    servicesOutput: 55.4,

    manufacturingEmployment: 49.7,
    servicesEmployment: 51.2,

    manufacturingPrices: 73.0,
    servicesPrices: 67.7,

    manufacturingBacklogs: 50.5,
    servicesBacklogs: 54.9,
  },

  {
    period: "2026-07",
    month: "July",

    manufacturingPmi: 55.6,
    servicesPmi: 54.1,

    manufacturingNewOrders: 56.7,
    servicesNewOrders: 57.2,

    manufacturingOutput: 58.5,
    servicesOutput: 59.1,

    manufacturingEmployment: 52.8,
    servicesEmployment: 47.4,

    manufacturingPrices: 71.1,
    servicesPrices: 70.3,

    manufacturingBacklogs: 55.0,
    servicesBacklogs: 50.9,
  },

  {
    period: "2026-08",
    month: "August",

    manufacturingPmi: 54.6,
    servicesPmi: 55.4,

    manufacturingNewOrders: 53.7,
    servicesNewOrders: 60.9,

    manufacturingOutput: 58.3,
    servicesOutput: 61.7,

    manufacturingEmployment: 51.2,
    servicesEmployment: 47.8,

    manufacturingPrices: 71.1,
    servicesPrices: 72.6,

    manufacturingBacklogs: 51.8,
    servicesBacklogs: 55.6,
  },
];

export function getEconomicHistoryPoint(
  period: string,
): EconomicHistoryPoint | undefined {
  return economicHistory.find(
    (point) => point.period === period,
  );
}

export function getEconomicHistoryPeriods(): string[] {
  return economicHistory.map(
    (point) => point.period,
  );
}

export function formatEconomicPeriod(
  period: string,
): string {
  const point = getEconomicHistoryPoint(period);

  if (!point) {
    return period;
  }

  return `${point.month} ${period.slice(0, 4)}`;
}