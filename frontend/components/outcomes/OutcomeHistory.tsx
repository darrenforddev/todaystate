"use client";

import { useMemo, useState } from "react";

import {
  filterOutcomeHistory,
  getOutcomeHistorySummary,
  getSuccessRate,
} from "@/engine/outcomes/outcomeHistory";

import type {
  OutcomeHorizon,
  OutcomeStatus,
  SelectionOutcomeRecord,
} from "@/engine/outcomes/types";

interface OutcomeHistoryProps {
  records: SelectionOutcomeRecord[];
}

type StatusFilter =
  | "all"
  | "successful"
  | "unsuccessful"
  | "inconclusive"
  | "pending";

type DecisionFilter = "all" | "long" | "short";

const horizonOptions: {
  value: OutcomeHorizon;
  label: string;
}[] = [
  { value: "one-month", label: "1 Month" },
  { value: "three-month", label: "3 Months" },
  { value: "six-month", label: "6 Months" },
  { value: "twelve-month", label: "12 Months" },
];

function formatReturn(value?: number): string {
  if (value === undefined) {
    return "Pending";
  }

  return `${value > 0 ? "+" : ""}${value}%`;
}

function parseOptionalNumber(value: string): number | undefined {
  if (value.trim() === "") {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
}

export default function OutcomeHistory({ records }: OutcomeHistoryProps) {
  const [selectedHorizon, setSelectedHorizon] =
    useState<OutcomeHorizon>("twelve-month");

  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("all");

  const [selectedDecision, setSelectedDecision] =
    useState<DecisionFilter>("all");

  const [minimumTodayScore, setMinimumTodayScore] = useState("");

  const [maximumTodayScore, setMaximumTodayScore] = useState("");

  const [minimumThemeConfidence, setMinimumThemeConfidence] = useState("");

  const [maximumThemeConfidence, setMaximumThemeConfidence] = useState("");

  const [selectedTheme, setSelectedTheme] = useState("all");

  const themes = useMemo(() => {
    const themeMap = new Map<string, string>();

    records.forEach((record) => {
      const { themeId, themeName } = record.selection;

      if (themeId !== undefined && themeName !== undefined) {
        themeMap.set(themeId, themeName);
      }
    });

    return Array.from(themeMap.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [records]);

  /*
   * Cohort filters deliberately exclude outcome status.
   *
   * This means the summary statistics and success rate describe
   * the entire selected research cohort, while the status buttons
   * can still narrow the visible list.
   */
  const cohortRecords = useMemo(() => {
    return filterOutcomeHistory(records, {
      decision: selectedDecision === "all" ? undefined : selectedDecision,

      minimumTodayScore: parseOptionalNumber(minimumTodayScore),

      maximumTodayScore: parseOptionalNumber(maximumTodayScore),

      minimumThemeConfidence: parseOptionalNumber(minimumThemeConfidence),

      maximumThemeConfidence: parseOptionalNumber(maximumThemeConfidence),

      themeId: selectedTheme === "all" ? undefined : selectedTheme,
    });
  }, [
    records,
    selectedDecision,
    minimumTodayScore,
    maximumTodayScore,
    minimumThemeConfidence,
    maximumThemeConfidence,
    selectedTheme,
  ]);

  const summary = useMemo(
    () => getOutcomeHistorySummary(cohortRecords, selectedHorizon),
    [cohortRecords, selectedHorizon],
  );

  const successRate = useMemo(
    () => getSuccessRate(cohortRecords, selectedHorizon),
    [cohortRecords, selectedHorizon],
  );

  const filteredRecords = useMemo(() => {
    if (selectedStatus === "all") {
      return cohortRecords;
    }

    return filterOutcomeHistory(cohortRecords, {
      horizon: selectedHorizon,
      status: selectedStatus as OutcomeStatus,
    });
  }, [cohortRecords, selectedHorizon, selectedStatus]);

  function resetFilters() {
    setSelectedStatus("all");
    setSelectedDecision("all");
    setMinimumTodayScore("");
    setMaximumTodayScore("");
    setMinimumThemeConfidence("");
    setMaximumThemeConfidence("");
    setSelectedTheme("all");
  }

  return (
    <section className="rounded-3xl border border-cyan-400/20 bg-[#07111f] p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            Historical learning
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            Outcome History
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Study how combinations of TodayScore, Theme Confidence and
            investment themes performed against their benchmarks.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-5 py-4 text-right">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            Historical success rate
          </p>

          <p className="mt-1 text-3xl font-black text-emerald-300">
            {successRate === undefined ? "Pending" : `${successRate}%`}
          </p>

          <p className="mt-1 text-xs text-slate-500">Selected cohort</p>
        </div>
      </div>

      {/* Horizon */}

      <div className="mt-8">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Measurement horizon
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {horizonOptions.map((option) => {
            const isSelected = selectedHorizon === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedHorizon(option.value)}
                className={`rounded-xl border px-4 py-2 text-sm font-bold transition ${
                  isSelected
                    ? "border-cyan-300 bg-cyan-300 text-slate-950"
                    : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-cyan-400/30 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Research filters */}

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Research filters
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Build a historical cohort and examine how it performed.
            </p>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 transition hover:border-white/20 hover:text-white"
          >
            Reset filters
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FilterField label="Decision">
            <select
              value={selectedDecision}
              onChange={(event) =>
                setSelectedDecision(event.target.value as DecisionFilter)
              }
              className="w-full rounded-xl border border-white/10 bg-[#091727] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/40"
            >
              <option value="all">All decisions</option>
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </FilterField>

          <FilterField label="Theme">
            <select
              value={selectedTheme}
              onChange={(event) => setSelectedTheme(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#091727] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/40"
            >
              <option value="all">All themes</option>

              {themes.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </select>
          </FilterField>

          <RangeFilter
            label="TodayScore"
            minimum={minimumTodayScore}
            maximum={maximumTodayScore}
            onMinimumChange={setMinimumTodayScore}
            onMaximumChange={setMaximumTodayScore}
          />

          <RangeFilter
            label="Theme Confidence"
            minimum={minimumThemeConfidence}
            maximum={maximumThemeConfidence}
            onMinimumChange={setMinimumThemeConfidence}
            onMaximumChange={setMaximumThemeConfidence}
          />
        </div>
      </div>

      {/* Summary */}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard
          label="Total"
          value={summary.total}
          colourClass="text-white"
        />

        <SummaryCard
          label="Successful"
          value={summary.successful}
          colourClass="text-emerald-300"
        />

        <SummaryCard
          label="Unsuccessful"
          value={summary.unsuccessful}
          colourClass="text-rose-300"
        />

        <SummaryCard
          label="Inconclusive"
          value={summary.inconclusive}
          colourClass="text-amber-300"
        />

        <SummaryCard
          label="Pending"
          value={summary.pending}
          colourClass="text-slate-400"
        />
      </div>

      {/* Outcome filter */}

      <div className="mt-8 flex flex-wrap gap-2">
        {[
          { value: "all", label: "All" },
          { value: "successful", label: "Successful" },
          {
            value: "unsuccessful",
            label: "Unsuccessful",
          },
          {
            value: "inconclusive",
            label: "Inconclusive",
          },
          { value: "pending", label: "Pending" },
        ].map((option) => {
          const isSelected = selectedStatus === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelectedStatus(option.value as StatusFilter)}
              className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                isSelected
                  ? "border-amber-300 bg-amber-300 text-slate-950"
                  : "border-white/10 bg-white/[0.02] text-slate-500 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Results */}

      <div className="mt-6 space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">
            No historical selections match these filters.
          </div>
        ) : (
          filteredRecords.map((record) => {
            const outcome = record.outcomes.find(
              (item) => item.horizon === selectedHorizon,
            );

            return (
              <article
                key={record.selection.selectionId}
                className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:grid-cols-[minmax(0,1fr)_auto_auto_auto]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-white">
                      {record.selection.companyName}
                    </h3>

                    <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {record.selection.decision}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {record.selection.ticker} · {record.selection.themeName}
                  </p>
                </div>

                <Metric
                  label="TodayScore"
                  value={String(record.selection.todayScore)}
                  colourClass="text-amber-300"
                />

                <Metric
                  label="Confidence"
                  value={
                    record.selection.themeConfidence === undefined
                      ? "Not scored"
                      : `${record.selection.themeConfidence}%`
                  }
                  colourClass="text-cyan-300"
                />

                <Metric
                  label="Relative"
                  value={formatReturn(outcome?.relativeReturn)}
                  colourClass={
                    outcome?.status === "successful"
                      ? "text-emerald-300"
                      : outcome?.status === "unsuccessful"
                        ? "text-rose-300"
                        : outcome?.status === "inconclusive"
                          ? "text-amber-300"
                          : "text-slate-400"
                  }
                />
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      {children}
    </div>
  );
}

function RangeFilter({
  label,
  minimum,
  maximum,
  onMinimumChange,
  onMaximumChange,
}: {
  label: string;
  minimum: string;
  maximum: string;
  onMinimumChange: (value: string) => void;
  onMaximumChange: (value: string) => void;
}) {
  return (
    <FilterField label={label}>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          min="0"
          max="100"
          placeholder="Min"
          value={minimum}
          onChange={(event) => onMinimumChange(event.target.value)}
          className="min-w-0 rounded-xl border border-white/10 bg-[#091727] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
        />

        <input
          type="number"
          min="0"
          max="100"
          placeholder="Max"
          value={maximum}
          onChange={(event) => onMaximumChange(event.target.value)}
          className="min-w-0 rounded-xl border border-white/10 bg-[#091727] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
        />
      </div>
    </FilterField>
  );
}

function SummaryCard({
  label,
  value,
  colourClass,
}: {
  label: string;
  value: number;
  colourClass: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>

      <p className={`mt-2 text-2xl font-black ${colourClass}`}>{value}</p>
    </div>
  );
}

function Metric({
  label,
  value,
  colourClass,
}: {
  label: string;
  value: string;
  colourClass: string;
}) {
  return (
    <div className="min-w-24 md:text-right">
      <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>

      <p className={`mt-1 font-black ${colourClass}`}>{value}</p>
    </div>
  );
}
