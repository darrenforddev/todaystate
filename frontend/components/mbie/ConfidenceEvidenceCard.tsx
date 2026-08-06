import type { ConfidenceEvidence } from "@/engine/confidence/confidenceEvidence";
import {
  calculateEvidenceFreshness,
  calculateEvidenceQuality,
  calculateEvidenceHistoricalAccuracy,
} from "@/engine/confidence/confidenceFactorBuilder";

interface ConfidenceEvidenceCardProps {
  evidence: ConfidenceEvidence;
}

export default function ConfidenceEvidenceCard({
  evidence,
}: ConfidenceEvidenceCardProps) {
  const freshness = calculateEvidenceFreshness(evidence);
  const quality = calculateEvidenceQuality(evidence);
  const historicalAccuracy = calculateEvidenceHistoricalAccuracy(evidence);
  const signalStyles = {
    supportive: "bg-green-500/15 text-green-400",
    contradictory: "bg-red-500/15 text-red-400",
    neutral: "bg-amber-500/15 text-amber-300",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a1626] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-bold text-white">{evidence.name}</h4>

          <p className="mt-1 text-sm text-slate-500">
            Source: {evidence.source}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
            signalStyles[evidence.signal]
          }`}
        >
          {evidence.signal}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-slate-500">Quality</p>
          <p className="mt-1 font-bold text-cyan-300">{quality}</p>
        </div>

        <div>
          <p className="text-slate-500">Freshness</p>
          <p className="mt-1 font-bold text-cyan-300">{freshness}</p>
        </div>

        <div>
          <p className="text-slate-500">Historical</p>
          <p className="mt-1 font-bold text-cyan-300">{historicalAccuracy}</p>
        </div>
      </div>
    </div>
  );
}
