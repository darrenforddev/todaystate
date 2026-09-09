import type {
  OutcomeExplanation,
  OutcomeHorizon,
} from "@/engine/outcomes/types";

interface OutcomeExplanationCardProps {
  horizon: OutcomeHorizon;
  explanation: OutcomeExplanation;
}

const horizonLabels: Record<OutcomeHorizon, string> = {
  "one-month": "1-month",
  "three-month": "3-month",
  "six-month": "6-month",
  "twelve-month": "12-month",
};

function formatCause(cause: OutcomeExplanation["primaryCause"]): string {
  return cause
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getResultDetails(result: boolean | null): {
  label: string;
  borderClass: string;
  backgroundClass: string;
  textClass: string;
} {
  if (result === true) {
    return {
      label: "Prediction correct",
      borderClass: "border-emerald-400/30",
      backgroundClass: "bg-emerald-400/5",
      textClass: "text-emerald-300",
    };
  }

  if (result === false) {
    return {
      label: "Prediction incorrect",
      borderClass: "border-rose-400/30",
      backgroundClass: "bg-rose-400/5",
      textClass: "text-rose-300",
    };
  }

  return {
    label: "Inconclusive",
    borderClass: "border-amber-400/30",
    backgroundClass: "bg-amber-400/5",
    textClass: "text-amber-300",
  };
}

export default function OutcomeExplanationCard({
  horizon,
  explanation,
}: OutcomeExplanationCardProps) {
  const result = getResultDetails(explanation.predictionWasCorrect);

  const adjustment = explanation.confidenceAdjustment;

  return (
    <details
      className={`rounded-2xl border ${result.borderClass} ${result.backgroundClass} p-5`}
    >
      <summary className="cursor-pointer list-none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              {horizonLabels[horizon]} review
            </p>

            <p className={`mt-1 font-black ${result.textClass}`}>
              {result.label}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Confidence effect
            </p>

            <p
              className={`mt-1 text-lg font-black ${
                adjustment > 0
                  ? "text-emerald-300"
                  : adjustment < 0
                    ? "text-rose-300"
                    : "text-slate-300"
              }`}
            >
              {adjustment > 0 ? "+" : ""}
              {adjustment}
            </p>
          </div>
        </div>
      </summary>

      <div className="mt-5 border-t border-white/10 pt-5">
        <p className="text-sm leading-6 text-slate-300">
          {explanation.summary}
        </p>

        <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/30 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Primary cause
          </p>

          <p className="mt-2 font-bold text-white">
            {formatCause(explanation.primaryCause)}
          </p>
        </div>

        {explanation.supportingFactors.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Supporting evidence
            </p>

            <div className="mt-3 space-y-3">
              {explanation.supportingFactors.map((factor, index) => (
                <div
                  key={`${factor.cause}-${index}`}
                  className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4"
                >
                  <p className="font-bold text-emerald-200">{factor.title}</p>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {factor.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {explanation.contradictoryFactors.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-wider text-rose-300">
              Contradictory evidence
            </p>

            <div className="mt-3 space-y-3">
              {explanation.contradictoryFactors.map((factor, index) => (
                <div
                  key={`${factor.cause}-${index}`}
                  className="rounded-xl border border-rose-400/20 bg-rose-400/5 p-4"
                >
                  <p className="font-bold text-rose-200">{factor.title}</p>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {factor.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {explanation.unexpectedEvents.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-wider text-orange-300">
              Unexpected events
            </p>

            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-400">
              {explanation.unexpectedEvents.map((event, index) => (
                <li key={`${event}-${index}`}>{event}</li>
              ))}
            </ul>
          </div>
        )}

        {explanation.lessons.length > 0 && (
          <div className="mt-5 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Lessons learned
            </p>

            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-300">
              {explanation.lessons.map((lesson, index) => (
                <li key={`${lesson}-${index}`}>{lesson}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-5 text-xs text-slate-500">
          Explanation recorded {explanation.generatedAt}
        </p>
      </div>
    </details>
  );
}
