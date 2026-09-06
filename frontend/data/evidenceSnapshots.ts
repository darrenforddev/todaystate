import {
  buildEvidence,
  type EvidenceSnapshot,
} from "@/engine/evidence";

/**
 * Permanent point-in-time economic evidence archive.
 *
 * This initially runs alongside the existing live evidence array.
 * Existing consumers will not use it until period filtering is ready.
 */
export const evidenceSnapshots: EvidenceSnapshot[] = [
  {
    id: "ism-manufacturing-pmi-2026-07",
    indicatorKey: "ism-manufacturing-pmi",
    reportPeriod: "2026-07",
    observedAt: "2026-08-01",
    evidence: buildEvidence(
      "manufacturing-pmi",
      55.6,
      53.3,
    ),
  },

  {
    id: "ism-services-pmi-2026-07",
    indicatorKey: "ism-services-pmi",
    reportPeriod: "2026-07",
    observedAt: "2026-08-05",
    evidence: buildEvidence(
      "services-pmi",
      54.1,
      54.0,
    ),
  },

  {
    id: "ism-services-employment-2026-07",
    indicatorKey: "ism-services-employment",
    reportPeriod: "2026-07",
    observedAt: "2026-08-05",
    evidence: buildEvidence(
      "services-employment",
      47.4,
      51.2,
    ),
  },

  {
    id: "ism-manufacturing-pmi-2026-08",
    indicatorKey: "ism-manufacturing-pmi",
    reportPeriod: "2026-08",
    observedAt: "2026-09-01",
    evidence: buildEvidence(
      "manufacturing-pmi",
      54.6,
      55.6,
    ),
  },

  {
    id: "ism-services-pmi-2026-08",
    indicatorKey: "ism-services-pmi",
    reportPeriod: "2026-08",
    observedAt: "2026-09-03",
    evidence: buildEvidence(
      "services-pmi",
      55.4,
      54.1,
    ),
  },

  {
    id: "ism-services-employment-2026-08",
    indicatorKey: "ism-services-employment",
    reportPeriod: "2026-08",
    observedAt: "2026-09-03",
    evidence: buildEvidence(
      "services-employment",
      47.8,
      47.4,
    ),
  },
];

export function getAvailableEvidencePeriods(): string[] {
  return Array.from(
    new Set(
      evidenceSnapshots.map(
        (snapshot) => snapshot.reportPeriod,
      ),
    ),
  ).sort();
}

export function getLatestEvidencePeriod(): string | undefined {
  return getAvailableEvidencePeriods().at(-1);
}

export function getEvidenceSnapshotsForPeriod(
  reportPeriod: string,
): EvidenceSnapshot[] {
  return evidenceSnapshots.filter(
    (snapshot) =>
      snapshot.reportPeriod === reportPeriod,
  );
}

export function getLatestEvidenceSnapshots(): EvidenceSnapshot[] {
  const latestPeriod = getLatestEvidencePeriod();

  if (!latestPeriod) {
    return [];
  }

  return getEvidenceSnapshotsForPeriod(latestPeriod);
}