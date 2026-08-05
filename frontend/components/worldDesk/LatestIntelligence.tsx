import type { IntelligenceItem } from "@/data/intelligence";

type LatestIntelligenceProps = {
  intelligence: IntelligenceItem[];
};

function getImpactClasses(impact: IntelligenceItem["impact"]) {
  if (impact === "High") {
    return "border-emerald-400/20 bg-emerald-500/10 text-emerald-300";
  }

  if (impact === "Medium") {
    return "border-amber-400/20 bg-amber-500/10 text-amber-300";
  }

  return "border-slate-400/20 bg-slate-500/10 text-slate-300";
}

export default function LatestIntelligence({
  intelligence,
}: LatestIntelligenceProps) {
  return (
    <section className="rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Latest Intelligence
          </p>

          <h2 className="mt-3 text-3xl font-black text-white">What Changed</h2>
        </div>

        <span className="w-fit rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
          Updated Now
        </span>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {intelligence.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition hover:border-cyan-400/20 hover:bg-white/[0.05]"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {item.category}
              </span>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${getImpactClasses(
                  item.impact,
                )}`}
              >
                {item.impact} Impact
              </span>
            </div>

            <h3 className="mt-5 text-xl font-bold text-white">{item.title}</h3>

            <p className="mt-4 leading-7 text-slate-400">{item.summary}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
