import type {
  OutcomeHorizon,
  SelectionOutcomeRecord,
} from "@/engine/outcomes/types";

interface OutcomeTimelineProps {
  record: SelectionOutcomeRecord;
}

const horizonLabels: Record<OutcomeHorizon, string> = {
  "one-month": "1M",
  "three-month": "3M",
  "six-month": "6M",
  "twelve-month": "12M",
};

function formatReturn(value?: number): string {
  if (value === undefined) {
    return "Pending";
  }

  return `${value > 0 ? "+" : ""}${value}%`;
}

function getBarHeight(
  relativeReturn: number | undefined,
  maximumReturn: number,
): number {
  if (relativeReturn === undefined || maximumReturn === 0) {
    return 8;
  }

  return Math.max(
    8,
    Math.round((Math.abs(relativeReturn) / maximumReturn) * 112),
  );
}

export default function OutcomeTimeline({ record }: OutcomeTimelineProps) {
  const { selection, outcomes, review } = record;

  const completedReturns = outcomes
    .map((outcome) => outcome.relativeReturn)
    .filter((value): value is number => value !== undefined);

  const maximumReturn = Math.max(
    ...completedReturns.map((value) => Math.abs(value)),
    1,
  );

  return (
    <section className="rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            What happened next?
          </p>

          <h3 className="mt-2 text-xl font-bold text-white">
            {selection.companyName}
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Performance relative to {selection.benchmarkName}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Original TodayScore
          </p>

          <p className="mt-1 text-2xl font-black text-amber-300">
            {selection.todayScore}
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-4 gap-3">
        {outcomes.map((outcome) => {
          const relativeReturn = outcome.relativeReturn;
          const isPositive = relativeReturn !== undefined && relativeReturn > 0;
          const isNegative = relativeReturn !== undefined && relativeReturn < 0;

          const barColour = isPositive
            ? "bg-emerald-400"
            : isNegative
              ? "bg-rose-400"
              : "bg-slate-600";

          return (
            <div
              key={outcome.horizon}
              className="flex min-w-0 flex-col items-center"
            >
              <p
                className={`text-sm font-black ${
                  isPositive
                    ? "text-emerald-300"
                    : isNegative
                      ? "text-rose-300"
                      : "text-slate-400"
                }`}
              >
                {formatReturn(relativeReturn)}
              </p>

              <div className="mt-3 flex h-32 w-full items-end justify-center rounded-xl border border-white/5 bg-white/[0.02] px-3">
                <div
                  className={`w-full max-w-12 rounded-t-lg ${barColour}`}
                  style={{
                    height: `${getBarHeight(relativeReturn, maximumReturn)}px`,
                  }}
                />
              </div>

              <p className="mt-3 text-sm font-bold text-white">
                {horizonLabels[outcome.horizon]}
              </p>

              <p className="mt-1 text-center text-xs capitalize text-slate-500">
                {outcome.status}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Company
          </p>

          <p className="mt-2 text-lg font-bold text-white">
            {formatReturn(outcomes[outcomes.length - 1]?.companyReturn)}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">
            Benchmark
          </p>

          <p className="mt-2 text-lg font-bold text-white">
            {formatReturn(outcomes[outcomes.length - 1]?.benchmarkReturn)}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
          <p className="text-xs uppercase tracking-wider text-emerald-300">
            Relative
          </p>

          <p className="mt-2 text-lg font-bold text-emerald-300">
            {formatReturn(outcomes[outcomes.length - 1]?.relativeReturn)}
          </p>
        </div>
      </div>

      {review && (
        <details className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <summary className="cursor-pointer font-bold text-amber-300">
            Outcome explanation
          </summary>

          <p className="mt-4 text-sm leading-6 text-slate-300">
            {review.actualOutcome}
          </p>

          {review.correctDrivers.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                What worked
              </p>

              <ul className="mt-3 space-y-2">
                {review.correctDrivers.map((driver) => (
                  <li key={driver} className="text-sm leading-6 text-slate-400">
                    • {driver}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {review.failureReasons.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-rose-300">
                Why it failed
              </p>

              <ul className="mt-3 space-y-2">
                {review.failureReasons.map((reason) => (
                  <li key={reason} className="text-sm leading-6 text-slate-400">
                    • {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {review.unexpectedEvents.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-orange-300">
                Unexpected events
              </p>

              <ul className="mt-3 space-y-2">
                {review.unexpectedEvents.map((event) => (
                  <li key={event} className="text-sm leading-6 text-slate-400">
                    • {event}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {review.lessons.length > 0 && (
            <div className="mt-5 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                Lessons learned
              </p>

              <ul className="mt-3 space-y-2">
                {review.lessons.map((lesson) => (
                  <li key={lesson} className="text-sm leading-6 text-slate-300">
                    • {lesson}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </details>
      )}
    </section>
  );
}
