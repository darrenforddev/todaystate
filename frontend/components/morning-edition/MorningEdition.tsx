import type { ConfidenceEvidence } from "@/engine/confidence/confidenceEvidence";
import { getMorningBrief } from "@/engine/morningBriefEngine";

interface MorningEditionProps {
  macroEvidence: ConfidenceEvidence[];
}

export default function MorningEdition({ macroEvidence }: MorningEditionProps) {
  const brief = getMorningBrief(macroEvidence);

  return (
    <div className="mt-8 space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
          🧠 MBIE DAILY
        </p>

        <h2 className="mt-2 text-3xl font-bold">{brief.headline}</h2>

        <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-300">
          {brief.summary}
        </p>
      </div>

      <button className="rounded-xl border border-cyan-400/30 px-6 py-3 text-cyan-300 transition hover:bg-cyan-400/10">
        Explore Today&apos;s Intelligence →
      </button>
    </div>
  );
}
