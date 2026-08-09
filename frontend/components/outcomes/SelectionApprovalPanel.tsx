"use client";

import { useMemo, useState } from "react";

import RecordSelectionButton from "./RecordSelectionButton";

import type { ApprovedSelectionInput } from "@/engine/outcomes/selectionOutcomeBuilder";

import type {
  SelectionDecision,
  SelectionOutcomeRecord,
} from "@/engine/outcomes/types";

interface SelectionCandidate {
  companyId: string;
  ticker: string;
  companyName: string;

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

export default function SelectionApprovalPanel({
  candidate,
  onRecorded,
}: SelectionApprovalPanelProps) {
  const [decision, setDecision] = useState<SelectionDecision>("long");

  const [selectedAt, setSelectedAt] = useState(getTodayDate);

  const [entryPrice, setEntryPrice] = useState("");
  const [benchmarkId, setBenchmarkId] = useState("sp500");
  const [benchmarkName, setBenchmarkName] = useState("S&P 500");
  const [benchmarkEntryPrice, setBenchmarkEntryPrice] = useState("");

  const [thesis, setThesis] = useState("");
  const [risksText, setRisksText] = useState("");

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
          Review the evidence and complete the decision details before creating
          a permanent outcome snapshot.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Score label="TodayScore" value={candidate.todayScore} />
        <Score label="Quality" value={candidate.qualityScore} />
        <Score label="Value" value={candidate.valueScore} />
        <Score label="Momentum" value={candidate.momentumScore} />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Field label="Decision">
          <select
            value={decision}
            onChange={(event) => {
              setDecision(event.target.value as SelectionDecision);
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
            placeholder="For example, 420.00"
            className={inputClassName}
          />
        </Field>

        <Field label="Benchmark">
          <select
            value={benchmarkId}
            onChange={(event) => {
              const nextId = event.target.value;

              setBenchmarkId(nextId);

              if (nextId === "sp500") {
                setBenchmarkName("S&P 500");
              }

              if (nextId === "ftse100") {
                setBenchmarkName("FTSE 100");
              }

              if (nextId === "nasdaq100") {
                setBenchmarkName("Nasdaq 100");
              }
            }}
            className={inputClassName}
          >
            <option value="sp500">S&amp;P 500</option>
            <option value="ftse100">FTSE 100</option>
            <option value="nasdaq100">Nasdaq 100</option>
          </select>
        </Field>

        <Field label="Benchmark name">
          <input
            type="text"
            value={benchmarkName}
            onChange={(event) => {
              setBenchmarkName(event.target.value);
            }}
            className={inputClassName}
          />
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
            placeholder="For example, 6350.00"
            className={inputClassName}
          />
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
