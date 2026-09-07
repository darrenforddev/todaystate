import type {
  EconomicFactorTrend,
  EconomicTrendAnalysis,
  EconomicTrendSignal,
} from "@/engine/economicTrendAnalysis";

interface EconomicTrendAnalysisCardProps {
  result: EconomicTrendAnalysis | null;
}

function getOverallStyles(
  signal: "strengthening" | "weakening" | "mixed",
): string {
  if (signal === "strengthening") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
  }

  if (signal === "weakening") {
    return "border-rose-400/30 bg-rose-400/10 text-rose-300";
  }

  return "border-amber-400/30 bg-amber-400/10 text-amber-300";
}

function getSignalStyles(signal: EconomicTrendSignal): string {
  if (signal === "supportive") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
  }

  if (signal === "caution") {
    return "border-rose-400/30 bg-rose-400/10 text-rose-300";
  }

  return "border-amber-400/30 bg-amber-400/10 text-amber-300";
}

function getChangeColour(value: number, factor: EconomicFactorTrend): string {
  if (Math.abs(value) < 0.5) {
    return "text-slate-300";
  }

  const isPositiveMovement = factor.id === "prices" ? value < 0 : value > 0;

  return isPositiveMovement ? "text-emerald-300" : "text-rose-300";
}

function formatChange(value: number): string {
  if (value > 0) {
    return `▲ ${value.toFixed(1)}`;
  }

  if (value < 0) {
    return `▼ ${Math.abs(value).toFixed(1)}`;
  }

  return "● 0.0";
}

export default function EconomicTrendAnalysisCard({
  result,
}: EconomicTrendAnalysisCardProps) {
  if (!result) {
    return (
      <section className="mb-8 rounded-3xl border border-white/10 bg-[#0a1626] p-6">
        <p className="text-sm text-slate-400">
          Trend analysis is unavailable for this reporting period.
        </p>
      </section>
    );
  }

  return (
    <section className="mb-8 rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-6">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
            12-Month Trend Analysis
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            Economic Direction
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {result.startPeriodLabel} to {result.selectedPeriodLabel}
          </p>
        </div>

        <span
          className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] ${getOverallStyles(
            result.overallSignal,
          )}`}
        >
          {result.overallSignal}
        </span>
      </div>

      <p className="mt-5 max-w-4xl text-sm leading-6 text-slate-300">
        {result.summary}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <SummaryBox
          label="Supportive"
          value={result.supportiveFactors}
          colour="text-emerald-300"
        />

        <SummaryBox
          label="Caution"
          value={result.cautionFactors}
          colour="text-rose-300"
        />

        <SummaryBox
          label="Mixed"
          value={result.mixedFactors}
          colour="text-amber-300"
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {result.factors.map((factor) => (
          <article
            key={factor.id}
            className="rounded-2xl border border-white/10 bg-[#091727] p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-white">{factor.label}</h3>

                <p className="mt-1 text-xs text-slate-500">
                  Combined manufacturing and services
                </p>
              </div>

              <span
                className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${getSignalStyles(
                  factor.signal,
                )}`}
              >
                {factor.signal}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Period change
                </p>

                <p
                  className={`mt-2 text-xl font-black ${getChangeColour(
                    factor.twelveMonthChange,
                    factor,
                  )}`}
                >
                  {formatChange(factor.twelveMonthChange)}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {factor.startValue.toFixed(1)} to {factor.endValue.toFixed(1)}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Latest month
                </p>

                <p
                  className={`mt-2 text-xl font-black ${getChangeColour(
                    factor.latestMonthlyChange,
                    factor,
                  )}`}
                >
                  {formatChange(factor.latestMonthlyChange)}
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-400">
              {factor.explanation}
            </p>
          </article>
        ))}
      </div>

      <p className="mt-6 text-xs leading-5 text-slate-500">
        Trend values combine the Manufacturing and Services readings for each
        factor. Prices Paid is treated differently because rising prices
        indicate increasing inflation pressure.
      </p>
    </section>
  );
}

function SummaryBox({
  label,
  value,
  colour,
}: {
  label: string;
  value: number;
  colour: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className={`mt-2 text-3xl font-black ${colour}`}>{value}</p>
    </div>
  );
}
