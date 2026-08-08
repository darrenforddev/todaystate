import type { ThemeIntelligence } from "@/engine/theme";

interface ConfidenceBreakdownProps {
  theme: ThemeIntelligence;
}

export default function ConfidenceBreakdown({
  theme,
}: ConfidenceBreakdownProps) {
  const { confidenceDetails } = theme;

  const factors = [
    {
      label: "Evidence quality",
      value: confidenceDetails.breakdown.evidenceQuality,
      weight: "30%",
    },
    {
      label: "Evidence agreement",
      value: confidenceDetails.breakdown.evidenceAgreement,
      weight: "25%",
    },
    {
      label: "Evidence freshness",
      value: confidenceDetails.breakdown.evidenceFreshness,
      weight: "15%",
    },
    {
      label: "Supporting evidence",
      value: confidenceDetails.breakdown.supportingEvidence,
      weight: "20%",
    },
    {
      label: "Historical accuracy",
      value: confidenceDetails.breakdown.historicalAccuracy,
      weight: "10%",
    },
  ];

  return (
    <section className="mt-8 rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Confidence Breakdown</h2>

          <p className="mt-2 text-slate-400">
            The weighted factors producing the current confidence score.
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3">
          <p className="text-sm uppercase tracking-wider text-cyan-200">
            {confidenceDetails.level}
          </p>

          <p className="mt-1 text-3xl font-black text-cyan-300">
            {confidenceDetails.score}%
          </p>
        </div>
      </div>

      <details className="group mt-6 rounded-2xl border border-white/10 bg-[#07111f]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-bold text-white">
          <span>Show calculation</span>

          <span className="text-xl text-cyan-300 transition-transform group-open:rotate-45">
            +
          </span>
        </summary>

        <div className="border-t border-white/10 p-5">
          <p className="leading-7 text-slate-300">
            {confidenceDetails.explanation}
          </p>

          <div className="mt-6 space-y-5">
            {factors.map((factor) => (
              <div key={factor.label}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{factor.label}</p>

                    <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
                      {factor.weight} weighting
                    </p>
                  </div>

                  <p className="text-lg font-black text-cyan-300">
                    +{factor.value.toFixed(1)}
                  </p>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-cyan-400"
                    style={{
                      width: `${
                        confidenceDetails.score > 0
                          ? Math.min(
                              100,
                              (factor.value / confidenceDetails.score) * 100,
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
            <p className="font-bold text-white">Total confidence</p>

            <p className="text-2xl font-black text-cyan-300">
              {confidenceDetails.score}%
            </p>
          </div>
        </div>
      </details>
    </section>
  );
}
