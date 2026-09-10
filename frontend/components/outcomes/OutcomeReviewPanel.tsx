"use client";

import { useEffect, useMemo, useState } from "react";

import { isOutcomeDue } from "@/engine/outcomes/outcomeReview";

import type {
  OutcomeExplanationCause,
  SelectionOutcomeRecord,
} from "@/engine/outcomes/types";

interface OutcomeReviewPanelProps {
  records: SelectionOutcomeRecord[];
  asOfDate: string;
  onReviewSaved?: () => void | Promise<void>;
}

interface PendingReview {
  record: SelectionOutcomeRecord;
  outcome: SelectionOutcomeRecord["outcomes"][number];
}

interface ReviewApiResponse {
  success: boolean;
  error?: string;
}

interface HistoricalPriceResponse {
  marketDate: string;
  close: number;
  providerName: string;
}

interface ReviewPricesApiResponse {
  success: boolean;
  measurementDate?: string;
  companyPrice?: HistoricalPriceResponse;
  benchmarkPrice?: HistoricalPriceResponse;
  error?: string;
}

interface CauseOption {
  value: OutcomeExplanationCause;
  label: string;
}

const CAUSE_OPTIONS: CauseOption[] = [
  { value: "theme", label: "Theme development" },
  { value: "market", label: "Market conditions" },
  { value: "company", label: "Company-specific result" },
  { value: "today-score", label: "TodayScore factors" },
  { value: "macro", label: "Macroeconomic conditions" },
  { value: "timing", label: "Signal timing" },
  { value: "unexpected-event", label: "Unexpected event" },
  { value: "insufficient-evidence", label: "Insufficient evidence" },
];

