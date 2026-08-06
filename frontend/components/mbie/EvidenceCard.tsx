interface EvidenceCardProps {
  indicator: string;
  current: number;
  previous: number;
  change: number;
  direction: string;
  status: string;
  impact: string;
  explanation: string;
}

export default function EvidenceCard({
  indicator,
  current,
  previous,
  change,
  direction,
  status,
  impact,
  explanation,
}: EvidenceCardProps) {
  return (
    <div className="rounded-2xl border border-cyan-900/40 bg-slate-900 p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
            Evidence Engine
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">{indicator}</h2>
        </div>

        <div className="rounded-full bg-green-500/20 px-4 py-2 text-sm text-green-400">
          Active
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-slate-400">Current</p>
          <p className="text-2xl font-bold text-white">{current}</p>
        </div>

        <div>
          <p className="text-slate-400">Previous</p>
          <p className="text-2xl font-bold text-white">{previous}</p>
        </div>

        <div>
          <p className="text-slate-400">Change</p>
          <p className="text-xl font-semibold text-cyan-400">
            {change > 0 ? "▲" : change < 0 ? "▼" : "•"} {change}
          </p>
        </div>

        <div>
          <p className="text-slate-400">Direction</p>
          <p className="text-xl font-semibold text-white">{direction}</p>
        </div>

        <div>
          <p className="text-slate-400">Status</p>
          <p className="text-xl font-semibold text-green-400">{status}</p>
        </div>

        <div>
          <p className="text-slate-400">Impact</p>
          <p className="text-xl font-semibold text-cyan-300">{impact}</p>
        </div>
      </div>

      <div className="mt-8 rounded-xl bg-slate-800 p-4">
        <p className="mb-2 text-sm uppercase tracking-wider text-cyan-400">
          Explanation
        </p>

        <p className="leading-relaxed text-slate-300">{explanation}</p>
      </div>
    </div>
  );
}
