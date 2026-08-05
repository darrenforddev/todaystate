import { ismServicesHistory } from "@/data/evidence/ismServices";
import { ismManufacturingHistory } from "@/data/evidence/ismManufacturing";

export function getISMServicesHistory() {
  return ismServicesHistory;
}

export function getLatestISMServices() {
  return ismServicesHistory.at(-1);
}

export function getISMManufacturingHistory() {
  return ismManufacturingHistory;
}

export function getLatestISMManufacturing() {
  return ismManufacturingHistory.at(-1);
}

export function getManufacturingSummary() {
  const latest = getLatestISMManufacturing();

  if (!latest) return null;

  const change =
    latest.manufacturingPMI -
    latest.previousManufacturingPMI;

  return {
    value: latest.manufacturingPMI,
    previous: latest.previousManufacturingPMI,
    change,
    trend: change > 0 ? "Improving" : change < 0 ? "Weakening" : "Stable",
    status:
      latest.manufacturingPMI >= 50
        ? "Expansion"
        : "Contraction",
    assessment: latest.mbieAssessment,
    reportPeriod: latest.reportPeriod,
  };
}
export function getServicesSummary() {
  const latest = getLatestISMServices();

  if (!latest) return null;

  const change =
    latest.servicesPMI -
    latest.previousServicesPMI;

  return {
    value: latest.servicesPMI,
    previous: latest.previousServicesPMI,
    change,
    trend:
      change > 0
        ? "Improving"
        : change < 0
          ? "Weakening"
          : "Stable",
    status:
      latest.servicesPMI >= 50
        ? "Expansion"
        : "Contraction",
    assessment: latest.mbieAssessment,
    reportPeriod: latest.reportPeriod,
  };
}