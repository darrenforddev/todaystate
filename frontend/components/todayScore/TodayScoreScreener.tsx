"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type { TodayScoreTestResult } from "@/engine/todayScore/todayScoreTest";
import type {
  ScreenerCompanyMetadata,
  ScreenerDecision,
  ScreenerFilters,
} from "@/engine/todayScore/screener";
import {
  buildScreenerCompanies,
  defaultScreenerFilters,
  filterScreenerCompanies,
} from "@/engine/todayScore/screener";

interface TodayScoreScreenerProps {
  scoreResults: TodayScoreTestResult[];
  metadata: ScreenerCompanyMetadata[];
}

const decisionStyles: Record<ScreenerDecision, string> = {
  long: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  short: "border-rose-400/30 bg-rose-400/10 text-rose-300",
  watch: "border-amber-400/30 bg-amber-400/10 text-amber-300",
};

function ScoreCell({ value }: { value: number }) {
  const colour =
    value >= 65
      ? "text-emerald-300"
      : value <= 35
        ? "text-rose-300"
        : "text-amber-200";

  return (
    <span className={`font-semibold tabular-nums ${colour}`}>{value}</span>
  );
}

function RangeFilter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
        <span className="text-cyan-300">{value}+</span>
      </span>
      <input
        className="mt-3 w-full accent-cyan-400"
        type="range"
        min="0"
        max="100"
        step="5"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

