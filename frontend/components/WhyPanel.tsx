import type { MarketExplanation } from "@/engine/explainEngine";

interface WhyPanelProps {
  probability: number;
  positiveDrivers: string[];
  negativeDrivers: string[];
  explanation?: MarketExplanation;
}

export default function WhyPanel({
  probability,
  positiveDrivers,
  negativeDrivers,
  explanation,
}: WhyPanelProps) {
  const positives = explanation?.positives.length
    ? explanation.positives
    : positiveDrivers;

  const negatives = explanation?.negatives.length
    ? explanation.negatives
    : negativeDrivers;

  return (
    <section className="mt-6 rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
            MBIE Analysis
          </p>

          <h2 className="mt-3 text-3xl font-black text-white">
            {explanation?.headline ?? "Why this score?"}
          </h2>
        </div>

        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-5 py-3 text-center">
          <p className="text-xs uppercase tracking-widest text-cyan-300">
            Market Brain
          </p>

          <p className="mt-1 text-3xl font-black text-white">{probability}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-emerald-400/10 bg-emerald-500/[0.04] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
            Positive Drivers
          </p>

          <div className="mt-5 space-y-3">
            {positives.length > 0 ? (
              positives.map((driver) => (
                <div
                  key={driver}
                  className="flex items-start gap-3 text-sm leading-6 text-slate-300"
                >
                  <span className="mt-1 text-emerald-300">●</span>
                  <span>{driver}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No positive drivers available.
              </p>
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-amber-400/10 bg-amber-500/[0.04] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">
            Risks and Headwinds
          </p>

          <div className="mt-5 space-y-3">
            {negatives.length > 0 ? (
              negatives.map((driver) => (
                <div
                  key={driver}
                  className="flex items-start gap-3 text-sm leading-6 text-slate-300"
                >
                  <span className="mt-1 text-amber-300">●</span>
                  <span>{driver}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No material headwinds detected.
              </p>
            )}
          </div>
        </article>
      </div>

      <article className="mt-6 rounded-2xl border border-white/5 bg-white/[0.03] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          Overall Assessment
        </p>

        <p className="mt-4 max-w-4xl text-base leading-7 text-slate-300">
          {explanation?.conclusion ??
            "Current market evidence remains broadly supportive."}
        </p>
      </article>
    </section>
  );
}
