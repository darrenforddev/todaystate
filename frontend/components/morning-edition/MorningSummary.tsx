import { getMarketExplanation } from "@/engine/explainEngine";

export default function MorningSummary() {
  const explanation = getMarketExplanation();

  return (
    <div className="mt-8 space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
          🧠 MBIE DAILY
        </p>

        <h2 className="mt-2 text-3xl font-bold">Today's Story</h2>

        <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-300">
          {explanation.conclusion}
        </p>
      </div>

      <button className="rounded-xl border border-cyan-400/30 px-6 py-3 text-cyan-300 transition hover:bg-cyan-400/10">
        Explore Today's Intelligence →
      </button>
    </div>
  );
}
