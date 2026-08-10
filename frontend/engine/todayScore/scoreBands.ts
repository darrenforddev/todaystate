import type { TodayScoreResult } from "./todayScore";

export type TodayScoreBand =
  | "Elite"
  | "Strong"
  | "Neutral"
  | "Weak"
  | "Distressed";

export interface TodayScoreClassification {
  band: TodayScoreBand;
  description: string;
  originalBand: TodayScoreBand;
  safeguardApplied: boolean;
  safeguardReason?: string;
}

const bandOrder: TodayScoreBand[] = [
  "Distressed",
  "Weak",
  "Neutral",
  "Strong",
  "Elite",
];

function getBaseBand(score: number): TodayScoreBand {
  if (score >= 80) return "Elite";
  if (score >= 65) return "Strong";
  if (score >= 45) return "Neutral";
  if (score >= 25) return "Weak";
  return "Distressed";
}

function getBandDescription(band: TodayScoreBand): string {
  const descriptions: Record<TodayScoreBand, string> = {
    Elite:
      "Exceptional combined Quality, Value and Momentum characteristics.",
    Strong:
      "Above-average overall characteristics with no critical pillar weakness.",
    Neutral:
      "Mixed characteristics requiring deeper company and industry analysis.",
    Weak:
      "Below-average characteristics with material weaknesses.",
    Distressed:
      "Severely weak characteristics and elevated investment risk.",
  };

  return descriptions[band];
}

function lowerBand(
  currentBand: TodayScoreBand,
  maximumBand: TodayScoreBand,
): TodayScoreBand {
  const currentIndex = bandOrder.indexOf(currentBand);
  const maximumIndex = bandOrder.indexOf(maximumBand);

  return currentIndex > maximumIndex
    ? maximumBand
    : currentBand;
}

export function classifyTodayScore(
  result: TodayScoreResult,
): TodayScoreClassification {
  const originalBand = getBaseBand(result.score);
  const pillars = [
    result.quality,
    result.value,
    result.momentum,
  ];

  const weakestPillar = Math.min(...pillars);

  let band = originalBand;
  let safeguardReason: string | undefined;

  if (weakestPillar < 20) {
    band = lowerBand(band, "Weak");

    if (band !== originalBand) {
      safeguardReason =
        "Classification capped at Weak because at least one pillar scored below 20.";
    }
  } else if (weakestPillar < 40) {
    band = lowerBand(band, "Neutral");

    if (band !== originalBand) {
      safeguardReason =
        "Classification capped at Neutral because at least one pillar scored below 40.";
    }
  } else if (weakestPillar < 60) {
    band = lowerBand(band, "Strong");

    if (band !== originalBand) {
      safeguardReason =
        "Classification capped at Strong because at least one pillar scored below 60.";
    }
  }

  return {
    band,
    description: getBandDescription(band),
    originalBand,
    safeguardApplied: band !== originalBand,
    safeguardReason,
  };
}