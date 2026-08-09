import type {
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
) {
  return record.outcomes.find(
    (outcome) => outcome.horizon === horizon,
  );
}

export function filterOutcomeHistory(
  records: SelectionOutcomeRecord[],
  filters: OutcomeHistoryFilters = {},
): SelectionOutcomeRecord[] {
  return records.filter((record) => {
    const { selection } = record;

    if (
      filters.decision !== undefined &&
      selection.decision !== filters.decision
    ) {
      return false;
    }

    if (
      filters.minimumTodayScore !== undefined &&
      selection.todayScore < filters.minimumTodayScore
    ) {
      return false;
    }

    if (
      filters.maximumTodayScore !== undefined &&
      selection.todayScore > filters.maximumTodayScore
    ) {
      return false;
    }

    if (
      filters.minimumThemeConfidence !== undefined &&
      selection.themeConfidence <
        filters.minimumThemeConfidence
    ) {
      return false;
    }

    if (
      filters.maximumThemeConfidence !== undefined &&
      selection.themeConfidence >
        filters.maximumThemeConfidence
    ) {
      return false;
    }

    if (
      filters.themeId !== undefined &&
      selection.themeId !== filters.themeId
    ) {
      return false;
    }

    if (filters.horizon !== undefined) {
      const outcome = getOutcomeForHorizon(
        record,
        filters.horizon,
      );

      if (!outcome) {
        return false;
      }

      if (
        filters.status !== undefined &&
        outcome.status !== filters.status
      ) {
        return false;
      }
    } else if (filters.status !== undefined) {
      const matchesStatus = record.outcomes.some(
        (outcome) => outcome.status === filters.status,
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
    const outcome = getOutcomeForHorizon(record, horizon);

    if (!outcome) {
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