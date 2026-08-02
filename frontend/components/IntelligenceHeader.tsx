type IntelligenceHeaderProps = {
  title: string;
  score: number;
  confidence: number;
  momentum: string;
  lifecycle: string;
};

export default function IntelligenceHeader({
  title,
  score,
  confidence,
  momentum,
  lifecycle,
}: IntelligenceHeaderProps) {
  return (
    <section className="rounded-3xl border border-cyan-400/10 bg-[#0a1626] p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
        TodayState Intelligence
      </p>

      <div className="mt-4 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-5xl font-black">{title}</h1>

          <div className="mt-3 text-amber-400">★★★★★</div>
        </div>

        <div className="lg:text-right">
          <p className="text-6xl font-black text-cyan-300">{score}</p>

          <p className="mt-2 text-sm uppercase tracking-widest text-slate-500">
            High Conviction
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Momentum
          </p>
          <p className="mt-2 text-lg font-bold text-emerald-300">{momentum}</p>
        </div>

        <div className="rounded-2xl bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Confidence
          </p>
          <p className="mt-2 text-lg font-bold text-cyan-300">{confidence}%</p>
        </div>

        <div className="rounded-2xl bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Lifecycle
          </p>
          <p className="mt-2 text-lg font-bold text-violet-300">{lifecycle}</p>
        </div>
      </div>
    </section>
  );
}
