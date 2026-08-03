import type { Theme } from "../../types/theme";

type WhySectionProps = {
  reasons: Theme["why"];
};

export default function WhySection({ reasons }: WhySectionProps) {
  return (
    <section className="mt-10 rounded-3xl border border-white/5 bg-[#0a1626] p-7">
      <h2 className="text-2xl font-bold">Why TodayState Likes This Theme</h2>

      <div className="mt-6 space-y-4">
        {reasons.map((item) => (
          <div key={item.reason} className="rounded-2xl bg-white/[0.03] p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-xl text-emerald-400">✓</span>

                <p className="font-semibold text-slate-200">{item.reason}</p>
              </div>

              <span className="shrink-0 rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
                {item.confidence}% confidence
              </span>
            </div>

            <div className="mt-5 border-t border-white/5 pt-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Supporting Evidence
              </p>

              <div className="mt-3 space-y-2">
                {item.evidence.map((evidence) => (
                  <div
                    key={evidence.title}
                    className="flex items-center justify-between gap-4 rounded-xl bg-black/10 px-4 py-3"
                  >
                    <span className="text-sm text-slate-300">
                      {evidence.title}
                    </span>

                    <span
                      className={
                        evidence.status === "Positive"
                          ? "text-sm font-semibold text-emerald-300"
                          : evidence.status === "Negative"
                            ? "text-sm font-semibold text-rose-300"
                            : "text-sm font-semibold text-amber-300"
                      }
                    >
                      {evidence.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
