import { evidence } from "@/data/evidence";
import IntelligenceBar from "@/components/ui/IntelligenceBar";
import StatusBadge from "@/components/ui/StatusBadge";

export default function LatestEvidence() {
  const latest = [...evidence]
    .sort(
      (a, b) =>
        new Date(b.releasedAt).getTime() - new Date(a.releasedAt).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {latest.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border border-white/5 bg-[#0a1626] p-5"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">{item.title}</h3>

            <span className="text-cyan-300 font-semibold">
              {item.latestValue}
            </span>
          </div>

          <p className="mt-3 text-slate-400">{item.interpretation}</p>

          <div className="mt-5">
            <IntelligenceBar value={item.weight} max={10} label="Importance" />
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <span>Previous: {item.previousValue}</span>

            <StatusBadge
              text={item.trend.charAt(0).toUpperCase() + item.trend.slice(1)}
              variant={
                item.trend === "improving"
                  ? "positive"
                  : item.trend === "weakening"
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
