import {
  buildEvidence,
  type EvidenceSnapshot,
} from "@/engine/evidence";

/**
 * Permanent point-in-time economic evidence archive.
 *
 * Current usage scope: private, non-commercial research.
 *
 * Each snapshot preserves what TodayState knew for a particular
 * reporting month. Existing consumers can select a reporting period
 * without changing or overwriting earlier evidence.
 */
export const evidenceSnapshots: EvidenceSnapshot[] = [
  {
    id: "ism-manufacturing-pmi-2026-06",
    indicatorKey: "ism-manufacturing-pmi",
    reportPeriod: "2026-06",
    observedAt: "2026-07-01",
    evidence: buildEvidence(
      "manufacturing-pmi",
      53.3,
      54.0,
    ),
  },
  {
    id: "ism-manufacturing-pmi-2026-05",
    indicatorKey: "ism-manufacturing-pmi",
    reportPeriod: "2026-05",
    observedAt: "2026-06-01",
    evidence: buildEvidence(
      "manufacturing-pmi",
      54.0,
      53.5,
    ),
  },

  {
    id: "ism-services-pmi-2026-05",
    indicatorKey: "ism-services-pmi",
    reportPeriod: "2026-05",
    observedAt: "2026-06-03",
    evidence: buildEvidence(
      "services-pmi",
      54.5,
      53.6,
    ),
  },

  {
    id: "ism-services-employment-2026-05",
    indicatorKey: "ism-services-employment",
    reportPeriod: "2026-05",
    observedAt: "2026-06-03",
    evidence: buildEvidence(
      "services-employment",
      47.9,
      48.0,
    ),
  },
  
  {
    id: "ism-services-pmi-2026-06",
    indicatorKey: "ism-services-pmi",
    reportPeriod: "2026-06",
    observedAt: "2026-07-06",
    evidence: buildEvidence(
      "services-pmi",
      54.0,
      54.5,
    ),
  },

  {
    id: "ism-services-employment-2026-06",
    indicatorKey: "ism-services-employment",
    reportPeriod: "2026-06",
    observedAt: "2026-07-06",
    evidence: buildEvidence(
      "services-employment",
      51.2,
      47.9,
    ),
  },

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