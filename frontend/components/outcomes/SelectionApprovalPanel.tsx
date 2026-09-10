"use client";

import { useEffect, useMemo, useState } from "react";

import RecordSelectionButton from "./RecordSelectionButton";

import {
  getDefaultBenchmarkId,
  getSelectionBenchmark,
} from "@/engine/outcomes/selectionBenchmarks";

import { buildSelectionApprovalDraft } from "@/engine/outcomes/selectionApprovalDraft";

import type { ApprovedSelectionInput } from "@/engine/outcomes/selectionOutcomeBuilder";

import type {
  SelectionDecision,
  SelectionOutcomeRecord,
} from "@/engine/outcomes/types";

interface SelectionCandidate {
  companyId: string;
  ticker: string;
  companyName: string;
  exchangeMic: string;
  quoteCurrency: string;

  todayScore: number;
  qualityScore: number;
  valueScore: number;
  momentumScore: number;

  themeId?: string;
  themeName?: string;
  themeScore?: number;
  themeConfidence?: number;
}

interface SelectionApprovalPanelProps {
  candidate: SelectionCandidate;
  onRecorded?: (record: SelectionOutcomeRecord) => void;
}

interface HistoricalPriceResponse {
  marketDate: string;
  close: number;
  providerName: string;
}

interface ApprovalPricesApiResponse {
  success: boolean;
  companyPrice?: HistoricalPriceResponse;
  benchmarkPrice?: HistoricalPriceResponse;
  error?: string;
}

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function parsePositiveNumber(value: string): number | undefined {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

function formatPrice(value: string, currency: string): string | null {
  const price = parsePositiveNumber(value);

  if (price === undefined) {
    return null;
  }

  switch (currency.trim().toUpperCase()) {
    case "GBX":
      return `${price.toFixed(2)}p (£${(price / 100).toFixed(2)})`;

    case "GBP":
      return `£${price.toFixed(2)}`;

    case "USD":
      return `$${price.toFixed(2)}`;

    case "EUR":
      return `€${price.toFixed(2)}`;

    default:
      return `${price.toFixed(2)} ${currency.toUpperCase()}`;
  }
}

function formatPriceInput(value: number): string {
  return String(Math.round(value * 10_000) / 10_000);
}

export default function SelectionApprovalPanel({
  candidate,
  onRecorded,
}: SelectionApprovalPanelProps) {
  const defaultBenchmarkId = getDefaultBenchmarkId(candidate.exchangeMic);

  const defaultBenchmark = getSelectionBenchmark(defaultBenchmarkId)!;

  const [decision, setDecision] = useState<SelectionDecision>("long");

  const [selectedAt, setSelectedAt] = useState(getTodayDate);

  const [entryPrice, setEntryPrice] = useState("");
  const [benchmarkId, setBenchmarkId] = useState<string>(defaultBenchmarkId);
  const [benchmarkName, setBenchmarkName] = useState(
    defaultBenchmark.companyName,
  );
  const [benchmarkTicker, setBenchmarkTicker] = useState(
    defaultBenchmark.ticker,
  );

  const [benchmarkExchangeMic, setBenchmarkExchangeMic] = useState(
    defaultBenchmark.exchangeMic,
  );

  const [benchmarkQuoteCurrency, setBenchmarkQuoteCurrency] = useState(
    defaultBenchmark.quoteCurrency,
  );
  const [benchmarkEntryPrice, setBenchmarkEntryPrice] = useState("");

  const initialDraft = buildSelectionApprovalDraft({
    ticker: candidate.ticker,
    companyName: candidate.companyName,
    decision: "long",
    todayScore: candidate.todayScore,
    qualityScore: candidate.qualityScore,
    valueScore: candidate.valueScore,
    momentumScore: candidate.momentumScore,
    benchmarkTicker: defaultBenchmark.ticker,
    themeName: candidate.themeName,
    themeConfidence: candidate.themeConfidence,
  });

  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [priceMessage, setPriceMessage] = useState("");
  const [priceWarning, setPriceWarning] = useState("");

  const [thesis, setThesis] = useState(initialDraft.thesis);
  const [risksText, setRisksText] = useState(initialDraft.risks.join("\n"));

  function applyApprovalDraft(
    nextDecision: SelectionDecision,
    nextBenchmarkTicker: string,
  ): void {
    const nextDraft = buildSelectionApprovalDraft({
      ticker: candidate.ticker,
      companyName: candidate.companyName,
      decision: nextDecision,
      todayScore: candidate.todayScore,
      qualityScore: candidate.qualityScore,
      valueScore: candidate.valueScore,
      momentumScore: candidate.momentumScore,
      benchmarkTicker: nextBenchmarkTicker,
      themeName: candidate.themeName,
      themeConfidence: candidate.themeConfidence,
    });

    setThesis(nextDraft.thesis);
    setRisksText(nextDraft.risks.join("\n"));
  }

  useEffect(() => {
    setEntryPrice("");
    setBenchmarkEntryPrice("");
    setPriceMessage("");
    setPriceWarning("");

    if (!selectedAt || !benchmarkId) {
      setIsLoadingPrices(false);
      return;
    }

    const companyToLoad = candidate;
    const benchmarkIdToLoad = benchmarkId;
    const selectedDateToLoad = selectedAt;
    const controller = new AbortController();

    async function loadApprovalPrices(): Promise<void> {
      setIsLoadingPrices(true);

      try {
        const parameters = new URLSearchParams({
          companyId: companyToLoad.companyId,
          benchmarkId: benchmarkIdToLoad,
          selectedAt: selectedDateToLoad,
        });

        const response = await fetch(
          `/api/selection-outcomes/approval-prices?${parameters.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const result = (await response.json()) as ApprovalPricesApiResponse;

        if (
          !response.ok ||
          !result.success ||
          !result.companyPrice ||
          !result.benchmarkPrice
        ) {
          throw new Error(
            result.error ?? "Automatic entry prices could not be loaded.",
          );
        }

        setEntryPrice(formatPriceInput(result.companyPrice.close));
        setBenchmarkEntryPrice(formatPriceInput(result.benchmarkPrice.close));
        setPriceMessage(
          `Prices loaded from ${result.companyPrice.providerName}. ` +
            `${companyToLoad.ticker}: ${result.companyPrice.marketDate}; ` +
            `${benchmarkTicker}: ${result.benchmarkPrice.marketDate}.`,
        );
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        setPriceWarning(
          (error instanceof Error
            ? error.message
            : "Automatic entry prices could not be loaded.") +
            " Enter the two prices manually.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingPrices(false);
        }
      }
    }

    void loadApprovalPrices();

    return () => {
      controller.abort();
    };
  }, [candidate, selectedAt, benchmarkId, benchmarkTicker]);

  const risks = useMemo(
    () =>
      risksText
        .split("\n")
        .map((risk) => risk.trim())
        .filter(Boolean),
    [risksText],
  );

  const parsedEntryPrice = parsePositiveNumber(entryPrice);

  const parsedBenchmarkEntryPrice = parsePositiveNumber(benchmarkEntryPrice);

  const validationMessages = useMemo(() => {
    const messages: string[] = [];

    if (!selectedAt) {
      messages.push("Choose the selection date.");
    }

    if (parsedEntryPrice === undefined) {
      messages.push("Enter a company price greater than zero.");
    }

    if (!benchmarkId.trim()) {
      messages.push("Enter a benchmark ID.");
    }

    if (!benchmarkName.trim()) {
      messages.push("Enter a benchmark name.");
    }

    if (!benchmarkTicker.trim()) {
      messages.push("Enter a benchmark ticker.");
    }

    if (!benchmarkExchangeMic.trim()) {
      messages.push("Enter a benchmark exchange MIC.");
    }

    if (!benchmarkQuoteCurrency.trim()) {
      messages.push("Enter a benchmark quote currency.");
    }

    if (parsedBenchmarkEntryPrice === undefined) {
      messages.push("Enter a benchmark price greater than zero.");
    }

    if (!thesis.trim()) {
      messages.push("Enter the selection thesis.");
    }

    if (risks.length === 0) {
      messages.push("Add at least one material risk.");
    }

    return messages;
  }, [
    selectedAt,
    parsedEntryPrice,
    benchmarkId,
    benchmarkName,
    benchmarkTicker,
    benchmarkExchangeMic,
    benchmarkQuoteCurrency,
    parsedBenchmarkEntryPrice,
    thesis,
    risks,
  ]);

  const approvedSelection = useMemo<ApprovedSelectionInput | null>(() => {
    if (
      validationMessages.length > 0 ||
      parsedEntryPrice === undefined ||
      parsedBenchmarkEntryPrice === undefined
    ) {
      return null;
    }

    return {
      companyId: candidate.companyId,
      ticker: candidate.ticker,
      companyName: candidate.companyName,
      exchangeMic: candidate.exchangeMic,

      quoteCurrency: candidate.quoteCurrency,

      decision,
      selectedAt,
      entryPrice: parsedEntryPrice,

      todayScore: candidate.todayScore,
      qualityScore: candidate.qualityScore,
      valueScore: candidate.valueScore,
      momentumScore: candidate.momentumScore,

      themeId: candidate.themeId,
      themeName: candidate.themeName,
      themeScore: candidate.themeScore,
      themeConfidence: candidate.themeConfidence,

      benchmarkId: benchmarkId.trim(),
      benchmarkName: benchmarkName.trim(),
      benchmarkTicker: benchmarkTicker.trim().toUpperCase(),

      benchmarkExchangeMic: benchmarkExchangeMic.trim().toUpperCase(),

      benchmarkQuoteCurrency: benchmarkQuoteCurrency.trim().toUpperCase(),
      benchmarkEntryPrice: parsedBenchmarkEntryPrice,

      thesis: thesis.trim(),
      risks,
    };
  }, [
    candidate,
    decision,
    selectedAt,
    parsedEntryPrice,
    benchmarkId,
    benchmarkName,
    parsedBenchmarkEntryPrice,
    benchmarkTicker,
    benchmarkExchangeMic,
    benchmarkQuoteCurrency,
    thesis,
    risks,
    validationMessages.length,
  ]);

  return (
    <section className="rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
          MBIE approval
        </p>

        <h2 className="mt-2 text-2xl font-black text-white">
          Record {candidate.companyName}
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Review the evidence and decision details before creating a permanent
          outcome snapshot. Market entry prices are retrieved automatically when
          provider coverage is available.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Score label="TodayScore" value={candidate.todayScore} />
        <Score label="Quality" value={candidate.qualityScore} />
        <Score label="Value" value={candidate.valueScore} />
        <Score label="Momentum" value={candidate.momentumScore} />
      </div>

      {isLoadingPrices && (
        <p className="mt-6 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] px-4 py-3 text-sm text-cyan-200">
          Retrieving company and benchmark entry prices…
        </p>
      )}

      {!isLoadingPrices && priceMessage && (
        <p className="mt-6 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.07] px-4 py-3 text-sm text-emerald-300">
          {priceMessage}
        </p>
      )}

      {!isLoadingPrices && priceWarning && (
        <p className="mt-6 rounded-xl border border-amber-300/25 bg-amber-300/[0.07] px-4 py-3 text-sm leading-6 text-amber-200">
          {priceWarning}
        </p>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Field label="Decision">
          <select
            value={decision}
            onChange={(event) => {
              const nextDecision = event.target.value as SelectionDecision;

              setDecision(nextDecision);
              applyApprovalDraft(nextDecision, benchmarkTicker);
            }}
            className={inputClassName}
          >
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
        </Field>

        <Field label="Selection date">
          <input
            type="date"
            value={selectedAt}
            onChange={(event) => {
              setSelectedAt(event.target.value);
            }}
            className={inputClassName}
          />
        </Field>

        <Field label="Company entry price">
          <input
            type="number"
            min="0"
            step="any"
            value={entryPrice}
            onChange={(event) => {
              setEntryPrice(event.target.value);
            }}
            placeholder={
              isLoadingPrices ? "Loading market price…" : "Enter company price"
            }
            disabled={isLoadingPrices}
            className={`${inputClassName} disabled:cursor-wait disabled:opacity-60`}
          />
          {formatPrice(entryPrice, candidate.quoteCurrency) && (
            <p className="mt-2 text-xs font-semibold text-cyan-300">
              Display value: {formatPrice(entryPrice, candidate.quoteCurrency)}
            </p>
          )}
        </Field>

        <Field label="Benchmark">
          <select
            value={benchmarkId}
            onChange={(event) => {
              const nextId = event.target.value;
              const nextBenchmark = getSelectionBenchmark(nextId);

              if (!nextBenchmark) {
                return;
              }

              setBenchmarkId(nextId);
              setBenchmarkName(nextBenchmark.companyName);
              setBenchmarkTicker(nextBenchmark.ticker);
              setBenchmarkExchangeMic(nextBenchmark.exchangeMic);
              setBenchmarkQuoteCurrency(nextBenchmark.quoteCurrency);
              applyApprovalDraft(decision, nextBenchmark.ticker);
            }}
            className={inputClassName}
          >
            <option value="sp500">S&amp;P 500 — SPY</option>

            <option value="ftse100">FTSE 100 — ISF</option>

            <option value="nasdaq100">Nasdaq 100 — QQQ</option>
          </select>
        </Field>

        <Field label="Benchmark entry price">
          <input
            type="number"
            min="0"
            step="any"
            value={benchmarkEntryPrice}
            onChange={(event) => {
              setBenchmarkEntryPrice(event.target.value);
            }}
            placeholder={
              isLoadingPrices
                ? "Loading market price…"
                : "Enter benchmark price"
            }
            disabled={isLoadingPrices}
            className={`${inputClassName} disabled:cursor-wait disabled:opacity-60`}
          />
          {formatPrice(benchmarkEntryPrice, benchmarkQuoteCurrency) && (
            <p className="mt-2 text-xs font-semibold text-cyan-300">
              Display value:{" "}
              {formatPrice(benchmarkEntryPrice, benchmarkQuoteCurrency)}
            </p>
          )}
        </Field>
      </div>

      <div className="mt-6 space-y-6">
        <Field label="Selection thesis">
          <textarea
            value={thesis}
            onChange={(event) => {
              setThesis(event.target.value);
            }}
            rows={4}
            placeholder="Explain why the company qualifies for this decision."
            className={inputClassName}
          />
        </Field>

        <Field label="Material risks — one per line">
          <textarea
            value={risksText}
            onChange={(event) => {
              setRisksText(event.target.value);
            }}
            rows={4}
            placeholder={[
              "Manufacturing recovery weakens",
              "Input costs increase",
              "Company guidance deteriorates",
            ].join("\n")}
            className={inputClassName}
          />
        </Field>
      </div>

      <div className="mt-8 border-t border-white/10 pt-6">
        {approvedSelection ? (
          <RecordSelectionButton
            selection={approvedSelection}
            onRecorded={onRecorded}
          />
        ) : (
          <>
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-xl bg-slate-700 px-5 py-3 text-sm font-bold text-slate-400"
            >
              Complete Approval Details
            </button>

            <ul className="mt-4 space-y-1 text-sm text-amber-300">
              {validationMessages.map((message) => (
                <li key={message}>• {message}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}

const inputClassName = [
  "w-full rounded-xl border border-white/10",
  "bg-slate-950/60 px-4 py-3 text-white",
  "outline-none transition-colors",
  "placeholder:text-slate-600",
  "focus:border-cyan-300/60",
].join(" ");

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-300">
        {label}
      </span>

      {children}
    </label>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black text-cyan-300">{value}</p>
    </div>
  );
}
