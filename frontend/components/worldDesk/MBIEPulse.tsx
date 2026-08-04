export default function MBIEPulse() {
  return (
    <section className="rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
        MBIE Pulse
      </p>

      <h2 className="mt-3 text-2xl font-black text-white">
        Global conditions remain constructive.
      </h2>

      <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-300">
        Manufacturing continues expanding while AI infrastructure, industrial
        recovery and power investment remain supported by improving macro
        evidence. Current indicators suggest the global macro environment
        remains favourable for long-term investment themes, with no significant
        deterioration detected.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300">
          ▲ AI Infrastructure
        </span>

        <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300">
          ▲ Industrial Recovery
        </span>

        <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300">
          Confidence 94%
        </span>

        <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-300">
          Risk: Moderate
        </span>
      </div>

      <div className="mt-8 rounded-2xl border border-white/5 bg-white/[0.03] p-5">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
          Today's Summary
        </p>

        <p className="mt-3 text-slate-300 leading-7">
          MBIE currently identifies <strong>AI Infrastructure</strong>,
          <strong> Industrial Recovery</strong> and <strong>Power Grid</strong>{" "}
          as the strongest structural investment themes. Evidence quality
          remains high and confidence continues to improve as additional macro
          indicators support the current outlook.
        </p>
      </div>
    </section>
  );
}
