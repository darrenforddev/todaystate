export default function ScoreExplanation() {
  return (
    <section className="mt-8 rounded-3xl border border-white/10 bg-[#0a1626] p-8">
      <h2 className="text-2xl font-bold">Understanding the Scores</h2>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#07111f] p-5">
          <p className="font-bold text-white">Conviction asks:</p>

          <p className="mt-2 leading-7 text-slate-300">
            How strongly does the available evidence support the investment
            theme?
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-400/20 bg-[#07111f] p-5">
          <p className="font-bold text-cyan-300">Confidence asks:</p>

          <p className="mt-2 leading-7 text-slate-300">
            How much should we trust that conclusion given the quality and
            consistency of the evidence?
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-400">
        A theme can have high conviction but lower confidence when the
        directional signal is strong but the evidence is limited, old,
        conflicting, or historically less reliable.
      </p>
    </section>
  );
}
