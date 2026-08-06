import { buildEvidence } from "@/engine/evidence/evidenceEngine";
import { manufacturingSample } from "@/engine/evidence/testData";

export default function EvidenceTest() {
  const evidence = buildEvidence(
    manufacturingSample.indicatorId,
    manufacturingSample.current,
    manufacturingSample.previous,
  );

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <h1 className="mb-8 text-4xl font-bold">Evidence Engine Test</h1>

      <section className="rounded-xl border border-slate-700 bg-slate-900 p-6">
        <pre>{JSON.stringify(evidence, null, 2)}</pre>
      </section>
    </main>
  );
}
