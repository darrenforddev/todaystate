import type { ThemeIntelligence } from "@/engine/theme";

interface ConvictionBreakdownProps {
  theme: ThemeIntelligence;
}

export default function ConvictionBreakdown({
  theme,
}: ConvictionBreakdownProps) {
  const { breakdown } = theme.convictionDetails;

  return (
    <section className="mt-8 rounded-3xl border border-white/10 bg-[#0a1626] p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Conviction Breakdown</h2>

          <p className="mt-2 text-slate-400">
            The balance of independent supportive and contradictory evidence
            producing the current conviction score.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3">
          <p className="text-sm uppercase tracking-wider text-slate-300">
            {theme.signal}
          </p>

          <p className="mt-1 text-3xl font-black text-white">
            {theme.convictionDetails.score}%
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
            Related indicators are first combined into independent evidence
            groups. This prevents several closely related signals from
            artificially inflating conviction.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-5">
              <p className="text-sm font-bold uppercase tracking-wider text-emerald-300">
                Supportive strength
              </p>

              <p className="mt-2 text-3xl font-black text-emerald-300">
                +{breakdown.supportiveStrength}
              </p>
            </div>

            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-5">
              <p className="text-sm font-bold uppercase tracking-wider text-rose-300">
                Contradictory strength
              </p>

              <p className="mt-2 text-3xl font-black text-rose-300">
                −{breakdown.contradictoryStrength}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-bold text-white">
              Independent evidence groups
            </h3>

            <div className="mt-4 space-y-3">
              {breakdown.groups.length > 0 ? (
                breakdown.groups.map((group) => {
                  const isSupportive = group.direction === 1;
                  const isContradictory = group.direction === -1;

                  return (
                    <div
                      key={group.independenceGroup}
                      className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#050b14] p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold text-white">
                          {group.independenceGroup}
                        </p>

                        <p
                          className={`mt-1 text-sm font-bold ${
                            isSupportive
                              ? "text-emerald-300"
                              : isContradictory
                                ? "text-rose-300"
                                : "text-slate-400"
                          }`}
                        >
                          {isSupportive
                            ? "Supportive"
                            : isContradictory
                              ? "Contradictory"
                              : "Neutral"}
                        </p>
                      </div>

                      <p
                        className={`text-lg font-black ${
                          isSupportive
                            ? "text-emerald-300"
                            : isContradictory
                              ? "text-rose-300"
                              : "text-slate-300"
                        }`}
                      >
                        {isSupportive ? "+" : isContradictory ? "−" : ""}
                        {group.strength}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-400">
                  No independent evidence groups are available.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-[#050b14] p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-slate-300">Net directional strength</p>

              <p
                className={`text-lg font-black ${
                  breakdown.signedTotal > 0
                    ? "text-emerald-300"
                    : breakdown.signedTotal < 0
                      ? "text-rose-300"
                      : "text-slate-300"
                }`}
              >
                {breakdown.signedTotal > 0 ? "+" : ""}
                {breakdown.signedTotal}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="text-slate-300">Directional balance</p>

              <p className="font-black text-white">
                {(breakdown.directionalBalance * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
            <p className="font-bold text-white">Total conviction</p>

            <p className="text-2xl font-black text-white">
              {theme.convictionDetails.score}%
            </p>
          </div>
        </div>
      </details>
    </section>
  );
}
