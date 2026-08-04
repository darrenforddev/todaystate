import ConfidenceCard from "@/components/mbie/ConfidenceCard";
import { calculateConfidence } from "@/engine/confidence/confidenceEngine";
import { calculateScore } from "@/engine/scoring/scoringEngine";

export default function MBIEPage() {
  const confidenceScenarios = [
    {
      title: "Strong Evidence",
      result: calculateConfidence({
        evidenceQuality: 96,
        evidenceAgreement: 94,
        evidenceFreshness: 98,
        supportingEvidence: 91,
        historicalAccuracy: 89,
      }),
    },
    {
      title: "Mixed Evidence",
      result: calculateConfidence({
        evidenceQuality: 72,
        evidenceAgreement: 65,
        evidenceFreshness: 82,
        supportingEvidence: 68,
        historicalAccuracy: 74,
      }),
    },
    {
      title: "Weak Evidence",
      result: calculateConfidence({
        evidenceQuality: 42,
        evidenceAgreement: 38,
        evidenceFreshness: 55,
        supportingEvidence: 45,
        historicalAccuracy: 48,
      }),
    },
  ];

  const scoringScenarios = [
    {
      title: "Strong Theme",
      result: calculateScore({
        macroEnvironment: 92,
        evidenceStrength: 96,
        relationshipStrength: 94,
        momentum: 90,
        riskAdjustment: 82,
      }),
    },
    {
      title: "Mixed Theme",
      result: calculateScore({
        macroEnvironment: 68,
        evidenceStrength: 72,
        relationshipStrength: 66,
        momentum: 61,
        riskAdjustment: 70,
      }),
    },
    {
      title: "Weak Theme",
      result: calculateScore({
        macroEnvironment: 38,
        evidenceStrength: 42,
        relationshipStrength: 35,
        momentum: 31,
        riskAdjustment: 45,
      }),
    },
  ];

  return (
    <main className="mx-auto max-w-6xl p-10 text-white">
      <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
        MBIE Laboratory
      </p>

      <h1 className="mt-3 text-5xl font-black">MBIE Engine Laboratory</h1>

      <p className="mt-4 max-w-2xl text-slate-400">
        Internal testing environment for MBIE calculation engines.
      </p>

      <section className="mt-12">
        <h2 className="text-4xl font-black text-white">Confidence Engine</h2>

        <p className="mt-3 text-slate-400">
          Confidence results across strong, mixed and weak evidence.
        </p>

        <div className="mt-8 space-y-10">
          {confidenceScenarios.map((scenario) => (
            <div key={scenario.title}>
              <h3 className="mb-5 text-2xl font-bold text-white">
                {scenario.title}
              </h3>

              <ConfidenceCard result={scenario.result} />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-4xl font-black text-white">Scoring Engine</h2>

        <p className="mt-3 text-slate-400">
          Explainable theme scoring across strong, mixed and weak conditions.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {scoringScenarios.map((scenario) => (
            <div
              key={scenario.title}
              className="rounded-3xl border border-white/10 bg-[#0a1626] p-7"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                {scenario.title}
              </p>

              <p className="mt-4 text-6xl font-black text-cyan-300">
                {scenario.result.score}
              </p>

              <div className="mt-6 space-y-3 text-sm">
                <BreakdownRow
                  label="Macro Environment"
                  value={scenario.result.breakdown.macroEnvironment}
                />

                <BreakdownRow
                  label="Evidence Strength"
                  value={scenario.result.breakdown.evidenceStrength}
                />

                <BreakdownRow
                  label="Relationship Strength"
                  value={scenario.result.breakdown.relationshipStrength}
                />

                <BreakdownRow
                  label="Momentum"
                  value={scenario.result.breakdown.momentum}
                />

                <BreakdownRow
                  label="Risk Adjustment"
                  value={scenario.result.breakdown.riskAdjustment}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2">
      <span className="text-slate-400">{label}</span>

      <span className="font-bold text-cyan-300">{value}</span>
    </div>
  );
}
