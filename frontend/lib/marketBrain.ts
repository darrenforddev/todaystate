export type MarketInputs = {
  manufacturingPMI: number;
  servicesPMI: number;
  employmentImproving: boolean;
  inflationElevated: boolean;
};

export type MarketResult = {
  probability: number;
  marketState: string;
  confidence: string;
  risk: string;
  positiveDrivers: string[];
  negativeDrivers: string[];
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

  return {
  probability,
  marketState,
  confidence,
  risk,
  positiveDrivers,
  negativeDrivers,
};
}