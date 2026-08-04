import type { ConfidenceResult } from "@/engine/confidence/confidenceEngine";

interface ConfidenceCardProps {
  result: ConfidenceResult;
}

export default function ConfidenceCard({ result }: ConfidenceCardProps) {
  return (
    <section className="mt-8 rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-8">
      <h2 className="text-2xl font-bold text-white">MBIE Confidence</h2>

      <p className="mt-2 text-slate-400">
        Confidence is calculated from objective evidence rather than entered
        manually.
      </p>

      <div className="mt-8">
        <p className="text-6xl font-black text-cyan-300">
          {result.confidence}%
        </p>
      </div>

      <div className="mt-8 space-y-4">
        <BreakdownRow
          label="Evidence Quality"
          value={result.breakdown.evidenceQuality}
        />

        <BreakdownRow
          label="Evidence Agreement"
          value={result.breakdown.evidenceAgreement}
        />

        <BreakdownRow
          label="Evidence Freshness"
          value={result.breakdown.evidenceFreshness}
        />

        <BreakdownRow
          label="Supporting Evidence"
          value={result.breakdown.supportingEvidence}
        />

        <BreakdownRow
          label="Historical Accuracy"
          value={result.breakdown.historicalAccuracy}
        />
      </div>
    </section>
  );
}

function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2">
      <span className="text-slate-300">{label}</span>

      <span className="font-bold text-cyan-300">{value}</span>
    </div>
  );
}
