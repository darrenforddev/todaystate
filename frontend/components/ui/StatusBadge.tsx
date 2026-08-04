type StatusBadgeProps = {
  text: string;
  variant: "positive" | "neutral" | "negative" | "upcoming";
};

export default function StatusBadge({ text, variant }: StatusBadgeProps) {
  const styles = {
    positive: "border border-emerald-400/30 bg-emerald-500/10 text-emerald-300",

    neutral: "border border-slate-400/30 bg-slate-500/10 text-slate-300",

    negative: "border border-rose-400/30 bg-rose-500/10 text-rose-300",

    upcoming: "border border-cyan-400/30 bg-cyan-500/10 text-cyan-300",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${styles[variant]}`}
    >
      {text}
    </span>
  );
}
