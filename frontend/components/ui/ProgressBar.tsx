type ProgressBarProps = {
  value: number;
  colour?: "emerald" | "cyan" | "amber" | "red";
};

export default function ProgressBar({
  value,
  colour = "cyan",
}: ProgressBarProps) {
  const colours = {
    emerald: "bg-emerald-400",
    cyan: "bg-cyan-400",
    amber: "bg-amber-400",
    red: "bg-red-400",
  };

  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className={`h-full rounded-full transition-all duration-700 ${colours[colour]}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
