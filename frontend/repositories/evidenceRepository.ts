import { ismServicesHistory } from "@/data/evidence/ismServices";
import { ismManufacturingHistory } from "@/data/evidence/ismManufacturing";

export function getISMServicesHistory() {
  return ismServicesHistory;
}

export function getLatestISMServices() {
  return ismServicesHistory.at(-1);
}

export function getPreviousISMServices() {
  return ismServicesHistory.at(-2);
}

export function getISMManufacturingHistory() {
  return ismManufacturingHistory;
}

export function getLatestISMManufacturing() {
  return ismManufacturingHistory.at(-1);
}

export function getPreviousISMManufacturing() {
  return ismManufacturingHistory.at(-2);
}