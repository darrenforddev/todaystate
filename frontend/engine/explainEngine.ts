import type {
  ConfidenceEvidence,
} from "@/engine/confidence/confidenceEvidence";

export interface MarketExplanation {
  headline: string;
  positives: string[];
  negatives: string[];
  conclusion: string;
}

function countSignals(evidenceRecords: ConfidenceEvidence[]) {
  const supportiveCount = evidenceRecords.filter(
    (evidence) => evidence.signal === "supportive",
  ).length;

  const headwindCount = evidenceRecords.filter(
    (evidence) => evidence.signal === "contradictory",
  ).length;

  return {
    supportiveCount,
    headwindCount,
  };
}

function buildHeadline(
  evidenceRecords: ConfidenceEvidence[],
): string {
  const {
    supportiveCount,
    headwindCount,
  } = countSignals(evidenceRecords);

  if (supportiveCount > headwindCount) {
    return "Economic momentum remains supportive overall.";
  }

  if (headwindCount > supportiveCount) {
    return "Economic momentum is facing material headwinds.";
  }

  return "Economic signals are currently balanced.";
}

function buildConclusion(
  evidenceRecords: ConfidenceEvidence[],
): string {
  const {
    supportiveCount,
    headwindCount,
  } = countSignals(evidenceRecords);

  if (supportiveCount > headwindCount) {
    return (
      `Current evidence remains supportive overall, with ` +
      `${supportiveCount} supportive signals against ` +
      `${headwindCount} headwinds. Employment momentum and housing ` +
      `activity require monitoring, while inflation is falling but ` +
      `remains above target.`
    );
  }

  if (headwindCount > supportiveCount) {
    return (
      `Current evidence is tilted towards caution, with ` +
      `${headwindCount} headwinds against ` +
      `${supportiveCount} supportive signals.`
    );
  }

  return (
    `Current evidence is evenly balanced, with ` +
    `${supportiveCount} supportive signals and ` +
    `${headwindCount} headwinds.`
  );
}

export function getMarketExplanation(
  evidenceRecords: ConfidenceEvidence[],
): MarketExplanation {
  const positives = evidenceRecords
    .filter((evidence) => evidence.signal === "supportive")
    .map(
      (evidence) =>
        evidence.explanation ??
        `${evidence.name} is providing a supportive signal.`,
    );

  const negatives = evidenceRecords
    .filter((evidence) => evidence.signal === "contradictory")
    .map(
      (evidence) =>
        evidence.explanation ??
        `${evidence.name} is acting as a macroeconomic headwind.`,
    );

  return {
    headline: buildHeadline(evidenceRecords),
    positives,
    negatives,
    conclusion: buildConclusion(evidenceRecords),
  };
}