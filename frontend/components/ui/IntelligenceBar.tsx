type IntelligenceBarProps = {
  value: number;
  max?: number;
  label?: string;
};

export default function IntelligenceBar({
  value,
  max = 10,
  label,
}: IntelligenceBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  let colour = "bg-red-500";

  if (percentage >= 80) {
    colour = "bg-emerald-400";
  } else if (percentage >= 60) {
    colour = "bg-cyan-400";
  } else if (percentage >= 40) {
    colour = "bg-yellow-400";
  }

  return (
    <div>
      {label && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
          {label}
        </p>
      )}

      <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colour}`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <p className="mt-2 text-sm font-semibold text-white">
        {value}/{max}
      </p>
    </div>
  );
}
