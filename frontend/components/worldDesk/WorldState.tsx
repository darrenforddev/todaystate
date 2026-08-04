export default function WorldState() {
  return (
    <section className="h-full rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
        World State
      </p>

      <div className="mt-5 flex items-center justify-between">
        <h2 className="text-3xl font-black text-white">Expansion</h2>

        <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">
          🟢 Healthy
        </span>
      </div>

      {/* Confidence */}
      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-400">Confidence</span>

          <span className="font-bold text-white">94%</span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-[94%] rounded-full bg-cyan-400" />
        </div>
      </div>

      {/* Risk */}
      <div className="mt-8 flex items-center justify-between rounded-2xl bg-white/[0.03] p-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Risk
          </p>

          <p className="mt-1 text-lg font-bold text-white">Moderate</p>
        </div>

        <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-300">
          🟡 Moderate
        </span>
      </div>

      {/* MBIE Assessment */}
      <div className="mt-8 rounded-2xl border border-white/5 bg-white/[0.03] p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
          MBIE Assessment
        </p>

        <p className="mt-4 leading-7 text-slate-300">
          Global macro conditions remain supportive for structural growth.
          Manufacturing continues expanding, AI infrastructure investment
          remains strong and electricity demand continues supporting long-term
          power grid themes.
        </p>
      </div>

      <div className="mt-8 flex items-center justify-between text-sm text-slate-500">
        <span>Last Updated</span>

        <span>20:15 BST</span>
      </div>
    </section>
  );
}
