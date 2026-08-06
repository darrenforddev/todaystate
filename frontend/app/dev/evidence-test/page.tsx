import EvidenceCard from "@/components/mbie/EvidenceCard";

import { buildEvidence, manufacturingSample } from "@/engine/evidence";

export default function EvidenceTestPage() {
  const evidence = buildEvidence(
    manufacturingSample.indicatorId,
    manufacturingSample.current,
    manufacturingSample.previous,
  );

  return (
    <main className="min-h-screen bg-slate-950 p-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">
            MBIE DEVELOPMENT CONSOLE
          </p>

          <h1 className="mt-2 text-5xl font-bold text-white">
            Evidence Engine
          </h1>

          <p className="mt-4 text-slate-400">
            Live interpretation of incoming economic data.
          </p>
        </div>

        <EvidenceCard
          indicator="Manufacturing PMI"
          current={evidence.current}
          previous={evidence.previous}
          change={evidence.change}
          direction={evidence.direction}
          status={evidence.status}
          impact={evidence.impact}
          explanation={evidence.explanation}
        />
      </div>
    </main>
  );
}
