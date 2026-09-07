import type {
  OutcomeHorizon,
  OutcomeStatus,
} from "./types";

import type {
  ThemeValidationPreview,
} from "./themeValidation";

export interface ThemeValidationCounts {
  successful: number;
  unsuccessful: number;
  inconclusive: number;
  pending: number;

  completed: number;
  decisive: number;

  successRate: number | null;
}

export interface ThemeHorizonValidationSummary
  extends ThemeValidationCounts {
  horizon: OutcomeHorizon;
}

export interface ThemeValidationSummary {
  periodCount: number;
  outcomeCount: number;

  overall: ThemeValidationCounts;

  byHorizon:
    ThemeHorizonValidationSummary[];
}

const HORIZONS: OutcomeHorizon[] = [
  "one-month",
  "three-month",
  "six-month",
  "twelve-month",
];

function roundPercentage(
  value: number,
): number {
  return Math.round(value * 100) / 100;
}

function countStatuses(
  statuses: OutcomeStatus[],
): ThemeValidationCounts {
  const successful =
    statuses.filter(
      (status) =>
        status === "successful",
    ).length;

  const unsuccessful =
    statuses.filter(
      (status) =>
        status === "unsuccessful",
    ).length;

  const inconclusive =
    statuses.filter(
      (status) =>
        status === "inconclusive",
    ).length;

  const pending =
    statuses.filter(
      (status) =>
        status === "pending",
    ).length;

  const decisive =
    successful + unsuccessful;

  const completed =
    decisive + inconclusive;

  const successRate =
    decisive === 0
      ? null
      : roundPercentage(
          (successful / decisive) *
            100,
        );

  return {
    successful,
    unsuccessful,
    inconclusive,
    pending,
    completed,
    decisive,
    successRate,
  };
}

export function buildThemeValidationSummary(
  previews: ThemeValidationPreview[],
): ThemeValidationSummary {
  const outcomes =
    previews.flatMap(
      (preview) =>
        preview.record.outcomes,
    );

  const overall =
    countStatuses(
      outcomes.map(
        (outcome) =>
          outcome.status,
      ),
    );

  const byHorizon =
    HORIZONS.map(
      (
        horizon,
      ): ThemeHorizonValidationSummary => {
        const horizonStatuses =
          outcomes
            .filter(
              (outcome) =>
                outcome.horizon ===
                horizon,
            )
            .map(
              (outcome) =>
                outcome.status,
            );

        return {
          horizon,
          ...countStatuses(
            horizonStatuses,
          ),
        };
      },
    );

  return {
    periodCount:
      previews.length,

    outcomeCount:
      outcomes.length,

    overall,
    byHorizon,
  };
}