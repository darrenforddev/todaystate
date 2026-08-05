import { getManufacturingSummary } from "@/repositories/evidenceRepository";
import { getServicesSummary } from "@/repositories/evidenceRepository";

export interface MarketExplanation {
  headline: string;
  positives: string[];
  negatives: string[];
  conclusion: string;
}

export function getMarketExplanation(): MarketExplanation {
  const manufacturing = getManufacturingSummary();
  const services = getServicesSummary();

  const positives: string[] = [];
  const negatives: string[] = [];

  if (manufacturing) {
    if (manufacturing.change > 0) {
      positives.push(
        `Manufacturing PMI improved by ${manufacturing.change.toFixed(1)} points.`
      );
    }

    if (manufacturing.status === "Expansion") {
      positives.push("Manufacturing remains in expansion.");
    }
  }

  if (services) {
    if (services.change > 0) {
      positives.push(
        `Services PMI improved by ${services.change.toFixed(1)} points.`
      );
    }

    if (services.status === "Expansion") {
      positives.push("Services sector remains in expansion.");
    }
  }

  negatives.push("Inflation pressures remain elevated.");

  return {
    headline: "Economic momentum remains supportive.",

    positives,

    negatives,

    conclusion:
      "Current evidence supports continued economic expansion, although inflation remains the principal headwind.",
  };
}