function formatHorizon(horizon: string): string {
  return horizon
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function readLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function OutcomeReviewPanel({
  records,
  asOfDate,
  onReviewSaved,
}: OutcomeReviewPanelProps) {
  const dueReviews = useMemo<PendingReview[]>(
    () =>
      records.flatMap((record) =>
        record.outcomes
          .filter(
            (outcome) =>
              outcome.status === "pending" &&
              isOutcomeDue(outcome.measurementDate, asOfDate),
          )
          .map((outcome) => ({ record, outcome })),
      ),
    [records, asOfDate],
  );

  const [selectedKey, setSelectedKey] = useState("");
  const [companyReviewPrice, setCompanyReviewPrice] = useState("");
  const [benchmarkReviewPrice, setBenchmarkReviewPrice] = useState("");
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [priceMessage, setPriceMessage] = useState("");
  const [priceWarning, setPriceWarning] = useState("");
  const [explanationCause, setExplanationCause] =
    useState<OutcomeExplanationCause>("insufficient-evidence");
  const [explanationNotes, setExplanationNotes] = useState("");
  const [unexpectedEvents, setUnexpectedEvents] = useState("");
  const [lessons, setLessons] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (dueReviews.length === 0) {
      setSelectedKey("");
      return;
    }

    const selectedStillExists = dueReviews.some(
      ({ record, outcome }) =>
        `${record.selection.selectionId}:${outcome.horizon}` === selectedKey,
    );

    if (!selectedStillExists) {
      const firstReview = dueReviews[0];

      setSelectedKey(
        `${firstReview.record.selection.selectionId}:${firstReview.outcome.horizon}`,
      );
    }
  }, [dueReviews, selectedKey]);

  const selectedReview =
    dueReviews.find(
      ({ record, outcome }) =>
        `${record.selection.selectionId}:${outcome.horizon}` === selectedKey,
    ) ?? null;

  useEffect(() => {
    setCompanyReviewPrice("");
    setBenchmarkReviewPrice("");
    setPriceMessage("");
    setPriceWarning("");

    const reviewToLoad = selectedReview;

    if (!reviewToLoad) {
      setIsLoadingPrices(false);
      return;
    }

    const selectionToLoad = reviewToLoad.record.selection;

    const outcomeToLoad = reviewToLoad.outcome;

    const controller = new AbortController();

    async function loadReviewPrices(): Promise<void> {
      setIsLoadingPrices(true);

      try {
        const parameters = new URLSearchParams({
          selectionId: selectionToLoad.selectionId,
          horizon: outcomeToLoad.horizon,
        });

        const response = await fetch(
          `/api/selection-outcomes/review-prices?${parameters.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const result = (await response.json()) as ReviewPricesApiResponse;

        if (
          !response.ok ||
          !result.success ||
          !result.companyPrice ||
          !result.benchmarkPrice
        ) {
          throw new Error(
            result.error ?? "Automatic review prices could not be loaded.",
          );
        }

        setCompanyReviewPrice(String(result.companyPrice.close));
        setBenchmarkReviewPrice(String(result.benchmarkPrice.close));
        setPriceMessage(
          `Prices loaded from ${result.companyPrice.providerName}. ` +
            `${selectionToLoad.ticker}: ` +
            `${result.companyPrice.marketDate}; ` +
            `${selectionToLoad.benchmarkTicker ?? "benchmark"}: ` +
            `${result.benchmarkPrice.marketDate}.`,
        );
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setPriceWarning(
          (error instanceof Error
            ? error.message
            : "Automatic review prices could not be loaded.") +
            " Enter the two prices manually.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingPrices(false);
        }
      }
    }

    void loadReviewPrices();

    return () => {
      controller.abort();
    };
  }, [selectedReview]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!selectedReview) {
      setErrorMessage("Select a due outcome to review.");
      return;
    }

    const companyPrice = Number(companyReviewPrice);
    const benchmarkPrice = Number(benchmarkReviewPrice);

    if (!Number.isFinite(companyPrice) || companyPrice <= 0) {
      setErrorMessage("Enter a valid company review price.");
      return;
    }

    if (!Number.isFinite(benchmarkPrice) || benchmarkPrice <= 0) {
      setErrorMessage("Enter a valid benchmark review price.");
      return;
    }

    if (
      explanationCause !== "insufficient-evidence" &&
      !explanationNotes.trim()
    ) {
      setErrorMessage("Add explanation notes for the selected cause.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/selection-outcomes/review", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectionId: selectedReview.record.selection.selectionId,
          horizon: selectedReview.outcome.horizon,
          companyReviewPrice: companyPrice,
          benchmarkReviewPrice: benchmarkPrice,
          reviewedAt: asOfDate,
          explanationCause,
          explanationNotes: explanationNotes.trim(),
          unexpectedEvents: readLines(unexpectedEvents),
          lessons: readLines(lessons),
        }),
      });

      const result = (await response.json()) as ReviewApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ?? "The outcome review could not be saved.",
        );
      }

      setCompanyReviewPrice("");
      setBenchmarkReviewPrice("");
      setExplanationCause("insufficient-evidence");
      setExplanationNotes("");
      setUnexpectedEvents("");
      setLessons("");
      setSuccessMessage(
        `${selectedReview.record.selection.companyName} ${formatHorizon(
          selectedReview.outcome.horizon,
        )} review saved successfully.`,
      );

      if (onReviewSaved) {
        await onReviewSaved();
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The outcome review could not be saved.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="mt-8 rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
          Outcome Review
        </p>
        <h2 className="mt-2 text-2xl font-bold text-white">
          Due Selection Reviews
        </h2>
        <p className="mt-2 text-slate-400">
          Market prices are retrieved automatically for the measurement date.
          Manual entry remains available when provider coverage is unavailable.
        </p>
      </div>

      {dueReviews.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950/40 p-5">
          <p className="font-semibold text-slate-200">
            No outcome reviews are due.
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Pending reviews will appear here when their measurement dates are
            reached.
          </p>
        </div>
      ) : (
        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              className="mb-2 block text-sm font-semibold text-slate-200"
              htmlFor="outcome-review"
            >
              Due outcome
            </label>
            <select
              id="outcome-review"
              value={selectedKey}
              onChange={(event) => {
                setSelectedKey(event.target.value);
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            >
              {dueReviews.map(({ record, outcome }) => {
                const key = `${record.selection.selectionId}:${outcome.horizon}`;

                return (
                  <option key={key} value={key}>
                    {record.selection.companyName}
                    {" — "}
                    {formatHorizon(outcome.horizon)}
                    {" — due "}
                    {outcome.measurementDate}
                  </option>
                );
              })}
            </select>
          </div>

          {selectedReview && (
            <div className="grid gap-4 rounded-2xl border border-slate-700 bg-slate-950/40 p-5 md:grid-cols-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Decision
                </p>
                <p className="mt-1 font-semibold capitalize text-white">
                  {selectedReview.record.selection.decision}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Company entry
                </p>
                <p className="mt-1 font-semibold text-white">
                  {selectedReview.record.selection.entryPrice}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Benchmark
                </p>
                <p className="mt-1 font-semibold text-white">
                  {selectedReview.record.selection.benchmarkName}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Benchmark entry
                </p>
                <p className="mt-1 font-semibold text-white">
                  {selectedReview.record.selection.benchmarkEntryPrice}
                </p>
              </div>
            </div>
          )}

          {isLoadingPrices && (
            <p className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-3 text-sm text-cyan-200">
              Retrieving company and benchmark prices…
            </p>
          )}

          {!isLoadingPrices && priceMessage && (
            <p className="rounded-xl border border-emerald-400/25 bg-emerald-400/[0.07] px-4 py-3 text-sm text-emerald-300">
              {priceMessage}
            </p>
          )}

          {!isLoadingPrices && priceWarning && (
            <p className="rounded-xl border border-amber-300/25 bg-amber-300/[0.07] px-4 py-3 text-sm leading-6 text-amber-200">
              {priceWarning}
            </p>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                className="mb-2 block text-sm font-semibold text-slate-200"
                htmlFor="company-review-price"
              >
                Company review price
              </label>
              <input
                id="company-review-price"
                type="number"
                min="0.000001"
                step="any"
                value={companyReviewPrice}
                onChange={(event) => setCompanyReviewPrice(event.target.value)}
                placeholder={
                  isLoadingPrices
                    ? "Loading market price…"
                    : "Enter company price"
                }
                disabled={isLoadingPrices}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400 disabled:cursor-wait disabled:opacity-60"
              />
            </div>
            <div>
              <label
                className="mb-2 block text-sm font-semibold text-slate-200"
                htmlFor="benchmark-review-price"
              >
                Benchmark review price
              </label>
              <input
                id="benchmark-review-price"
                type="number"
                min="0.000001"
                step="any"
                value={benchmarkReviewPrice}
                onChange={(event) =>
                  setBenchmarkReviewPrice(event.target.value)
                }
                placeholder={
                  isLoadingPrices
                    ? "Loading market price…"
                    : "Enter benchmark price"
                }
                disabled={isLoadingPrices}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400 disabled:cursor-wait disabled:opacity-60"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-950/40 p-5">
            <div>
              <h3 className="font-semibold text-white">Outcome explanation</h3>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                Record the evidence available at the review date. Use one line
                per unexpected event or lesson.
              </p>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label
                  className="mb-2 block text-sm font-semibold text-slate-200"
                  htmlFor="explanation-cause"
                >
                  Primary cause
                </label>
                <select
                  id="explanation-cause"
                  value={explanationCause}
                  onChange={(event) =>
                    setExplanationCause(
                      event.target.value as OutcomeExplanationCause,
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                >
                  {CAUSE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="mb-2 block text-sm font-semibold text-slate-200"
                  htmlFor="explanation-notes"
                >
                  Explanation notes
                </label>
                <textarea
                  id="explanation-notes"
                  rows={4}
                  value={explanationNotes}
                  onChange={(event) => setExplanationNotes(event.target.value)}
                  placeholder="Explain why the prediction worked or failed"
                  className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label
                  className="mb-2 block text-sm font-semibold text-slate-200"
                  htmlFor="unexpected-events"
                >
                  Unexpected events
                </label>
                <textarea
                  id="unexpected-events"
                  rows={4}
                  value={unexpectedEvents}
                  onChange={(event) => setUnexpectedEvents(event.target.value)}
                  placeholder="One event per line"
                  className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                />
              </div>
              <div>
                <label
                  className="mb-2 block text-sm font-semibold text-slate-200"
                  htmlFor="outcome-lessons"
                >
                  Lessons learned
                </label>
                <textarea
                  id="outcome-lessons"
                  rows={4}
                  value={lessons}
                  onChange={(event) => setLessons(event.target.value)}
                  placeholder="One lesson per line"
                  className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {errorMessage && (
            <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {errorMessage}
            </p>
          )}

          {successMessage && (
            <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={
              isSaving ||
              isLoadingPrices ||
              !selectedReview ||
              !companyReviewPrice ||
              !benchmarkReviewPrice
            }
            className="min-h-11 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-cyan-300 transition hover:bg-cyan-400/20 disabled:cursor-wait disabled:opacity-60"
          >
            {isSaving ? "Saving…" : "Complete review"}
          </button>
        </form>
      )}
    </section>
  );
}
