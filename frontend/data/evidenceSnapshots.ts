import {
  buildEvidence,
  type EvidenceSnapshot,
} from "@/engine/evidence";

interface MonthlyEvidenceData {
  reportPeriod: string;

  manufacturing: {
    current: number;
    previous: number;
    observedAt: string;
    sourceUrl: string;
  };

  services: {
    current: number;
    previous: number;
    employment: number;
    previousEmployment: number;
    observedAt: string;
    sourceUrl: string;
  };
}

/**
 * Permanent point-in-time economic evidence archive.
 *
 * Current usage scope: private, non-commercial research.
 *
 * Values preserve the figures available from each monthly release.
 * Later revised values can be stored separately with a revised
 * data-vintage marker.
 */
const monthlyEvidenceData: MonthlyEvidenceData[] = [
  {
    reportPeriod: "2025-09",

    manufacturing: {
      current: 49.1,
      previous: 48.7,
      observedAt: "2025-10-01",
      sourceUrl:
        "https://www.prnewswire.com/news-releases/manufacturing-pmi-at-49-1-september-2025-ism-manufacturing-pmi-report-302571530.html",
    },

    services: {
      current: 50.0,
      previous: 52.0,
      employment: 47.2,
      previousEmployment: 46.5,
      observedAt: "2025-10-03",
      sourceUrl:
        "https://www.prnewswire.com/news-releases/services-pmi-at-50-september-2025-ism-services-pmi-report-302574151.html",
    },
  },

  {
    reportPeriod: "2025-10",

    manufacturing: {
      current: 48.7,
      previous: 49.1,
      observedAt: "2025-11-03",
      sourceUrl:
        "https://www.ismworld.org/supply-management-news-and-reports/news-publications/inside-supply-management-magazine/blog/2025/2025-11/ism-pmi-reports-roundup-october-2025-manufacturing/",
    },

    services: {
      current: 52.4,
      previous: 50.0,
      employment: 48.2,
      previousEmployment: 47.2,
      observedAt: "2025-11-05",
      sourceUrl:
        "https://www.prnewswire.com/news-releases/services-pmi-at-52-4-october-2025-ism-services-pmi-report-302604583.html",
    },
  },

  {
    reportPeriod: "2025-11",

    manufacturing: {
      current: 48.2,
      previous: 48.7,
      observedAt: "2025-12-01",
      sourceUrl:
        "https://www.prnewswire.com/news-releases/manufacturing-pmi-at-48-2-november-2025-ism-manufacturing-pmi-report-302626979.html",
    },

    services: {
      current: 52.6,
      previous: 52.4,
      employment: 48.9,
      previousEmployment: 48.2,
      observedAt: "2025-12-03",
      sourceUrl:
        "https://www.prnewswire.com/news-releases/services-pmi-at-52-6-november-2025-ism-services-pmi-report-302630958.html",
    },
  },

  {
    reportPeriod: "2025-12",

    manufacturing: {
      current: 47.9,
      previous: 48.2,
      observedAt: "2026-01-05",
      sourceUrl:
        "https://www.prnewswire.com/news-releases/manufacturing-pmi-at-47-9-december-2025-ism-manufacturing-pmi-report-302649307.html",
    },

    services: {
      current: 54.4,
      previous: 52.6,
      employment: 52.0,
      previousEmployment: 48.9,
      observedAt: "2026-01-07",
      sourceUrl:
        "https://www.prnewswire.com/news-releases/services-pmi-at-54-4-december-2025-ism-services-pmi-report-302654304.html",
    },
  },

  {
    reportPeriod: "2026-01",

    manufacturing: {
      current: 52.6,
      previous: 47.9,
      observedAt: "2026-02-02",
      sourceUrl:
        "https://www.prnewswire.com/news-releases/manufacturing-pmi-at-52-6-january-2026-ism-manufacturing-pmi-report-302675443.html",
    },

    services: {
      current: 53.8,
      previous: 53.8,
      employment: 50.3,
      previousEmployment: 51.7,
      observedAt: "2026-02-04",
      sourceUrl:
        "https://www.prnewswire.com/news-releases/services-pmi-at-53-8-january-2026-ism-services-pmi-report-302678227.html",
    },
  },

  {
    reportPeriod: "2026-02",

    manufacturing: {
      current: 52.4,
      previous: 52.6,
      observedAt: "2026-03-02",
      sourceUrl:
        "https://www.ismworld.org/globalassets/pub/research-and-surveys/rob/pmi/blud202602pmi.pdf",
    },

    services: {
      current: 56.1,
      previous: 53.8,
      employment: 51.8,
      previousEmployment: 50.3,
      observedAt: "2026-03-04",
      sourceUrl:
        "https://www.prnewswire.com/news-releases/services-pmi-at-56-1-february-2026-ism-services-pmi-report-302702978.html",
    },
  },

  {
    reportPeriod: "2026-03",

    manufacturing: {
      current: 52.7,
      previous: 52.4,
      observedAt: "2026-04-01",
      sourceUrl:
        "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/pmi/march/",
    },

    services: {
      current: 54.0,
      previous: 56.1,
      employment: 45.2,
      previousEmployment: 51.8,
      observedAt: "2026-04-06",
      sourceUrl:
        "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/services/march/",
    },
  },

  {
    reportPeriod: "2026-04",

    manufacturing: {
      current: 52.7,
      previous: 52.7,
      observedAt: "2026-05-01",
      sourceUrl:
        "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/pmi/april/",
    },

    services: {
      current: 53.6,
      previous: 54.0,
      employment: 48.0,
      previousEmployment: 45.2,
      observedAt: "2026-05-05",
      sourceUrl:
        "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/services/april/",
    },
  },

  {
    reportPeriod: "2026-05",

    manufacturing: {
      current: 54.0,
      previous: 52.7,
      observedAt: "2026-06-01",
      sourceUrl:
        "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/pmi/may/",
    },

    services: {
      current: 54.5,
      previous: 53.6,
      employment: 47.9,
      previousEmployment: 48.0,
      observedAt: "2026-06-03",
      sourceUrl:
        "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/services/may/",
    },
  },

  {
    reportPeriod: "2026-06",

    manufacturing: {
      current: 53.3,
      previous: 54.0,
      observedAt: "2026-07-01",
      sourceUrl:
        "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/pmi/june/",
    },

    services: {
      current: 54.0,
      previous: 54.5,
      employment: 51.2,
      previousEmployment: 47.9,
      observedAt: "2026-07-06",
      sourceUrl:
        "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/services/june/",
    },
  },

  {
    reportPeriod: "2026-07",

    manufacturing: {
      current: 55.6,
      previous: 53.3,
      observedAt: "2026-08-03",
      sourceUrl:
        "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/pmi/july/",
    },

    services: {
      current: 54.1,
      previous: 54.0,
      employment: 47.4,
      previousEmployment: 51.2,
      observedAt: "2026-08-05",
      sourceUrl:
        "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/services/july/",
    },
  },

  {
    reportPeriod: "2026-08",

    manufacturing: {
      current: 54.6,
      previous: 55.6,
      observedAt: "2026-09-01",
      sourceUrl:
        "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/pmi/august/",
    },

    services: {
      current: 55.4,
      previous: 54.1,
      employment: 47.8,
      previousEmployment: 47.4,
      observedAt: "2026-09-03",
      sourceUrl:
        "https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/services/august/",
    },
  },
];

