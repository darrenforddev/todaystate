interface ThemeCardProps {
  name: string;
  description: string;
  strength: number;
}

export default function ThemeCard({
  name,
  description,
  strength,
}: ThemeCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
            Theme Engine
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">{name}</h2>
        </div>

        <div className="rounded-full bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-300">
          Active
        </div>
      </div>

      <div className="mb-6">
        <p className="text-slate-300 leading-relaxed">{description}</p>
      </div>

      <div className="rounded-xl bg-slate-800 p-4">
        <p className="text-sm uppercase tracking-wider text-slate-400">
          Relationship Strength
        </p>

        <p className="mt-2 text-3xl font-bold text-green-400">
          {(strength * 100).toFixed(0)}%
        </p>
      </div>
    </div>
  );
}
