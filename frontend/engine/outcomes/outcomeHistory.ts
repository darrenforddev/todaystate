import type {
  HorizonOutcome,
  OutcomeHorizon,
  OutcomeStatus,
  SelectionOutcomeRecord,
} from "./types";

export interface OutcomeHistoryFilters {
  status?: OutcomeStatus;
  decision?: "long" | "short";
  horizon?: OutcomeHorizon;

  minimumTodayScore?: number;
  maximumTodayScore?: number;

  minimumThemeConfidence?: number;
  maximumThemeConfidence?: number;

  themeId?: string;
}

export interface OutcomeHistorySummary {
  total: number;
  successful: number;
  unsuccessful: number;
  inconclusive: number;
  pending: number;
}

function getOutcomeForHorizon(
  record: SelectionOutcomeRecord,
  horizon: OutcomeHorizon,
): HorizonOutcome | undefined {
  return record.outcomes.find(
    (outcome) => outcome.horizon === horizon,
  );
}

export function filterOutcomeHistory(
  records: SelectionOutcomeRecord[],
  filters: OutcomeHistoryFilters = {},
): SelectionOutcomeRecord[] {
  const {
    status,
    decision,
    horizon,
    minimumTodayScore,
    maximumTodayScore,
    minimumThemeConfidence,
    maximumThemeConfidence,
    themeId,
  } = filters;

  return records.filter((record) => {
    const { selection } = record;

    if (
      decision !== undefined &&
      selection.decision !== decision
    ) {
      return false;
    }

    if (
      minimumTodayScore !== undefined &&
      selection.todayScore < minimumTodayScore
    ) {
      return false;
    }

    if (
      maximumTodayScore !== undefined &&
      selection.todayScore > maximumTodayScore
    ) {
      return false;
    }

    if (minimumThemeConfidence !== undefined) {
      if (
        selection.themeConfidence === undefined ||
        selection.themeConfidence <
          minimumThemeConfidence
      ) {
        return false;
      }
    }

    if (maximumThemeConfidence !== undefined) {
      if (
        selection.themeConfidence === undefined ||
        selection.themeConfidence >
          maximumThemeConfidence
      ) {
        return false;
      }
    }

    if (
      themeId !== undefined &&
      selection.themeId !== themeId
    ) {
      return false;
    }

    if (horizon !== undefined) {
      const outcome = getOutcomeForHorizon(
        record,
        horizon,
      );

      if (outcome === undefined) {
        return false;
      }

      if (
        status !== undefined &&
        outcome.status !== status
      ) {
        return false;
      }
    } else if (status !== undefined) {
      const matchesStatus = record.outcomes.some(
        (outcome) => outcome.status === status,
      );

      if (!matchesStatus) {
        return false;
      }
    }

    return true;
  });
}

export function getOutcomeHistorySummary(
  records: SelectionOutcomeRecord[],
  horizon: OutcomeHorizon,
): OutcomeHistorySummary {
  const summary: OutcomeHistorySummary = {
    total: records.length,
    successful: 0,
    unsuccessful: 0,
    inconclusive: 0,
    pending: 0,
  };

  records.forEach((record) => {
    const outcome = getOutcomeForHorizon(
      record,
      horizon,
    );

    if (outcome === undefined) {
      summary.pending += 1;
      return;
    }

    switch (outcome.status) {
      case "successful":
        summary.successful += 1;
        break;

      case "unsuccessful":
        summary.unsuccessful += 1;
        break;

      case "inconclusive":
        summary.inconclusive += 1;
        break;

      case "pending":
        summary.pending += 1;
        break;
    }
  });

  return summary;
}

export function getSuccessRate(
  records: SelectionOutcomeRecord[],
  horizon: OutcomeHorizon,
): number | undefined {
  const summary = getOutcomeHistorySummary(
    records,
    horizon,
  );

  const completed =
    summary.successful + summary.unsuccessful;

  if (completed === 0) {
    return undefined;
  }

  return Math.round(
    (summary.successful / completed) * 100,
  );
}