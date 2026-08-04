import IntelligenceBar from "@/components/ui/IntelligenceBar";
import { generateMorningInsight } from "@/engine/briefing";

export default function MBIEInsight() {
  const insight = generateMorningInsight();

  return (
    <div className="rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
        {insight.title}
      </p>

      <div className="mt-6 space-y-5 leading-8 text-slate-300">
        <p>{insight.introduction}</p>

        <p>{insight.themeSummary}</p>
        <p>{insight.companySummary}</p>

        <p>{insight.conclusion}</p>
      </div>

      <div className="mt-8">
        <IntelligenceBar
          value={insight.confidence}
          max={100}
          label="MBIE Confidence"
        />
      </div>
    </div>
  );
}
