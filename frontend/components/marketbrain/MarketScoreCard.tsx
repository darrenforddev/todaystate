import { getMarketBrain } from "@/engine/marketBrain";

export default function MarketScoreCard() {
  const brain = getMarketBrain();

  return (
    <section className="mt-10 rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
        Overall Market
      </p>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-7xl font-black text-white">{brain.score}</h2>

          <p className="mt-2 text-2xl font-semibold text-emerald-300">
            {brain.phase}
          </p>
        </div>

        <div className="rounded-2xl bg-white/[0.03] px-8 py-6">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
            Confidence
          </p>

          <p className="mt-3 text-5xl font-black text-cyan-300">
            {brain.confidence}%
          </p>
        </div>
      </div>
    </section>
  );
}
