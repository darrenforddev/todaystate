import type { PeriodThemeIntelligence } from "@/engine/periodThemeIntelligence";

interface PeriodIntelligenceSummaryProps {
  result: PeriodThemeIntelligence | null;
  periodLabel: string;
}

function getSignalStyles(
  signal: "supportive" | "contradictory" | "neutral",
): string {
  if (signal === "supportive") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
  }

  if (signal === "contradictory") {
    return "border-rose-400/30 bg-rose-400/10 text-rose-300";
  }

  return "border-slate-400/30 bg-slate-400/10 text-slate-300";
}

export default function PeriodIntelligenceSummary({
  result,
  periodLabel,
}: PeriodIntelligenceSummaryProps) {
  if (!result) {
    return (
      <section className="mb-8 rounded-3xl border border-amber-400/20 bg-amber-400/5 p-6">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">
          Monthly Intelligence
        </p>

        <h2 className="mt-2 text-2xl font-black text-white">
          {periodLabel} archive pending
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          The complete source evidence for this reporting month has not yet been
          added to the period-aware MBIE archive.
        </p>
      </section>
    );
  }

  return (
    <section className="mb-8 rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-6">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
            Monthly Intelligence
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            Industrial Recovery
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Evidence assessment for {periodLabel}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="min-w-28 rounded-2xl border border-white/10 bg-[#091727] p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Conviction
            </p>

            <p className="mt-2 text-3xl font-black text-white">
              {result.conviction.score}
            </p>
          </div>

          <div className="min-w-28 rounded-2xl border border-cyan-400/30 bg-cyan-400/5 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Confidence
            </p>

            <p className="mt-2 text-3xl font-black text-cyan-300">
              {result.confidence.confidence}%
            </p>
          </div>
        </div>
      </div>

      <div className="mt-7 space-y-4">
        {result.evidence.map((item) => (
          <article
            key={item.snapshotId}
            className="rounded-2xl border border-white/10 bg-[#091727] p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="font-black text-white">{item.name}</h3>

                <p className="mt-1 text-xs text-slate-500">{item.source}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-400">
                  Strength {item.strength}
                </span>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${getSignalStyles(
                    item.signal,
                  )}`}
                >
                  {item.signal}
                </span>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-300">
              {item.explanation}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
          Confidence Assessment
        </p>

        <p className="mt-3 text-sm leading-6 text-slate-300">
          {result.confidence.explanation}
        </p>
      </div>
    </section>
  );
}
