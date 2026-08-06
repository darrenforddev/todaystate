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

        <p className="mt-2 text-sm font-bold uppercase tracking-[0.18em] text-cyan-200">
          {result.level}
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
          Why this score?
        </p>

        <p className="mt-2 leading-6 text-slate-300">{result.explanation}</p>
      </div>

      <div className="mt-8 space-y-4">
        <BreakdownRow
          label="Evidence Quality"
          value={result.breakdown.evidenceQuality}
          maximum={30}
        />

        <BreakdownRow
          label="Evidence Agreement"
          value={result.breakdown.evidenceAgreement}
          maximum={25}
        />

        <BreakdownRow
          label="Evidence Freshness"
          value={result.breakdown.evidenceFreshness}
          maximum={15}
        />

        <BreakdownRow
          label="Supporting Evidence"
          value={result.breakdown.supportingEvidence}
          maximum={20}
        />

        <BreakdownRow
          label="Historical Accuracy"
          value={result.breakdown.historicalAccuracy}
          maximum={10}
        />
      </div>
    </section>
  );
}

function BreakdownRow({
  label,
  value,
  maximum,
}: {
  label: string;
  value: number;
  maximum: number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2">
      <span className="text-slate-300">{label}</span>

      <span className="font-bold text-cyan-300">
        {value} / {maximum}
      </span>
    </div>
  );
}
