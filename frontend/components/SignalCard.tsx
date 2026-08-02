type SignalCardProps = {
  name: string;
  value: string;
  change: string;
  positive: boolean;
};

export default function SignalCard({
  name,
  value,
  change,
  positive,
}: SignalCardProps) {
  return (
    <article className="rounded-2xl border border-white/5 bg-[#0a1626] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{name}</p>

          <p className="mt-3 text-3xl font-black">{value}</p>
        </div>

        <span
          className={
            positive
              ? "rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300"
              : "rounded-full bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300"
          }
        >
          {change}
        </span>
      </div>
    </article>
  );
}
