interface EconomicCardProps {
  title: string;
  value: number;
  change: number;
  status: string;
  reportPeriod: string;
}

export default function EconomicCard({
  title,
  value,
  change,
  status,
  reportPeriod,
}: EconomicCardProps) {
  const improving = change >= 0;

  return (
    <div className="rounded-2xl border border-white/5 bg-[#0a1626] p-5">
      <p className="text-sm text-slate-400">{title}</p>

      <p className="mt-2 text-4xl font-black text-white">{value.toFixed(1)}</p>

      <p
        className={`mt-2 font-semibold ${
          improving ? "text-emerald-300" : "text-red-300"
        }`}
      >
        {improving ? "▲" : "▼"} {change.toFixed(1)}
      </p>

      <p className="mt-3 text-sm text-cyan-300">{status}</p>

      <p className="mt-1 text-xs text-slate-500">{reportPeriod}</p>
    </div>
  );
}
