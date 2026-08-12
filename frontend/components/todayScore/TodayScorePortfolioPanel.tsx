import Link from "next/link";

import {
  buildBalancedPortfolioSelection,
  buildPortfolioCandidateLists,
  type PortfolioCandidate,
} from "@/engine/todayScore/portfolio";
import type { ScreenerCompany } from "@/engine/todayScore/screener";

interface TodayScorePortfolioPanelProps {
  companies: ScreenerCompany[];
}

type CandidateSide = "long" | "short" | "watch";

const candidateStyles: Record<
  CandidateSide,
  {
    border: string;
    background: string;
    label: string;
    score: string;
  }
> = {
  long: {
    border: "border-emerald-400/20",
    background: "bg-emerald-400/[0.06]",
    label: "text-emerald-300",
    score: "text-emerald-200",
  },
  short: {
    border: "border-rose-400/20",
    background: "bg-rose-400/[0.06]",
    label: "text-rose-300",
    score: "text-rose-200",
  },
  watch: {
    border: "border-amber-400/20",
    background: "bg-amber-400/[0.05]",
    label: "text-amber-300",
    score: "text-amber-200",
  },
};

function CandidateCard({
  candidate,
  side,
}: {
  candidate: PortfolioCandidate;
  side: CandidateSide;
}) {
  const styles = candidateStyles[side];
  const { company } = candidate;
  const reportHref = `/screener/${company.ticker.toLowerCase()}`;

  return (
    <article
      className={`rounded-2xl border p-4 ${styles.border} ${styles.background}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p
            className={`text-[10px] font-black uppercase tracking-[0.2em] ${styles.label}`}
          >
            Rank {candidate.rank} · {side}
          </p>

          <Link
            href={reportHref}
            className="mt-2 block truncate text-base font-black text-white hover:text-cyan-200"
          >
            {company.companyName}
          </Link>

          <p className="mt-1 text-xs text-slate-500">
            {company.ticker} · {company.sector}
          </p>
        </div>

        <div className="text-right">
          <p className={`text-2xl font-black tabular-nums ${styles.score}`}>
            {candidate.todayScore}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-slate-600">
            TodayScore
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-slate-950/50 px-2 py-2">
          <p className="text-sm font-bold text-white">
            {company.result.todayScore.quality}
          </p>
          <p className="text-[9px] uppercase text-slate-600">Quality</p>
        </div>

        <div className="rounded-xl bg-slate-950/50 px-2 py-2">
          <p className="text-sm font-bold text-white">
            {company.result.todayScore.value}
          </p>
          <p className="text-[9px] uppercase text-slate-600">Value</p>
        </div>

        <div className="rounded-xl bg-slate-950/50 px-2 py-2">
          <p className="text-sm font-bold text-white">
            {company.result.todayScore.momentum}
          </p>
          <p className="text-[9px] uppercase text-slate-600">Momentum</p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-400">
        {candidate.reason}
      </p>
    </article>
  );
}

export default function TodayScorePortfolioPanel({
  companies,
}: TodayScorePortfolioPanelProps) {
  const candidateLists = buildPortfolioCandidateLists(companies);

  const selection = buildBalancedPortfolioSelection(companies, 5);

  return (
    <section className="mt-10 overflow-hidden rounded-3xl border border-cyan-400/15 bg-[#07111f]">
      <div className="border-b border-slate-800 px-6 py-6 md:px-8">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
          Portfolio research laboratory
        </p>

        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-black text-white md:text-3xl">
              Candidate Portfolio Builder
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Converts the currently filtered screener universe into ranked
              Long, Watch and Short candidates, then forms an equal-count
              research selection.
            </p>
          </div>

          <p className="text-sm font-semibold text-slate-400">
            {companies.length} companies currently considered
          </p>
        </div>
      </div>

      <div className="grid gap-3 border-b border-slate-800 p-6 sm:grid-cols-2 xl:grid-cols-4 md:p-8">
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            Long candidates
          </p>
          <p className="mt-2 text-3xl font-black text-white">
            {candidateLists.longCandidates.length}
          </p>
        </div>

        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/[0.06] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-rose-300">
            Short candidates
          </p>
          <p className="mt-2 text-3xl font-black text-white">
            {candidateLists.shortCandidates.length}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Watch candidates
          </p>
          <p className="mt-2 text-3xl font-black text-white">
            {candidateLists.watchCandidates.length}
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
            Equal-count pairs
          </p>
          <p className="mt-2 text-3xl font-black text-white">
            {selection.pairCount}
          </p>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {selection.warnings.length > 0 && (
          <div className="mb-6 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4">
            <p className="text-xs font-black uppercase tracking-wider text-amber-300">
              Selection warnings
            </p>

            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              {selection.warnings.map((warning) => (
                <li key={warning}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-2">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-black text-emerald-300">
                Selected Long side
              </h3>
              <span className="text-xs text-slate-500">
                {selection.longCandidates.length} selected
              </span>
            </div>

            <div className="space-y-3">
              {selection.longCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.company.companyId}
                  candidate={candidate}
                  side="long"
                />
              ))}

              {selection.longCandidates.length === 0 && (
                <p className="rounded-2xl border border-slate-800 p-5 text-sm text-slate-500">
                  No Long candidate is available from the current filters.
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-black text-rose-300">Selected Short side</h3>
              <span className="text-xs text-slate-500">
                {selection.shortCandidates.length} selected
              </span>
            </div>

            <div className="space-y-3">
              {selection.shortCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.company.companyId}
                  candidate={candidate}
                  side="short"
                />
              ))}

              {selection.shortCandidates.length === 0 && (
                <p className="rounded-2xl border border-slate-800 p-5 text-sm text-slate-500">
                  No Short candidate is available from the current filters.
                </p>
              )}
            </div>
          </div>
        </div>

        {candidateLists.watchCandidates.length > 0 && (
          <div className="mt-8 border-t border-slate-800 pt-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-black text-amber-300">Watch list</h3>
              <span className="text-xs text-slate-500">
                Ranked strongest to weakest
              </span>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              {candidateLists.watchCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.company.companyId}
                  candidate={candidate}
                  side="watch"
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
            Methodology safeguard
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            {selection.methodology}
          </p>

          {(selection.excludedLongCandidates.length > 0 ||
            selection.excludedShortCandidates.length > 0) && (
            <p className="mt-3 text-xs text-slate-500">
              Equal-count balancing excluded{" "}
              {selection.excludedLongCandidates.length} additional Long and{" "}
              {selection.excludedShortCandidates.length} additional Short
              candidates.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
