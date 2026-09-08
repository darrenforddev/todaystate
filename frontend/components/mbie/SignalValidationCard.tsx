"use client";

import { useMemo, useState } from "react";

import SignalValidationCharts from "./SignalValidationCharts";

import SignalOutcomeTimeline from "./SignalOutcomeTimeline";

import type { ThemeValidationPreview } from "@/engine/outcomes/themeValidation";

import {
  buildThemeValidationSummary,
  type ThemeValidationSummary,
} from "@/engine/outcomes/themeValidationSummary";

interface ValidationApiResponse {
  success: boolean;
  summary?: ThemeValidationSummary;
  previews?: ThemeValidationPreview[];
  message?: string;

  marketData?: {
    provider: string;
    adjustedPrices: boolean;
    instrumentCount?: number;
    fetchedAt: string;
  };
}

function formatHorizon(horizon: string): string {
  return horizon
    .replace("-", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatAccuracy(successRate: number | null): string {
  if (successRate === null) {
    return "Pending";
  }

  return `${successRate.toFixed(1)}%`;
}

function getAccuracyStyle(successRate: number | null): string {
  if (successRate === null) {
    return "text-slate-400";
  }

  if (successRate >= 60) {
    return "text-emerald-300";
  }

  if (successRate >= 40) {
    return "text-amber-300";
  }

  return "text-rose-300";
}

export default function SignalValidationCard() {
  const [summary, setSummary] = useState<ThemeValidationSummary | null>(null);

  const [previews, setPreviews] = useState<ThemeValidationPreview[]>([]);

  const [selectedInstrumentId, setSelectedInstrumentId] = useState("all");

  const [providerName, setProviderName] = useState<string | null>(null);

  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activePreviews = useMemo(
    () =>
      selectedInstrumentId === "all"
        ? previews
        : previews.filter(
            (preview) =>
              preview.record.signal.instrumentId === selectedInstrumentId,
          ),
    [previews, selectedInstrumentId],
  );

  const activeSummary = useMemo(() => {
    if (!summary) {
      return null;
    }

    if (selectedInstrumentId === "all") {
      return summary;
    }

    return buildThemeValidationSummary(activePreviews);
  }, [activePreviews, selectedInstrumentId, summary]);

  const selectedInstrument = previews.find(
    (preview) => preview.record.signal.instrumentId === selectedInstrumentId,
  )?.record.signal;

  const viewLabel =
    selectedInstrumentId === "all"
      ? "Combined instrument view"
      : selectedInstrument
        ? `${selectedInstrument.instrumentName} (${selectedInstrument.instrumentTicker})`
        : "Selected instrument";

  async function runValidation() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/dev/theme-validation", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          reportPeriod: "all",
        }),
      });

      const result = (await response.json()) as ValidationApiResponse;

      if (!response.ok || !result.success || !result.summary) {
        throw new Error(
          result.message ?? "Signal validation could not be completed.",
        );
      }

      const nextPreviews = result.previews ?? [];

      setSummary(result.summary);

      setPreviews(nextPreviews);

      setSelectedInstrumentId(
        nextPreviews[0]?.record.signal.instrumentId ?? "all",
      );

      setProviderName(result.marketData?.provider ?? null);

      setFetchedAt(result.marketData?.fetchedAt ?? null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Signal validation could not be completed.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
            Signal Validation
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            Industrial Recovery Outcomes
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Tests whether historical MBIE signals were followed by the expected
            relative performance of industrial ETFs and companies against SPY.
          </p>
        </div>

        <button
          type="button"
          onClick={runValidation}
          disabled={isLoading}
          className="min-h-11 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-cyan-300 transition hover:bg-cyan-400/20 disabled:cursor-wait disabled:opacity-60"
        >
          {isLoading
            ? "Running..."
            : summary
              ? "Refresh validation"
              : "Run validation"}
        </button>
      </div>

      {errorMessage && (
        <div className="mt-6 rounded-2xl border border-rose-400/30 bg-rose-400/10 p-5">
          <p className="text-sm font-bold text-rose-300">{errorMessage}</p>
        </div>
      )}

      {!summary && !errorMessage && (
        <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/50 p-6">
          <p className="text-sm leading-6 text-slate-400">
            Run validation to fetch adjusted prices for the configured
            industrial instruments and SPY, then evaluate every available
            reporting period. Provider data is requested only when you press the
            button.
          </p>
        </div>
      )}

      {summary && activeSummary && (
        <>
          <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
                Active validation view
              </p>

              <p
                className="mt-1 text-sm font-bold text-white"
                aria-live="polite"
              >
                {viewLabel}
              </p>
            </div>

            <span className="rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-xs font-bold text-slate-300">
              {activeSummary.instrumentCount}{" "}
              {activeSummary.instrumentCount === 1
                ? "instrument"
                : "instruments"}
            </span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Decisive accuracy
              </p>

              <p
                className={`mt-2 text-4xl font-black ${getAccuracyStyle(
                  activeSummary.overall.successRate,
                )}`}
              >
                {formatAccuracy(activeSummary.overall.successRate)}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Successful
              </p>

              <p className="mt-2 text-3xl font-black text-emerald-300">
                {activeSummary.overall.successful}
              </p>
            </div>

            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/5 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Unsuccessful
              </p>

              <p className="mt-2 text-3xl font-black text-rose-300">
                {activeSummary.overall.unsuccessful}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Inconclusive
              </p>

              <p className="mt-2 text-3xl font-black text-amber-300">
                {activeSummary.overall.inconclusive}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-600 bg-slate-900/50 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pending
              </p>

              <p className="mt-2 text-3xl font-black text-slate-300">
                {activeSummary.overall.pending}
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-700">
            <div className="grid grid-cols-4 gap-3 bg-slate-900/80 px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-500">
              <span>Horizon</span>

              <span className="text-right">Decisive</span>

              <span className="text-right">Pending</span>

              <span className="text-right">Accuracy</span>
            </div>

            {activeSummary.byHorizon.map((item) => (
              <div
                key={item.horizon}
                className="grid grid-cols-4 gap-3 border-t border-slate-800 px-4 py-4 text-sm"
              >
                <span className="font-bold text-white">
                  {formatHorizon(item.horizon)}
                </span>

                <span className="text-right text-slate-300">
                  {item.decisive}
                </span>

                <span className="text-right text-slate-400">
                  {item.pending}
                </span>

                <span
                  className={`text-right font-black ${getAccuracyStyle(
                    item.successRate,
                  )}`}
                >
                  {formatAccuracy(item.successRate)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">
              Early validation evidence
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              This is a small and overlapping historical sample. Results measure
              each industrial instrument relative to SPY and do not by
              themselves prove or disprove the underlying economic evidence.
              Relative movements within one percentage point are classified as
              inconclusive.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
            <span>{activeSummary.periodCount} reporting periods</span>

            <span>{activeSummary.overall.completed} completed outcomes</span>

            <span>{activeSummary.overall.decisive} decisive outcomes</span>

            {providerName && <span>Source: {providerName}</span>}

            {fetchedAt && (
              <span>
                Retrieved:{" "}
                {new Date(fetchedAt).toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            )}
          </div>

          {previews.length > 0 && (
            <>
              <SignalValidationCharts
                previews={previews}
                selectedInstrumentId={selectedInstrumentId}
              />

              <SignalOutcomeTimeline
                previews={previews}
                selectedInstrumentId={selectedInstrumentId}
                onInstrumentChange={setSelectedInstrumentId}
              />
            </>
          )}
        </>
      )}
    </section>
  );
}
