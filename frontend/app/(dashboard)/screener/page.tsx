import TodayScoreScreener from "@/components/todayScore/TodayScoreScreener";
import { screenerCompanyMetadata } from "@/data/screenerCompanies";
import { todayScoreTestResults } from "@/engine/todayScore/todayScoreTest";

export default function TodayScoreScreenerPage() {
  return (
    <main className="min-h-screen bg-[#020817] px-5 py-10 text-white md:px-10 xl:px-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-col gap-5 border-b border-slate-800 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              TodayState research laboratory
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
              TodayScore Screener
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400">
              Rank companies by Quality, Value and Momentum, then test each
              candidate against MBIE theme confidence and recorded historical
              outcomes.
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] px-5 py-4 text-sm text-slate-300">
            <p className="font-bold text-cyan-200">
              40% Quality · 30% Value · 30% Momentum
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Development universe · research signals only
            </p>
          </div>
        </div>

        <TodayScoreScreener
          scoreResults={todayScoreTestResults}
          metadata={screenerCompanyMetadata}
        />

        <p className="mt-6 text-xs leading-5 text-slate-600">
          Long and short labels are research classifications generated from
          score thresholds. They are not trade instructions. Historical rates
          shown here are development data until live outcome records are
          connected.
        </p>
      </div>
    </main>
  );
}
