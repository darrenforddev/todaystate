import { buildEvidence } from "../evidence";
import {
  getLatestISMManufacturing,
  getLatestISMServices,
} from "@/repositories/evidenceRepository";
import type { ConfidenceEvidence } from "./confidenceEvidence";
import { convertToConfidenceEvidence } from "./confidenceEvidenceAdapter";

function getReportPeriodEnd(reportPeriod: string): string {
  const [year, month] = reportPeriod.split("-").map(Number);

  if (!year || !month || month < 1 || month > 12) {
    throw new Error(`Invalid report period: ${reportPeriod}`);
  }

  return new Date(Date.UTC(year, month, 0))
    .toISOString()
    .slice(0, 10);
}

export function getLiveConfidenceEvidence(): ConfidenceEvidence[] {
  const evidence: ConfidenceEvidence[] = [];

  const manufacturing = getLatestISMManufacturing();

  if (manufacturing) {
    evidence.push(
      convertToConfidenceEvidence(
        buildEvidence(
          "manufacturing-pmi",
          manufacturing.manufacturingPMI,
          manufacturing.previousManufacturingPMI
        ),
        {
          name: "ISM Manufacturing PMI",
          source: "ISM",
          sourceType: "primary",
          supportiveImpact: "positive",
          observedAt: getReportPeriodEnd(manufacturing.reportPeriod),
          maxAgeDays: 40,
        }
      )
    );
  }

  const services = getLatestISMServices();

  if (services) {
    evidence.push(
      convertToConfidenceEvidence(
        buildEvidence(
          "services-pmi",
          services.servicesPMI,
          services.previousServicesPMI
        ),
        {
          name: "ISM Services PMI",
          source: "ISM",
          sourceType: "primary",
          supportiveImpact: "positive",
          observedAt: getReportPeriodEnd(services.reportPeriod),
          maxAgeDays: 40,
        }
      )
    );
  }

  return evidence;
}
