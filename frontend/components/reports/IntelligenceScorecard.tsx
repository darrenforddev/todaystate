type ThemeScorecardProps = {
  score: number;
  confidence: number;
  momentum: string;
  lifecycle: string;
  risk: string;
};

export default function IntelligenceScorecard({
  score,
  confidence,
  momentum,
  lifecycle,
  risk,
}: ThemeScorecardProps) {
  return (
    <section className="mt-8 rounded-3xl border border-cyan-400/20 bg-[#081322] p-6">
      <div className="grid gap-6 sm:grid-cols-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Score
          </p>
          <p className="mt-2 text-4xl font-black text-cyan-300">{score}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Confidence
          </p>
          <p className="mt-2 text-xl font-bold">{confidence}%</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Momentum
          </p>
          <p className="mt-2 font-semibold text-emerald-300">{momentum}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Lifecycle
          </p>
          <p className="mt-2 font-semibold text-cyan-300">{lifecycle}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Risk
          </p>
          <p className="mt-2 font-semibold text-amber-300">{risk}</p>
        </div>
      </div>
    </section>
  );
}
