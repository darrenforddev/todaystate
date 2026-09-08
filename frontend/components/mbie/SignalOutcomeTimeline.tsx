"use client";

import { useMemo, useState } from "react";

import type { ThemeValidationPreview } from "@/engine/outcomes/themeValidation";

import type {
  ThemeHorizonOutcome,
  ThemeSignalDirection,
} from "@/engine/outcomes/themeOutcomeBuilder";

import type { OutcomeHorizon } from "@/engine/outcomes/types";

interface SignalOutcomeTimelineProps {
  previews: ThemeValidationPreview[];
}

interface HorizonDefinition {
  horizon: OutcomeHorizon;
  label: string;
}

const HORIZONS: HorizonDefinition[] = [
  {
    horizon: "one-month",
    label: "1 Month",
  },
  {
    horizon: "three-month",
    label: "3 Months",
  },
  {
    horizon: "six-month",
    label: "6 Months",
  },
  {
    horizon: "twelve-month",
    label: "12 Months",
  },
];

function formatReportPeriod(reportPeriod: string): string {
  const date = new Date(`${reportPeriod}-01T00:00:00Z`);

  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function getDirectionStyles(direction: ThemeSignalDirection): string {
  if (direction === "positive") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
  }

  if (direction === "negative") {
    return "border-rose-400/30 bg-rose-400/10 text-rose-300";
  }

  return "border-amber-400/30 bg-amber-400/10 text-amber-300";
}

function getDirectionArrow(direction: ThemeSignalDirection): string {
  if (direction === "positive") {
    return "▲";
  }

  if (direction === "negative") {
    return "▼";
  }

  return "◆";
}

function getOutcomeStyles(outcome: ThemeHorizonOutcome): string {
  if (outcome.status === "successful") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
  }

  if (outcome.status === "unsuccessful") {
    return "border-rose-400/30 bg-rose-400/10 text-rose-300";
  }

  if (outcome.status === "inconclusive") {
    return "border-amber-400/30 bg-amber-400/10 text-amber-300";
  }

  return "border-slate-700 bg-slate-900/60 text-slate-500";
}

function getOutcomeLabel(outcome: ThemeHorizonOutcome): string {
  if (outcome.status === "pending") {
    return "Pending";
  }

  if (outcome.relativeReturn === undefined) {
    return outcome.status;
  }

  const sign = outcome.relativeReturn > 0 ? "+" : "";

  return `${sign}` + `${outcome.relativeReturn.toFixed(1)}%`;
}

function getOutcomeDescription(outcome: ThemeHorizonOutcome): string {
  if (outcome.status === "pending") {
    return `Pending until ` + `${outcome.measurementDate}`;
  }

  return [
    outcome.status,
    outcome.reviewedAt ? `Reviewed ${outcome.reviewedAt}` : null,
    outcome.instrumentReturn !== undefined
      ? `Instrument ${outcome.instrumentReturn.toFixed(2)}%`
      : null,
    outcome.benchmarkReturn !== undefined
      ? `Benchmark ${outcome.benchmarkReturn.toFixed(2)}%`
      : null,
  ]
    .filter(Boolean)
    .join(". ");
}

function findOutcome(
  preview: ThemeValidationPreview,
  horizon: OutcomeHorizon,
): ThemeHorizonOutcome {
  const outcome = preview.record.outcomes.find(
    (candidate) => candidate.horizon === horizon,
  );

  if (!outcome) {
    return {
      horizon,
      measurementDate: preview.marketEntryDate,
      status: "pending",
    };
  }

  return outcome;
}