export default function TodayScoreScreener({
  scoreResults,
  metadata,
}: TodayScoreScreenerProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<ScreenerFilters>(
    defaultScreenerFilters,
  );

  const companies = useMemo(
    () => buildScreenerCompanies(scoreResults, metadata),
    [scoreResults, metadata],
  );

  const filteredCompanies = useMemo(
    () => filterScreenerCompanies(companies, filters),
    [companies, filters],
  );

  const sectors = [
    ...new Set(companies.map((company) => company.sector)),
  ].sort();
  const themes = Array.from(
    new Map(
      companies.map((company) => [
        company.themeId,
        { id: company.themeId, name: company.themeName },
      ]),
    ).values(),
  ).sort((a, b) => a.name.localeCompare(b.name));

  function updateFilter<Key extends keyof ScreenerFilters>(
    key: Key,
    value: ScreenerFilters[Key],
  ) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="mt-8 grid gap-6 2xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="h-fit rounded-3xl border border-slate-700/70 bg-[#07111f] p-5 2xl:sticky 2xl:top-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Research filters</h2>
          <button
            className="text-xs font-semibold text-cyan-300 transition hover:text-cyan-200"
            type="button"
            onClick={() => setFilters(defaultScreenerFilters)}
          >
            Reset all
          </button>
        </div>

        <label className="mt-5 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          Company or ticker
          <input
            className="mt-2 w-full rounded-xl border border-slate-700 bg-[#020817] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60"
            type="search"
            placeholder="Search universe"
            value={filters.query}
            onChange={(event) => updateFilter("query", event.target.value)}
          />
        </label>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Decision
          </p>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {(["all", "long", "watch", "short"] as const).map((decision) => (
              <button
                key={decision}
                type="button"
                onClick={() => updateFilter("decision", decision)}
                className={`rounded-xl border px-2 py-2 text-xs font-bold uppercase transition ${
                  filters.decision === decision
                    ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-200"
                    : "border-slate-700 text-slate-400 hover:border-slate-500"
                }`}
              >
                {decision}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          {[
            [
              "Sector",
              "sector",
              sectors.map((sector) => ({ id: sector, name: sector })),
            ],
            ["MBIE theme", "themeId", themes],
          ].map(([label, key, options]) => (
            <label
              key={String(key)}
              className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400"
            >
              {String(label)}
              <select
                className="mt-2 w-full rounded-xl border border-slate-700 bg-[#020817] px-3 py-2.5 text-sm normal-case tracking-normal text-white outline-none focus:border-cyan-400/60"
                value={filters[key as "sector" | "themeId"]}
                onChange={(event) =>
                  updateFilter(key as "sector" | "themeId", event.target.value)
                }
              >
                <option value="all">All</option>
                {(options as { id: string; name: string }[]).map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        <div className="mt-6 space-y-5 border-t border-slate-800 pt-5">
          <RangeFilter
            label="TodayScore"
            value={filters.minimumTodayScore}
            onChange={(value) => updateFilter("minimumTodayScore", value)}
          />
          <RangeFilter
            label="Quality"
            value={filters.minimumQuality}
            onChange={(value) => updateFilter("minimumQuality", value)}
          />
          <RangeFilter
            label="Value"
            value={filters.minimumValue}
            onChange={(value) => updateFilter("minimumValue", value)}
          />
          <RangeFilter
            label="Momentum"
            value={filters.minimumMomentum}
            onChange={(value) => updateFilter("minimumMomentum", value)}
          />
          <RangeFilter
            label="Theme confidence"
            value={filters.minimumThemeConfidence}
            onChange={(value) => updateFilter("minimumThemeConfidence", value)}
          />
          <RangeFilter
            label="Historical success"
            value={filters.minimumHistoricalSuccessRate}
            onChange={(value) =>
              updateFilter("minimumHistoricalSuccessRate", value)
            }
          />
        </div>
      </aside>

      <section className="min-w-0">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-700/70 bg-[#07111f] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              Matches
            </p>
            <p className="mt-2 text-3xl font-black text-white">
              {filteredCompanies.length}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-emerald-300/70">
              Long candidates
            </p>
            <p className="mt-2 text-3xl font-black text-emerald-300">
              {
                filteredCompanies.filter(
                  (company) => company.decision === "long",
                ).length
              }
            </p>
          </div>
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/[0.06] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-rose-300/70">
              Short candidates
            </p>
            <p className="mt-2 text-3xl font-black text-rose-300">
              {
                filteredCompanies.filter(
                  (company) => company.decision === "short",
                ).length
              }
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-3xl border border-slate-700/70 bg-[#07111f]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left text-sm">
              <thead className="border-b border-slate-800 bg-[#0a1626] text-[11px] uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="px-5 py-4">Rank / company</th>
                  <th className="px-3 py-4">Decision</th>
                  <th className="px-2 py-4 text-center">
                    <span className="block">Today</span>
                    <span className="block">Score</span>
                  </th>
                  <th className="px-3 py-4">Quality</th>
                  <th className="px-3 py-4">Value</th>
                  <th className="px-3 py-4">Momentum</th>
                  <th className="px-3 py-4">MBIE theme</th>
                  <th className="px-3 py-4">Confidence</th>
                  <th className="px-5 py-4">Success rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredCompanies.map((company, index) => {
                  const reportHref = `/screener/${encodeURIComponent(company.ticker.toLowerCase())}`;

                  return (
                    <tr
                      key={company.companyId}
                      role="link"
                      tabIndex={0}
                      aria-label={`Open ${company.companyName} TodayScore report`}
                      className="group cursor-pointer transition hover:bg-white/[0.035] focus:bg-white/[0.035] focus:outline-none"
                      onClick={(event) => {
                        if (
                          (event.target as HTMLElement).closest(
                            "a, button, input, select",
                          )
                        ) {
                          return;
                        }

                        router.push(reportHref);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          router.push(reportHref);
                        }
                      }}
                    >
                      <td className="min-w-[190px] px-4 py-5">
                        <div className="flex items-center gap-3">
                          <span className="w-5 text-xs font-bold text-slate-600">
                            {index + 1}
                          </span>

                          <div className="min-w-0 flex-1">
                            <Link
                              href={reportHref}
                              className="font-bold text-white underline-offset-4 hover:text-cyan-200 hover:underline"
                            >
                              {company.companyName}
                            </Link>
                            <p className="mt-1 text-xs text-slate-500">
                              {company.ticker} · {company.sector} ·{" "}
                              {company.industry}
                            </p>
                            <Link
                              href={reportHref}
                              className="mt-2 inline-flex text-xs font-bold text-cyan-300 underline underline-offset-4"
                            >
                              View full report
                            </Link>
                          </div>
                          <span
                            aria-hidden="true"
                            className="text-lg text-slate-600 transition group-hover:text-cyan-300"
                          >
                            →
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-5">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black uppercase ${decisionStyles[company.decision]}`}
                        >
                          {company.decision}
                        </span>
                      </td>
                      <td className="px-2 py-5 text-center text-lg">
                        <ScoreCell value={company.result.todayScore.score} />
                      </td>
                      <td className="px-3 py-5">
                        <ScoreCell value={company.result.todayScore.quality} />
                      </td>
                      <td className="px-3 py-5">
                        <ScoreCell value={company.result.todayScore.value} />
                      </td>
                      <td className="px-3 py-5">
                        <ScoreCell value={company.result.todayScore.momentum} />
                      </td>
                      <td className="px-3 py-5">
                        <p className="font-medium text-slate-200">
                          {company.themeName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {company.result.classification.band}
                        </p>
                      </td>
                      <td className="px-3 py-5 font-semibold text-cyan-300">
                        {company.themeConfidence}%
                      </td>
                      <td className="px-5 py-5">
                        <p className="font-semibold text-white">
                          {company.historicalSuccessRate === undefined
                            ? "Not measured"
                            : `${company.historicalSuccessRate}%`}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {company.completedOutcomes} completed
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredCompanies.length === 0 && (
            <div className="px-6 py-16 text-center">
              <p className="font-semibold text-white">
                No companies match this research cohort.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Lower a threshold or reset the filters to widen the universe.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
