import { manufacturingSample } from "@/engine/evidence/index";
import { reasonFromIndicator } from "@/engine/reasoning/index";

export default function ReasoningTestPage() {
  const result = reasonFromIndicator(
    manufacturingSample.indicatorId,
    manufacturingSample.current,
    manufacturingSample.previous,
  );

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <h1 className="mb-8 text-4xl font-bold">MBIE Reasoning Engine Test</h1>

      <section className="rounded-xl border border-slate-700 bg-slate-900 p-6">
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </section>
    </main>
  );
}
