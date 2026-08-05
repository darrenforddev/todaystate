import type { WorldStateData } from "@/data/worldState";

type WorldStateProps = {
  worldState: WorldStateData;
};

export default function WorldState({ worldState }: WorldStateProps) {
  return (
    <section className="h-full rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
        World State
      </p>

      <div className="mt-5 flex items-center justify-between">
        <h2 className="text-3xl font-black text-white">{worldState.state}</h2>

        <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">
          🟢 Healthy
        </span>
      </div>

      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-400">Confidence</span>

          <span className="font-bold text-white">{worldState.confidence}%</span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-cyan-400 transition-all duration-700"
            style={{ width: `${worldState.confidence}%` }}
          />
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between rounded-2xl bg-white/[0.03] p-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Risk
          </p>

          <p className="mt-1 text-lg font-bold text-white">{worldState.risk}</p>
        </div>

        <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-300">
          🟡 {worldState.risk}
        </span>
      </div>

      <div className="mt-8 rounded-2xl border border-white/5 bg-white/[0.03] p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
          MBIE Assessment
        </p>

        <p className="mt-4 leading-7 text-slate-300">{worldState.assessment}</p>
      </div>
    </section>
  );
}
