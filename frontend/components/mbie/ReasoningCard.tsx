interface ReasoningCardProps {
  indicator: string;
  status: string;
  theme: string;
  strength: number;
}

export default function ReasoningCard({
  indicator,
  status,
  theme,
  strength,
}: ReasoningCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
          Reasoning Engine
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">MBIE Thinking</h2>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg bg-slate-800 p-4">
          <p className="text-sm text-slate-400">Indicator</p>
          <p className="text-lg font-semibold text-white">{indicator}</p>
        </div>

        <div className="flex justify-center text-2xl text-cyan-400">↓</div>

        <div className="rounded-lg bg-slate-800 p-4">
          <p className="text-sm text-slate-400">Evidence</p>
          <p className="text-lg font-semibold text-green-400">{status}</p>
        </div>

        <div className="flex justify-center text-2xl text-cyan-400">↓</div>

        <div className="rounded-lg bg-slate-800 p-4">
          <p className="text-sm text-slate-400">Theme</p>
          <p className="text-lg font-semibold text-white">{theme}</p>
        </div>

        <div className="flex justify-center text-2xl text-cyan-400">↓</div>

        <div className="rounded-lg bg-slate-800 p-4">
          <p className="text-sm text-slate-400">Relationship Strength</p>

          <p className="text-3xl font-bold text-green-400">
            {(strength * 100).toFixed(0)}%
          </p>
        </div>
      </div>
    </div>
  );
}
