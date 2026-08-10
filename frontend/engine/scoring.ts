import { relationships } from "./relationships";

type ScoringTarget = "theme" | "company";

interface ScoringSignal {
  strength: number;
  direction: -1 | 0 | 1;
  independenceGroup: string;
}

export interface ConvictionGroup {
  independenceGroup: string;
  strength: number;
  direction: -1 | 0 | 1;
}

export interface RelationshipScoreBreakdown {
  score: number;
  groups: ConvictionGroup[];
  supportiveStrength: number;
  contradictoryStrength: number;
  signedTotal: number;
  totalStrength: number;
  directionalBalance: number;
}

function clampScore(score: number): number {
  return Math.max(
    0,
    Math.min(100, Math.round(score)),
  );
}

function getScoringSignals(
  targetType: ScoringTarget,
  targetId: string,
): ScoringSignal[] {
  return relationships.flatMap((relationship) => {
    if (
      relationship.targetType !== targetType ||
      relationship.targetId !== targetId
    ) {
      return [];
    }

    let direction: -1 | 0 | 1 = 0;

    if (relationship.direction === "supportive") {
      direction = 1;
    } else if (
      relationship.direction === "contradictory"
    ) {
      direction = -1;
    }

    return [
      {
        strength: relationship.strength,
        direction,
        independenceGroup:
          relationship.independenceGroup,
      },
    ];
  });
}

function collapseIndependenceGroups(
  signals: ScoringSignal[],
): ScoringSignal[] {
  const groupedSignals = new Map<
    string,
    ScoringSignal[]
  >();

  for (const signal of signals) {
    const existing =
      groupedSignals.get(
        signal.independenceGroup,
      ) ?? [];

    existing.push(signal);

    groupedSignals.set(
      signal.independenceGroup,
      existing,
    );
  }

  return Array.from(
    groupedSignals.entries(),
  ).map(([independenceGroup, group]) => {
    const signedStrength = group.reduce(
      (total, signal) =>
        total +
        signal.strength * signal.direction,
      0,
    );

    const strongestStrength = Math.max(
      ...group.map(
        (signal) => signal.strength,
      ),
    );

    let direction: -1 | 0 | 1 = 0;

    if (signedStrength > 0) {
      direction = 1;
    } else if (signedStrength < 0) {
      direction = -1;
    }

    return {
      strength: strongestStrength,
      direction,
      independenceGroup,
    };
  });
}

function calculateAgreeingScore(
  signals: ScoringSignal[],
): number {
  const sortedStrengths = signals
    .map((signal) => signal.strength)
    .sort((a, b) => b - a);

  let score = sortedStrengths[0];

  for (const strength of sortedStrengths.slice(1)) {
    const remainingRoom = 100 - score;

    score += remainingRoom * (strength / 100);
  }

  return score;
}

function calculateScoreFromSignals(
  signals: ScoringSignal[],
): number {
  const positiveSignals = signals.filter(
    (signal) => signal.direction === 1,
  );

  const negativeSignals = signals.filter(
    (signal) => signal.direction === -1,
  );

  if (negativeSignals.length === 0) {
    return clampScore(
      calculateAgreeingScore(positiveSignals),
    );
  }

  if (positiveSignals.length === 0) {
    const negativeStrength =
      calculateAgreeingScore(negativeSignals);

    return clampScore(
      100 - negativeStrength,
    );
  }

  const signedTotal = signals.reduce(
    (total, signal) =>
      total +
      signal.strength * signal.direction,
    0,
  );

  const totalStrength = signals.reduce(
    (total, signal) =>
      total + signal.strength,
    0,
  );

  const directionalBalance =
    signedTotal / totalStrength;

  return clampScore(
    50 + directionalBalance * 50,
  );
}

export function getRelationshipScoreBreakdown(
  targetType: ScoringTarget,
  targetId: string,
): RelationshipScoreBreakdown {
  const rawSignals = getScoringSignals(
    targetType,
    targetId,
  ).filter(
    (signal) => signal.direction !== 0,
  );

  if (rawSignals.length === 0) {
    return {
      score: 50,
      groups: [],
      supportiveStrength: 0,
      contradictoryStrength: 0,
      signedTotal: 0,
      totalStrength: 0,
      directionalBalance: 0,
    };
  }

  const signals =
    collapseIndependenceGroups(rawSignals);

  const supportiveStrength = signals
    .filter(
      (signal) => signal.direction === 1,
    )
    .reduce(
      (total, signal) =>
        total + signal.strength,
      0,
    );

  const contradictoryStrength = signals
    .filter(
      (signal) => signal.direction === -1,
    )
    .reduce(
      (total, signal) =>
        total + signal.strength,
      0,
    );

  const signedTotal =
    supportiveStrength -
    contradictoryStrength;

  const totalStrength =
    supportiveStrength +
    contradictoryStrength;

  const directionalBalance =
    totalStrength > 0
      ? signedTotal / totalStrength
      : 0;

  return {
    score: calculateScoreFromSignals(signals),
    groups: signals,
    supportiveStrength,
    contradictoryStrength,
    signedTotal,
    totalStrength,
    directionalBalance,
  };
}

export function calculateRelationshipScore(
  targetType: ScoringTarget,
  targetId: string,
): number {
  return getRelationshipScoreBreakdown(
    targetType,
    targetId,
  ).score;
}

export function calculateThemeScore(
  themeId: string,
): number {
  return calculateRelationshipScore(
    "theme",
    themeId,
  );
}

export function calculateCompanyScore(
  companyId: string,
): number {
  return calculateRelationshipScore(
    "company",
    companyId,
  );
}