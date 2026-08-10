import CompanyLogo from "@/components/company/CompanyLogo";
import type { CompanyUniverseMember } from "@/engine/todayScore/companyUniverse";

interface TodayScorePilotUniverseProps {
  companies: readonly CompanyUniverseMember[];
}

export default function TodayScorePilotUniverse({
  companies,
}: TodayScorePilotUniverseProps) {
  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-cyan-400/20 bg-[#07111f]">
      <div className="border-b border-slate-800 bg-gradient-to-r from-cyan-400/[0.08] via-blue-500/[0.04] to-transparent px-6 py-6 md:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
              UK live-data pilot
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              First {companies.length} real companies registered
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Official LSE identities and company domains are ready. TodayScore,
              Q/V/M rankings and research classifications remain locked until
              live fundamentals, prices and revisions pass data-quality checks.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.07] px-4 py-3">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-amber-300" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-amber-200">
                Awaiting live data
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                No real scores published yet
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-px bg-slate-800/80 sm:grid-cols-2 xl:grid-cols-5">
        {companies.map((company) => {
          const hasLiveData = company.dataStatus === "live";

          return (
            <article
              key={company.companyId}
              className="min-w-0 bg-[#07111f] p-5 transition hover:bg-white/[0.025]"
            >
              <div className="flex items-start gap-3">
                <CompanyLogo
                  companyName={company.companyName}
                  domain={company.brandDomain}
                />
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-white">
                    {company.companyName}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-cyan-300">
                    LSE: {company.ticker}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-xs font-semibold text-slate-300">
                {company.sector}
              </p>
              <p className="mt-1 min-h-8 text-xs leading-4 text-slate-500">
                {company.industry}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3 text-[10px] font-bold uppercase tracking-[0.12em]">
                <span className="text-slate-600">{company.exchangeMic}</span>
                <span
                  className={
                    hasLiveData ? "text-emerald-300" : "text-amber-200/80"
                  }
                >
                  {hasLiveData ? "Live data" : "Data pending"}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
