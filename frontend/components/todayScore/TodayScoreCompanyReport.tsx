import Link from "next/link";

import type {
  ScreenerDecision,
  ThemeAlignment,
} from "@/engine/todayScore/screener";
import type { ScreenerCompanyReport } from "@/engine/todayScore/screenerReport";
import type { FactorScore } from "@/engine/todayScore/types";

const decisionStyles: Record<ScreenerDecision, string> = {
  long: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  short: "border-rose-400/30 bg-rose-400/10 text-rose-300",
  watch: "border-amber-400/30 bg-amber-400/10 text-amber-300",
};

const alignmentStyles: Record<ThemeAlignment, string> = {
  supportive: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  mixed: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  contradictory: "border-rose-400/30 bg-rose-400/10 text-rose-300",
};

const percentageFactorIds = new Set([
  "return-on-invested-capital",
  "return-on-equity",
  "operating-margin",
  "net-profit-margin",
  "free-cash-flow-margin",
  "earnings-volatility",
  "revenue-growth-consistency",
  "earnings-growth-consistency",
  "share-dilution",
  "free-cash-flow-yield",
  "shareholder-yield",
  "one-month-price-return",
  "three-month-price-return",
  "six-month-price-return",
  "twelve-month-price-return",
  "earnings-estimate-revisions-three-month",
  "earnings-estimate-revisions-six-month",
  "earnings-surprise",
  "revenue-surprise",
  "forward-eps-growth",
  "price-versus-50-day-moving-average",
  "price-versus-200-day-moving-average",
  "fifty-day-versus-200-day-moving-average",
  "distance-from-52-week-high",
]);

const multipleFactorIds = new Set([
  "net-debt-to-ebitda",
  "interest-coverage",
  "current-ratio",
  "cash-conversion",
  "price-to-earnings",
  "forward-price-to-earnings",
  "price-to-sales",
  "price-to-book",
  "enterprise-value-to-ebitda",
  "price-to-free-cash-flow",
  "enterprise-value-to-free-cash-flow",
  "pe-versus-five-year-average",
  "ev-ebitda-versus-five-year-average",
  "price-to-sales-versus-five-year-average",
  "free-cash-flow-yield-versus-five-year-average",
  "relative-strength",
]);

function scoreColour(score: number): string {
  if (score >= 65) return "text-emerald-300";
  if (score <= 35) return "text-rose-300";
  return "text-amber-200";
}

function formatRawValue(factor: FactorScore): string {
  if (factor.rawValue === undefined) return "Missing";
  if (percentageFactorIds.has(factor.id)) return `${factor.rawValue}%`;
  if (multipleFactorIds.has(factor.id)) return `${factor.rawValue}x`;
  return factor.rawValue.toString();
}

function formatOrdinal(value: number): string {
  const remainder = value % 100;

  if (remainder >= 11 && remainder <= 13) return `${value}th`;

  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
}