export default function SignalOutcomeTimeline({
  previews,
}: SignalOutcomeTimelineProps) {
  const instruments = useMemo(
    () =>
      Array.from(
        new Map(
          previews.map((preview) => [
            preview.record.signal.instrumentId,

            {
              id: preview.record.signal.instrumentId,

              ticker: preview.record.signal.instrumentTicker,

              name: preview.record.signal.instrumentName,
            },
          ]),
        ).values(),
      ),
    [previews],
  );

  const [selectedInstrumentId, setSelectedInstrumentId] = useState(
    instruments[0]?.id ?? "all",
  );

  const visiblePreviews =
    selectedInstrumentId === "all"
      ? previews
      : previews.filter(
          (preview) =>
            preview.record.signal.instrumentId === selectedInstrumentId,
        );

  const orderedPreviews = [...visiblePreviews].sort((left, right) =>
    left.record.signal.reportPeriod.localeCompare(
      right.record.signal.reportPeriod,
    ),
  );

  const selectedInstrument = instruments.find(
    (instrument) => instrument.id === selectedInstrumentId,
  );

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-cyan-400/20 bg-[#071321]">
      <div className="border-b border-slate-800 px-6 py-6 sm:px-8">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
          Outcome Timeline
        </p>

        <h3 className="mt-2 text-xl font-black text-white">
          Signal Performance by Reporting Month
        </h3>

        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
          Each row connects the original MBIE signal to its corresponding
          investment instrument and subsequent relative performance against the
          benchmark.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {instruments.map((instrument) => (
            <button
              key={instrument.id}
              type="button"
              onClick={() => setSelectedInstrumentId(instrument.id)}
              title={instrument.name}
              className={`min-h-10 rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-wider transition ${
                selectedInstrumentId === instrument.id
                  ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-300"
                  : "border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-500 hover:text-white"
              }`}
            >
              {instrument.ticker}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setSelectedInstrumentId("all")}
            className={`min-h-10 rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-wider transition ${
              selectedInstrumentId === "all"
                ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-300"
                : "border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-500 hover:text-white"
            }`}
          >
            All
          </button>
        </div>

        <p className="mt-4 text-sm text-slate-400" aria-live="polite">
          {selectedInstrument
            ? `Showing ${selectedInstrument.name} (${selectedInstrument.ticker})`
            : `Showing all ${instruments.length} validation instruments`}
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1120px]">
          <div className="grid grid-cols-[130px_225px_250px_repeat(4,120px)] gap-3 border-b border-slate-800 bg-slate-900/70 px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">
            <span>Report</span>

            <span>MBIE Signal</span>

            <span>Instrument</span>

            {HORIZONS.map((item) => (
              <span key={item.horizon} className="text-center">
                {item.label}
              </span>
            ))}
          </div>

          {orderedPreviews.map((preview) => {
            const signal = preview.record.signal;

            return (
              <article
                key={signal.signalId}
                className="grid grid-cols-[130px_225px_250px_repeat(4,120px)] gap-3 border-b border-slate-800/80 px-6 py-5 last:border-b-0 hover:bg-slate-900/30"
              >
                <div>
                  <p className="font-black text-white">
                    {formatReportPeriod(signal.reportPeriod)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Signal {signal.signalDate}
                  </p>
                </div>

                <div>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${getDirectionStyles(
                      signal.direction,
                    )}`}
                  >
                    {getDirectionArrow(signal.direction)} {preview.signalLabel}
                  </span>

                  <div className="mt-3 flex gap-4 text-xs">
                    <span className="text-slate-400">
                      Conviction{" "}
                      <strong className="text-white">
                        {signal.conviction}
                      </strong>
                    </span>

                    <span className="text-slate-400">
                      Confidence{" "}
                      <strong className="text-white">
                        {signal.confidence}%
                      </strong>
                    </span>
                  </div>
                </div>

                <div>
                  <p className="font-black text-white">
                    {signal.instrumentTicker}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {signal.instrumentName}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Against{" "}
                    <strong className="text-slate-300">
                      {signal.benchmarkTicker}
                    </strong>
                    {" · "}
                    {signal.benchmarkName}
                  </p>
                </div>

                {HORIZONS.map((item) => {
                  const outcome = findOutcome(preview, item.horizon);

                  return (
                    <div
                      key={item.horizon}
                      title={getOutcomeDescription(outcome)}
                      className={`flex min-h-20 flex-col items-center justify-center rounded-xl border px-2 py-3 text-center ${getOutcomeStyles(
                        outcome,
                      )}`}
                    >
                      <span className="text-base font-black">
                        {getOutcomeLabel(outcome)}
                      </span>

                      <span className="mt-1 text-[10px] font-bold uppercase tracking-wider opacity-80">
                        {outcome.status}
                      </span>
                    </div>
                  );
                })}
              </article>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-800 px-6 py-5 sm:px-8">
        <div className="flex flex-wrap gap-4 text-xs font-bold">
          <span className="text-emerald-300">● Successful</span>

          <span className="text-rose-300">● Unsuccessful</span>

          <span className="text-amber-300">● Inconclusive</span>

          <span className="text-slate-500">● Pending</span>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          Figures show the instrument&apos;s percentage-point return relative to
          its benchmark. Hover over an outcome for its review date and the
          individual instrument and benchmark returns.
        </p>
      </div>
    </section>
  );
}
