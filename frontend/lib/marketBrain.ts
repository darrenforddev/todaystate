import type { ConfidenceEvidence } from "../engine/confidence/confidenceEvidence";
import type { MarketResult } from "../types/market";

function findEvidence(
  evidence: ConfidenceEvidence[],
  id: string,
): ConfidenceEvidence | undefined {
  return evidence.find((item) => item.id === id);
}

function applySignal(
  evidence: ConfidenceEvidence | undefined,
  weight: number,
  supportiveDescription: string,
  headwindDescription: string,
  positiveDrivers: string[],
  negativeDrivers: string[],
): number {
  if (evidence?.signal === "supportive") {
    positiveDrivers.push(
      `${supportiveDescription} (+${weight})`,
    );

    return weight;
  }

  if (evidence?.signal === "contradictory") {
    negativeDrivers.push(
      `${headwindDescription} (-${weight})`,
    );

    return -weight;
  }

  return 0;
}

export function calculateMarketState(
  evidence: ConfidenceEvidence[],
): MarketResult {
  let score = 50;

  const positiveDrivers: string[] = [];
  const negativeDrivers: string[] = [];

  const manufacturing = findEvidence(
    evidence,
    "manufacturing-pmi",
  );

  const services = findEvidence(
    evidence,
    "services-pmi",
  );

  const employment = findEvidence(
    evidence,
    "nonfarm-payrolls",
  );

  const inflation = findEvidence(
    evidence,
    "cpi-inflation",
  );

  const housing = findEvidence(
    evidence,
    "building-permits",
  );

  score += applySignal(
    manufacturing,
    12,
    `Manufacturing is expanding at ${manufacturing?.current ?? "--"}`,
    `Manufacturing is contracting at ${manufacturing?.current ?? "--"}`,
    positiveDrivers,
    negativeDrivers,
  );

  score += applySignal(
    services,
    12,
    `Services are expanding at ${services?.current ?? "--"}`,
    `Services are contracting at ${services?.current ?? "--"}`,
    positiveDrivers,
    negativeDrivers,
  );

  score += applySignal(
    employment,
    8,
    "Employment momentum is improving",
    "Employment momentum is weakening",
    positiveDrivers,
    negativeDrivers,
  );

  score += applySignal(
    inflation,
    6,
    "Inflation momentum is easing",
    "Inflation momentum is worsening",
    positiveDrivers,
    negativeDrivers,
  );

  score += applySignal(
    housing,
    8,
    "Housing activity is improving",
    "Housing activity is weakening",
    positiveDrivers,
    negativeDrivers,
  );

  const probability = Math.max(
    0,
    Math.min(100, score),
  );

  const inflationElevated =
    (inflation?.current ?? 0) > 2;

  let marketState = "Neutral Market";

  if (probability >= 65) {
    marketState = "Bull Market";
  } else if (probability <= 35) {
    marketState = "Bear Market";
  }

  const confidenceScore = Math.max(
    0,
    Math.min(
      100,
      60 +
        positiveDrivers.length * 10 -
        negativeDrivers.length * 5,
    ),
  );

  let confidence = "Medium";

  if (confidenceScore >= 80) {
    confidence = "High";
  } else if (confidenceScore < 50) {
    confidence = "Low";
  }

  let risk = "Moderate";

  if (inflationElevated) {
    risk = "Elevated";
  } else if (
    probability >= 75 &&
    negativeDrivers.length === 0
  ) {
    risk = "Low";
  }

  let headline = "Markets Remain Balanced";

  let summary =
    "Economic signals are mixed, leaving the market outlook broadly neutral.";

  if (probability >= 65) {
    headline = "Economic Momentum Remains Supportive";

    summary =
      "Manufacturing and services remain in expansion.";

    if (employment?.signal === "contradictory") {
      summary += " Employment momentum has weakened.";
    }

    if (housing?.signal === "contradictory") {
      summary += " Housing activity remains a headwind.";
    }

    if (inflation?.direction === "improving") {
      summary += " Inflation is easing";
      summary += inflationElevated
        ? " but remains above the 2% target."
        : ".";
    }
  } else if (probability <= 35) {
    headline = "Economic Conditions Are Weakening";

    summary =
      "Several key indicators are weakening, increasing the risk of softer market conditions.";
  } else {
    summary =
      `The evidence is mixed, with ${positiveDrivers.length} supportive ` +
      `signals and ${negativeDrivers.length} headwinds.`;

    if (employment?.signal === "contradictory") {
      summary += " Employment momentum is weakening.";
    }

    if (housing?.signal === "contradictory") {
      summary += " Housing activity is weakening.";
    }

    if (
      inflation?.direction === "improving" &&
      inflationElevated
    ) {
      summary +=
        " Inflation is easing but remains above the 2% target.";
    }
  }

  return {
    probability,
    marketState,
    confidence,
    confidenceScore,
    risk,
    headline,
    summary,
    positiveDrivers,
    negativeDrivers,
  };
}