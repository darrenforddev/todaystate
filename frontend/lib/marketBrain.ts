import type { MarketResult } from "../types/market";

export type MarketInputs = {
  manufacturingPMI: number;
  servicesPMI: number;
  employmentImproving: boolean;
  inflationElevated: boolean;
};


export function calculateMarketState(
  inputs: MarketInputs,
): MarketResult {
  let score = 50;

const positiveDrivers: string[] = [];
const negativeDrivers: string[] = [];

  if (inputs.manufacturingPMI > 50) {
  score += 12;
  positiveDrivers.push(
    `Manufacturing PMI is expanding at ${inputs.manufacturingPMI} (+12)`,
  );
} else {
  score -= 12;
  negativeDrivers.push(
    `Manufacturing PMI is contracting at ${inputs.manufacturingPMI} (-12)`,
  );
}

  if (inputs.servicesPMI > 50) {
  score += 12;
  positiveDrivers.push(
    `Services PMI is expanding at ${inputs.servicesPMI} (+12)`,
  );
} else {
  score -= 12;
  negativeDrivers.push(
    `Services PMI is contracting at ${inputs.servicesPMI} (-12)`,
  );
}

  if (inputs.employmentImproving) {
  score += 8;
  positiveDrivers.push("Employment conditions are improving (+8)");
} else {
  score -= 8;
  negativeDrivers.push("Employment conditions are weakening (-8)");
}

  if (inputs.inflationElevated) {
  score -= 6;
  negativeDrivers.push("Inflation pressure remains elevated (-6)");
} else {
  score += 6;
  positiveDrivers.push("Inflation pressure is easing (+6)");
}

  const probability = Math.max(0, Math.min(100, score));

  let marketState = "Neutral Market";

  if (probability >= 65) {
    marketState = "Bull Market";
  } else if (probability <= 35) {
    marketState = "Bear Market";
  }
const confidenceScore = Math.min(
  100,
  60 + positiveDrivers.length * 10 - negativeDrivers.length * 5,
);
  let confidence = "Medium";

  if (probability >= 75 || probability <= 25) {
    confidence = "High";
  }

  let risk = "Moderate";

  if (inputs.inflationElevated) {
    risk = "Elevated";
  } else if (probability >= 75) {
    risk = "Low";
  }
let headline = "Markets Remain Balanced";
let summary =
  "Economic signals are mixed, leaving the market outlook broadly neutral.";

if (probability >= 65) {
  headline = "Economic Momentum Remains Supportive";
  summary =
    "Manufacturing and services remain in expansion while employment conditions are improving. Elevated inflation is still the main headwind.";
} else if (probability <= 35) {
  headline = "Economic Conditions Are Weakening";
  summary =
    "Several key indicators are contracting, increasing the risk of weaker market conditions. Defensive positioning may become more important.";
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