interface TodaysIntelligenceProps {
  theme: string;
  indicator: string;
  value: number;
  status: string;
}

export default function TodaysIntelligence({
  theme,
  indicator,
  value,
  status,
}: TodaysIntelligenceProps) {
  return (
    <section className="rounded-2xl border border-cyan-900/40 bg-slate-900 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-400">
            Today's Intelligence
          </p>

          <h2 className="mt-2 text-3xl font-bold text-white">{theme}</h2>
        </div>

        <div className="rounded-full bg-green-500/20 px-4 py-2">
          <span className="text-sm font-semibold text-green-400">LIVE</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-400">
            Latest Evidence
          </p>

          <p className="mt-2 text-xl font-semibold text-white">{indicator}</p>

          <p className="mt-1 text-4xl font-bold text-cyan-300">{value}</p>
        </div>

        <div>
          <p className="text-sm uppercase tracking-wide text-slate-400">
            Market State
          </p>

          <p className="mt-2 text-2xl font-bold text-green-400">{status}</p>
        </div>

        <div>
          <p className="text-sm uppercase tracking-wide text-slate-400">
            Last Updated
          </p>

          <p className="mt-2 text-xl font-semibold text-white">Live Session</p>
        </div>
      </div>
    </section>
  );
}
