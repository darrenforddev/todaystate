import type {
  BalancedPortfolioSelection,
  PortfolioCandidate,
} from "./portfolio";

export type PortfolioReadinessStatus =
  | "not-ready"
  | "limited"
  | "research-ready";

export interface PortfolioExposure {
  name: string;
  longCount: number;
  shortCount: number;
  grossCount: number;
  netCount: number;
  shareOfPositions: number;
}

export interface PortfolioRiskAuditOptions {
  minimumPairs?: number;
  maximumGroupShare?: number;
}

export interface PortfolioRiskAudit {
  status: PortfolioReadinessStatus;
  pairCount: number;
  positionCount: number;
  sectorExposure: PortfolioExposure[];
  themeExposure: PortfolioExposure[];
  warnings: string[];
  strengths: string[];
  methodology: string;
}

function normaliseMinimumPairs(
  minimumPairs: number | undefined,
): number {
  if (
    minimumPairs === undefined ||
    !Number.isFinite(minimumPairs)
  ) {
    return 3;
  }

  return Math.max(1, Math.floor(minimumPairs));
}

function normaliseMaximumGroupShare(
  maximumGroupShare: number | undefined,
): number {
  if (
    maximumGroupShare === undefined ||
    !Number.isFinite(maximumGroupShare)
  ) {
    return 0.5;
  }

  return Math.max(
    0,
    Math.min(1, maximumGroupShare),
  );
}

function buildExposure(
  longCandidates: PortfolioCandidate[],
  shortCandidates: PortfolioCandidate[],
  getGroupName: (
    candidate: PortfolioCandidate,
  ) => string,
): PortfolioExposure[] {
  const exposureMap = new Map<
    string,
    {
      longCount: number;
      shortCount: number;
    }
  >();

  function addCandidates(
    candidates: PortfolioCandidate[],
    side: "long" | "short",
  ) {
    for (const candidate of candidates) {
      const groupName =
        getGroupName(candidate).trim() || "Unclassified";

      const current = exposureMap.get(groupName) ?? {
        longCount: 0,
        shortCount: 0,
      };

      current[
        side === "long"
          ? "longCount"
          : "shortCount"
      ] += 1;

      exposureMap.set(groupName, current);
    }
  }

  addCandidates(longCandidates, "long");
  addCandidates(shortCandidates, "short");

  const positionCount =
    longCandidates.length + shortCandidates.length;

  return [...exposureMap.entries()]
    .map(([name, counts]) => {
      const grossCount =
        counts.longCount + counts.shortCount;

      return {
        name,
        longCount: counts.longCount,
        shortCount: counts.shortCount,
        grossCount,
        netCount:
          counts.longCount - counts.shortCount,
        shareOfPositions:
          positionCount === 0
            ? 0
            : Math.round(
                (grossCount / positionCount) * 100,
              ),
      };
    })
    .sort(
      (first, second) =>
        second.grossCount - first.grossCount ||
        first.name.localeCompare(second.name),
    );
}

function addExposureWarnings(
  label: "Sector" | "Theme",
  exposures: PortfolioExposure[],
  pairCount: number,
  positionCount: number,
  maximumGroupShare: number,
  warnings: string[],
): void {
  if (pairCount === 0 || positionCount === 0) {
    return;
  }

  for (const exposure of exposures) {
    const grossShare =
      exposure.grossCount / positionCount;

    if (grossShare > maximumGroupShare) {
      warnings.push(
        `${label} concentration: ${exposure.name} represents ${Math.round(
          grossShare * 100,
        )}% of selected positions.`,
      );
    }

    const directionalShare =
      Math.abs(exposure.netCount) / pairCount;

    if (directionalShare > maximumGroupShare) {
      const direction =
        exposure.netCount > 0 ? "Long" : "Short";

      warnings.push(
        `${label} imbalance: ${exposure.name} has a net ${direction} exposure of ${Math.abs(
          exposure.netCount,
        )} position${
          Math.abs(exposure.netCount) === 1
            ? ""
            : "s"
        }.`,
      );
    }
  }
}

export function auditPortfolioSelection(
  selection: BalancedPortfolioSelection,
  options: PortfolioRiskAuditOptions = {},
): PortfolioRiskAudit {
  const minimumPairs = normaliseMinimumPairs(
    options.minimumPairs,
  );

  const maximumGroupShare =
    normaliseMaximumGroupShare(
      options.maximumGroupShare,
    );

  const pairCount = selection.pairCount;

  const positionCount =
    selection.longCandidates.length +
    selection.shortCandidates.length;

  const sectorExposure = buildExposure(
    selection.longCandidates,
    selection.shortCandidates,
    (candidate) => candidate.company.sector,
  );

  const themeExposure = buildExposure(
    selection.longCandidates,
    selection.shortCandidates,
    (candidate) => candidate.company.themeName,
  );

  const warnings: string[] = [];
  const strengths: string[] = [];

  if (pairCount === 0) {
    warnings.push(
      "No balanced Long/Short selection is available for risk review.",
    );
  } else {
    strengths.push(
      "The selected Long and Short sides contain equal position counts.",
    );
  }

  if (pairCount > 0 && pairCount < minimumPairs) {
    warnings.push(
      `Only ${pairCount} balanced pair${
        pairCount === 1 ? " is" : "s are"
      } available. At least ${minimumPairs} are required for the configured research-diversification check.`,
    );
  }

  if (pairCount >= minimumPairs) {
    addExposureWarnings(
      "Sector",
      sectorExposure,
      pairCount,
      positionCount,
      maximumGroupShare,
      warnings,
    );

    addExposureWarnings(
      "Theme",
      themeExposure,
      pairCount,
      positionCount,
      maximumGroupShare,
      warnings,
    );

    if (warnings.length === 0) {
      strengths.push(
        "No monitored sector or theme exceeds the configured concentration limit.",
      );
    }
  }

  const status: PortfolioReadinessStatus =
    pairCount === 0
      ? "not-ready"
      : warnings.length > 0
        ? "limited"
        : "research-ready";

  return {
    status,
    pairCount,
    positionCount,
    sectorExposure,
    themeExposure,
    warnings,
    strengths,
    methodology:
      "This readiness audit uses position counts only. It does not measure invested capital, beta, volatility, correlation, liquidity, transaction costs or Short borrow availability.",
  };
}