import type { ThemeIntelligence } from "@/engine/theme";

interface EvidenceAssessmentProps {
  theme: ThemeIntelligence;
}

type EvidenceDirection = "supportive" | "contradictory" | "neutral";

function getDirectionBadgeStyles(direction: EvidenceDirection): string {
  if (direction === "supportive") {
    return [
      "border-emerald-400/30",
      "bg-emerald-400/10",
      "text-emerald-300",
    ].join(" ");
  }

  if (direction === "contradictory") {
    return ["border-rose-400/30", "bg-rose-400/10", "text-rose-300"].join(" ");
  }

  return ["border-slate-400/30", "bg-slate-400/10", "text-slate-300"].join(" ");
}

function formatDirection(direction: EvidenceDirection): string {
  return direction.charAt(0).toUpperCase() + direction.slice(1);
}

export default function EvidenceAssessment({ theme }: EvidenceAssessmentProps) {
  return (
    <section className="mt-8 rounded-3xl border border-white/10 bg-[#0a1626] p-8">
      <h2 className="text-2xl font-bold">Evidence Assessment</h2>

      <p className="mt-2 text-slate-400">
        Evidence is classified by whether it supports or contradicts the current
        theme.
      </p>

      <div className="mt-6 space-y-4">
        {theme.evidence.length > 0 ? (
          theme.evidence.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/10 bg-[#07111f] p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-white">{item.title}</p>

                  <span
                    className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${getDirectionBadgeStyles(
                      item.direction,
                    )}`}
                  >
                    {formatDirection(item.direction)}
                  </span>
                </div>

                <span className="text-sm font-bold text-cyan-300">
                  {item.weight}% relevance
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-400">No evidence assessment available.</p>
        )}
      </div>
    </section>
  );
}
