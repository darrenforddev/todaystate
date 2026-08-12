import TodayScoreScreener from "@/components/todayScore/TodayScoreScreener";
import TodayScorePilotUniverse from "@/components/todayScore/TodayScorePilotUniverse";
import { realCompanyUniverse } from "@/data/realCompanyUniverse";
import { realCompanyDemoMetadata } from "@/data/realCompanyDemoMetadata";
import { realCompanyDemoResults } from "@/engine/todayScore/realCompanyDemoScores";

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

        <TodayScorePilotUniverse companies={realCompanyUniverse} />

        <div className="mt-10 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] px-5 py-4">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-300">
            Demo data — not live financial data
          </p>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
            The rankings below use synthetic financial and market profiles
            created to test the TodayScore calculation, sorting, filters and
            research classifications. They must not be treated as current
            investment research.
          </p>
        </div>

        <div className="mt-10">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
            TodayScore demonstration cohort
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            First ten real-company profiles
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Real company identities are combined with synthetic Quality, Value
            and Momentum inputs while the live-company data pipeline is built
            and validated.
          </p>
        </div>

        <TodayScoreScreener
          scoreResults={realCompanyDemoResults}
          metadata={realCompanyDemoMetadata}
        />

        <p className="mt-6 text-xs leading-5 text-slate-600">
          Long and short labels are research classifications generated from
          score thresholds. They are not trade instructions. Theme confidence,
          historical success rates and completed outcomes shown here are
          demonstration values until verified live records are connected.
        </p>
      </div>
    </main>
  );
}
