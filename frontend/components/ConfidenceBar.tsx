type ConfidenceBarProps = {
  value: number;
  label: string;
};

export default function ConfidenceBar({ value, label }: ConfidenceBarProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">{label}</span>

        <span className="text-sm font-bold text-cyan-300">{value}%</span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
