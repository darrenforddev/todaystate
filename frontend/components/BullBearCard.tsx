import ProgressRing from "./ProgressRing";
import ConfidenceBar from "./ConfidenceBar";

type BullBearCardProps = {
  probability: number;
  marketState: string;
  confidence: string;
  confidenceScore: number;
  risk: string;
  onExplain: () => void;
};

export default function BullBearCard({
  probability,
  marketState,
  confidence,
  confidenceScore,
  risk,
  onExplain,
}: BullBearCardProps) {
  return (
    <article className="rounded-3xl border border-cyan-400/15 bg-[#0a1626] p-7 shadow-2xl shadow-cyan-950/20 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-cyan-500/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
            MARKET BRAIN
          </p>

          <h3 className="mt-3 text-3xl font-extrabold tracking-tight">
            {marketState}
          </h3>
        </div>

        <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
          IMPROVING
        </div>
      </div>
      <div className="mt-10 mb-8 flex justify-center">
        <ProgressRing value={probability} label="Bull Probability" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/[0.03] p-4 text-center">
          <p className="text-xs text-slate-500">Confidence</p>

          <p className="mt-2 text-xl font-bold">{confidence}</p>
        </div>

        <div className="rounded-2xl bg-white/[0.03] p-4 text-center">
          <p className="text-xs text-slate-500">Risk</p>

          <p className="mt-2 text-xl font-bold text-amber-300">{risk}</p>
        </div>
      </div>
      <div className="mt-6">
        <ConfidenceBar value={92} label="Market Confidence" />
      </div>
      <button
        type="button"
        onClick={onExplain}
        className="mt-6 w-full rounded-2xl bg-cyan-400 px-6 py-4 font-black text-slate-950 transition hover:bg-cyan-300"
      >
        🧠 Explain Score
      </button>
    </article>
  );
}
