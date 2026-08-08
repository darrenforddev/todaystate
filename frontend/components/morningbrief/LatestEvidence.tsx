import { evidence } from "@/data/evidence";
import StatusBadge from "@/components/ui/StatusBadge";

function formatIndicatorName(indicatorId: string): string {
  return indicatorId
    .replace(/-\w+-\d{4}$/, "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function LatestEvidence() {
  const latest = evidence.slice(0, 5);

  return (
    <div className="grid gap-4">
      {latest.map((item) => (
        <div key={item.indicatorId} className="rounded-2xl bg-white/[0.03] p-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-semibold text-white">
              {formatIndicatorName(item.indicatorId)}
            </h3>

            <span className="font-semibold text-cyan-300">
              {item.current.toFixed(1)}
            </span>
          </div>

          <p className="mt-3 text-slate-400">{item.explanation}</p>

          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <span>Previous: {item.previous.toFixed(1)}</span>

            <StatusBadge
              text={
                item.direction.charAt(0).toUpperCase() + item.direction.slice(1)
              }
              variant={
                item.impact === "positive"
                  ? "positive"
                  : item.impact === "negative"
                    ? "negative"
                    : "neutral"
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}