function ScoreRing({
  label,
  score,
  weight,
}: {
  label: string;
  score: number;
  weight: string;
}) {
  const radius = 43;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="rounded-3xl border border-slate-700/70 bg-[#07111f] p-5 text-center">
      <div className="relative mx-auto h-32 w-32">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="rgba(148,163,184,0.12)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className={scoreColour(score)}
          />
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center text-4xl font-black ${scoreColour(score)}`}
        >
          {score}
        </span>
      </div>
      <p className="mt-3 text-sm font-bold uppercase tracking-[0.16em] text-white">
        {label}
      </p>
      <p className="mt-1 text-xs text-slate-500">{weight} weighting</p>
    </div>
  );
}

function FactorTable({ factors }: { factors: FactorScore[] }) {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="border-b border-slate-800 bg-[#0a1626] text-[10px] uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th className="px-4 py-3">Factor</th>
              <th className="px-4 py-3">Raw input</th>
              <th className="px-4 py-3">Universe percentile</th>
              <th className="px-4 py-3">Factor score</th>
              <th className="px-4 py-3">What it measures</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {factors.map((factor) => (
              <tr key={factor.id} className="bg-[#07111f]">
                <td className="px-4 py-4 font-semibold text-white">
                  {factor.name}
                </td>
                <td className="px-4 py-4 tabular-nums text-slate-300">
                  {formatRawValue(factor)}
                </td>
                <td className="px-4 py-4 tabular-nums text-cyan-300">
                  {factor.percentile === undefined
                    ? "Not ranked"
                    : formatOrdinal(factor.percentile)}
                </td>
                <td
                  className={`px-4 py-4 font-bold tabular-nums ${scoreColour(factor.score)}`}
                >
                  {factor.score}
                </td>
                <td className="max-w-sm px-4 py-4 text-xs leading-5 text-slate-500">
                  {factor.explanation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface PillarSectionProps {
  title: string;
  score: number;
  coverage: string;
  categories: { label: string; score: number }[];
  factors: FactorScore[];
}

function PillarSection({
  title,
  score,
  coverage,
  categories,
  factors,
}: PillarSectionProps) {
  return (
    <section className="rounded-3xl border border-slate-700/70 bg-[#07111f] p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
            Pillar breakdown
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">{coverage} factors</span>
          <span className={`text-3xl font-black ${scoreColour(score)}`}>
            {score}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => (
          <div
            key={category.label}
            className="rounded-2xl border border-slate-800 bg-[#020817] p-4"
          >
            <p className="text-xs text-slate-500">{category.label}</p>
            <p className={`mt-2 text-2xl font-black ${scoreColour(category.score)}`}>
              {category.score}
            </p>
          </div>
        ))}
      </div>

      <FactorTable factors={factors} />
    </section>
  );
}

export default function TodayScoreCompanyReport({
  report,
}: {
  report: ScreenerCompanyReport;
}) {
  const { company, coverage, dataWarnings } = report;
  const { result } = company;
  const { todayScore, breakdown, classification, explanation } = result;

  return (
    <div className="min-h-screen bg-[#020817] px-5 py-10 text-white md:px-10 xl:px-12">
      <div className="mx-auto max-w-[1500px]">
        <Link
          href="/screener"
          className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
        >
          <span aria-hidden="true">←</span>
          Back to TodayScore Screener
        </Link>

        <header className="mt-6 flex flex-col gap-6 border-b border-slate-800 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-cyan-300">
                {company.ticker}
              </p>
              <span
                className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase ${decisionStyles[company.decision]}`}
              >
                {company.decision} research candidate
              </span>
            </div>
            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
              {company.companyName}
            </h1>
            <p className="mt-3 text-sm text-slate-400">
              {company.sector} · {company.industry} · Global comparison universe
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] px-5 py-4 text-right">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Classification
            </p>
            <p className="mt-1 text-xl font-black text-cyan-200">
              {classification.band}
            </p>
            <p className="mt-1 text-xs text-slate-500">Development data</p>
          </div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="flex min-h-52 flex-col justify-between rounded-3xl border border-cyan-400/25 bg-gradient-to-br from-cyan-400/[0.12] to-[#07111f] p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                TodayScore
              </p>
              <p className="mt-3 text-7xl font-black tracking-tight text-white">
                {todayScore.score}
              </p>
              <p className="mt-1 text-sm text-slate-400">out of 100</p>
            </div>
            <p className="mt-6 text-xs leading-5 text-slate-500">
              40% Quality · 30% Value · 30% Momentum
            </p>
          </div>
          <ScoreRing label="Quality" score={todayScore.quality} weight="40%" />
          <ScoreRing label="Value" score={todayScore.value} weight="30%" />
          <ScoreRing label="Momentum" score={todayScore.momentum} weight="30%" />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
          <div className="rounded-3xl border border-slate-700/70 bg-[#07111f] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
              Why this classification
            </p>
            <h2 className="mt-2 text-2xl font-black">Explainable TodayScore</h2>
            <p className="mt-4 leading-7 text-slate-300">{explanation.summary}</p>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {classification.description}
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">
                  Strengths
                </p>
                {explanation.strengths.length > 0 ? (
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                    {explanation.strengths.map((strength) => (
                      <li key={strength}>• {strength}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">
                    No pillar currently reaches the strong threshold.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-rose-400/15 bg-rose-400/[0.05] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-300">
                  Weaknesses
                </p>
                {explanation.weaknesses.length > 0 ? (
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                    {explanation.weaknesses.map((weakness) => (
                      <li key={weakness}>• {weakness}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">
                    No pillar currently falls below the weak threshold.
                  </p>
                )}
              </div>
            </div>

            {[...explanation.warnings, ...dataWarnings].length > 0 && (
              <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-300">
                  Safeguards and data notes
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                  {[...explanation.warnings, ...dataWarnings].map((warning) => (
                    <li key={warning}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-700/70 bg-[#07111f] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                    MBIE alignment
                  </p>
                  <h2 className="mt-2 text-xl font-black">{company.themeName}</h2>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase ${alignmentStyles[company.themeAlignment]}`}
                >
                  {company.themeAlignment}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-400">
                {company.themeRationale}
              </p>
              <div className="mt-5 flex items-end justify-between">
                <span className="text-xs text-slate-500">Theme confidence</span>
                <span className="text-2xl font-black text-cyan-300">
                  {company.themeConfidence}%
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-cyan-400"
                  style={{ width: `${company.themeConfidence}%` }}
                />
              </div>
            </section>

            <section className="rounded-3xl border border-slate-700/70 bg-[#07111f] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                Data coverage
              </p>
              <div className="mt-3 flex items-end justify-between">
                <p className="text-4xl font-black text-white">
                  {coverage.overall.available}/{coverage.overall.expected}
                </p>
                <p className="text-xl font-black text-emerald-300">
                  {coverage.overall.percentage}%
                </p>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Available factor inputs used by this development report.
              </p>
            </section>
          </div>
        </section>

        <div className="mt-6 space-y-6">
          <PillarSection
            title="Quality"
            score={breakdown.quality.score}
            coverage={`${coverage.quality.available}/${coverage.quality.expected}`}
            categories={[
              { label: "Profitability", score: breakdown.quality.profitability },
              {
                label: "Financial strength",
                score: breakdown.quality.financialStrength,
              },
              {
                label: "Cash-flow quality",
                score: breakdown.quality.cashFlowQuality,
              },
              {
                label: "Earnings stability",
                score: breakdown.quality.earningsStability,
              },
            ]}
            factors={breakdown.quality.factors}
          />

          <PillarSection
            title="Value"
            score={breakdown.value.score}
            coverage={`${coverage.value.available}/${coverage.value.expected}`}
            categories={[
              {
                label: "Relative valuation",
                score: breakdown.value.relativeValuation,
              },
              {
                label: "Cash-flow valuation",
                score: breakdown.value.cashFlowValuation,
              },
              {
                label: "Historical valuation",
                score: breakdown.value.historicalValuation,
              },
            ]}
            factors={breakdown.value.factors}
          />

          <PillarSection
            title="Momentum"
            score={breakdown.momentum.score}
            coverage={`${coverage.momentum.available}/${coverage.momentum.expected}`}
            categories={[
              {
                label: "Price momentum",
                score: breakdown.momentum.priceMomentum,
              },
              {
                label: "Earnings momentum",
                score: breakdown.momentum.earningsMomentum,
              },
              {
                label: "Trend strength",
                score: breakdown.momentum.trendStrength,
              },
            ]}
            factors={breakdown.momentum.factors}
          />
        </div>

        <section className="mt-6 grid gap-6 rounded-3xl border border-slate-700/70 bg-[#07111f] p-6 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
              Historical outcomes
            </p>
            <p className="mt-3 text-4xl font-black text-white">
              {company.historicalSuccessRate === undefined
                ? "—"
                : `${company.historicalSuccessRate}%`}
            </p>
            <p className="mt-1 text-xs text-slate-500">Development success rate</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
              Completed reviews
            </p>
            <p className="mt-3 text-4xl font-black text-white">
              {company.completedOutcomes}
            </p>
            <p className="mt-1 text-xs text-slate-500">Recorded development outcomes</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
              What went wrong?
            </p>
            <p className="mt-3 text-lg font-black text-amber-200">Ready to connect</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Failed-outcome explanations will appear here when the live outcome repository is connected to companies.
            </p>
          </div>
        </section>

        <p className="mt-6 text-xs leading-5 text-slate-600">
          TodayScore and decision labels are research classifications, not trade instructions. Company figures and historical rates on this page are development data.
        </p>
      </div>
    </div>
  );
}
