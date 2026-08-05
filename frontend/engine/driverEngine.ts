import {
  getManufacturingSummary,
  getServicesSummary,
} from "@/repositories/evidenceRepository";

export interface Driver {
  name: string;
  score: number;
  width: string;
  positive: boolean;
}

export function getDrivers(): Driver[] {
  const manufacturing = getManufacturingSummary();
  const services = getServicesSummary();

  const drivers: Driver[] = [];

  if (manufacturing) {
    const score = Math.round(manufacturing.value * 1.5);

    drivers.push({
      name: "Manufacturing",
      score,
      width: `${Math.min(score, 100)}%`,
      positive: manufacturing.change >= 0,
    });
  }

  if (services) {
    const score = Math.round(services.value * 1.5);

    drivers.push({
      name: "Services",
      score,
      width: `${Math.min(score, 100)}%`,
      positive: services.change >= 0,
    });
  }

  drivers.push({
    name: "Employment",
    score: 52,
    width: "52%",
    positive: true,
  });

  drivers.push({
    name: "Inflation",
    score: 35,
    width: "35%",
    positive: false,
  });

  return drivers;
}