export const evidenceSnapshots: EvidenceSnapshot[] =
  monthlyEvidenceData.flatMap((month) => [
    {
      id: `ism-manufacturing-pmi-${month.reportPeriod}`,
      indicatorKey: "ism-manufacturing-pmi",
      reportPeriod: month.reportPeriod,
      observedAt: month.manufacturing.observedAt,
      dataVintage: "first-release",
      sourceUrl: month.manufacturing.sourceUrl,
      usageScope: "private-research",
      evidence: buildEvidence(
        "manufacturing-pmi",
        month.manufacturing.current,
        month.manufacturing.previous,
      ),
    },

    {
      id: `ism-services-pmi-${month.reportPeriod}`,
      indicatorKey: "ism-services-pmi",
      reportPeriod: month.reportPeriod,
      observedAt: month.services.observedAt,
      dataVintage: "first-release",
      sourceUrl: month.services.sourceUrl,
      usageScope: "private-research",
      evidence: buildEvidence(
        "services-pmi",
        month.services.current,
        month.services.previous,
      ),
    },

    {
      id: `ism-services-employment-${month.reportPeriod}`,
      indicatorKey: "ism-services-employment",
      reportPeriod: month.reportPeriod,
      observedAt: month.services.observedAt,
      dataVintage: "first-release",
      sourceUrl: month.services.sourceUrl,
      usageScope: "private-research",
      evidence: buildEvidence(
        "services-employment",
        month.services.employment,
        month.services.previousEmployment,
      ),
    },
  ]);

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