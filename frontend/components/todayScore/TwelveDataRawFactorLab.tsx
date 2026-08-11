"use client";

import { useState } from "react";

import type {
  RawFactorResult,
  RawFactorUnit,
  RawTodayScoreReport,
} from "@/engine/todayScore/rawFactors";
import type { TodayScorePillar } from "@/engine/todayScore/types";

interface TwelveDataRawFactorLabProps {
  keyConfigured: boolean;
}

const pillarLabels: Record<TodayScorePillar, string> = {
  quality: "The Shield · Quality",
  value: "The Anchor · Value",
  momentum: "The Catalyst · Momentum",
};

function formatRawValue(value: number, unit: RawFactorUnit | undefined): string {
  const formatted = new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 2,
  }).format(value);

  if (unit === "percent") {
    return `${formatted}%`;
  }

  if (unit === "multiple") {
    return `${formatted}×`;
  }

  return formatted;
}

function formatDiagnosticNumber(value: number | undefined): string {
  if (value === undefined) {
    return "Unavailable";
  }

  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 4,
  }).format(value);
}

function formatDifference(value: number | undefined): string {
  if (value === undefined) {
    return "Unavailable";
  }

  return `${(value * 100).toFixed(2)}%`;
}

function FactorRow({ factor }: { factor: RawFactorResult }) {
  const available = factor.status === "available" && factor.rawValue !== undefined;
  const rejected = factor.status === "rejected";
  const observedDates = [
    ...new Set(
      factor.evidence.flatMap((evidence) =>
        evidence.observedAt ? [evidence.observedAt] : [],
      ),
    ),
  ];

  return (
    <div className="border-t border-white/[0.07] px-5 py-4 first:border-t-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-bold text-white">{factor.name}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">
            {factor.category.replace(/([A-Z])/g, " $1")} ·{" "}
            {factor.direction === "higherIsBetter"
              ? "higher is better"
              : "lower is better"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={
              available
                ? "rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-sm font-black text-cyan-200"
                : rejected
                  ? "rounded-lg border border-rose-300/20 bg-rose-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.1em] text-rose-200"
                : "rounded-lg border border-slate-600/30 bg-slate-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.1em] text-slate-400"
            }
          >
            {available
              ? formatRawValue(factor.rawValue!, factor.unit)
              : rejected
                ? "Rejected"
                : "Unavailable"}
          </span>
          <span className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-amber-200">
            Score locked
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-400">
        {factor.explanation}
      </p>
      {observedDates.length > 0 && (
        <p className="mt-2 text-xs text-slate-500">
          Source date{observedDates.length > 1 ? "s" : ""}: {observedDates.join(" · ")}
        </p>
      )}
    </div>
  );
}

export default function TwelveDataRawFactorLab({
  keyConfigured,
}: TwelveDataRawFactorLabProps) {
  const [report, setReport] = useState<RawTodayScoreReport | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function buildReport() {
    setLoading(true);
    setMessage(null);
    setReport(null);

    try {
      const response = await fetch("/api/dev/twelve-data/raw-report", {
        method: "POST",
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        success: boolean;
        message?: string;
        report?: RawTodayScoreReport;
      };

      if (!response.ok || !payload.success || !payload.report) {
        setMessage(payload.message ?? "The raw-factor report could not be built.");
        return;
      }

      setReport(payload.report);
    } catch {
      setMessage("The local raw-factor endpoint could not be reached.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-10 space-y-6">
      <div className="rounded-3xl border border-violet-300/20 bg-violet-300/[0.06] p-7">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-200">
          End-to-end BT trial
        </p>
        <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h2 className="text-2xl font-black text-white">
              Build genuine raw Q/V/M factors
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              This explicit development action makes seven sequential Twelve
              Data requests for BT.A, validates every field, and returns only
              validated raw reconciliation inputs, derived factors and source
              metadata to the browser. It does not create a Quality, Value,
              Momentum or overall TodayScore.
            </p>
          </div>
          <button
            type="button"
            onClick={buildReport}
            disabled={!keyConfigured || loading}
            className="rounded-xl bg-violet-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-violet-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {loading ? "Building raw factors…" : "Build BT raw-factor report"}
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded-2xl border border-rose-300/20 bg-rose-300/10 px-5 py-4 text-sm text-rose-200">
          {message}
        </div>
      )}

      {report && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-amber-300/20 bg-[#0a1626] p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-200">
                  Genuine provider data · unranked
                </p>
                <h2 className="mt-2 text-2xl font-black text-white">
                  {report.company.companyName} · {report.symbol}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                  {report.scoreMessage}
                </p>
              </div>
              <span className="w-fit rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-amber-200">
                Percentiles locked
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {report.datasets.map((dataset) => (
                <div
                  key={dataset.dataset}
                  className="rounded-xl border border-white/10 bg-black/15 px-4 py-3"
                >
                  <p className="text-xs font-bold text-slate-300">
                    {dataset.dataset.replaceAll("-", " ")}
                  </p>
                  <p
                    className={
                      dataset.status === "available"
                        ? "mt-1 text-xs font-black uppercase text-emerald-300"
                        : "mt-1 text-xs font-black uppercase text-amber-200"
                    }
                  >
                    {dataset.status.replaceAll("-", " ")}
                  </p>
                </div>
              ))}
            </div>

            <div
              className={`mt-5 rounded-2xl border px-5 py-4 ${
                report.unitValidation.status === "rejected"
                  ? "border-rose-300/20 bg-rose-300/[0.06]"
                  : report.unitValidation.status === "normalised"
                    ? "border-cyan-300/20 bg-cyan-300/[0.06]"
                    : "border-emerald-300/20 bg-emerald-300/[0.06]"
              }`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-white">
                    Currency and unit validation · {report.unitValidation.status}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Quote {report.unitValidation.quoteCurrency ?? "unknown"} · Financials{" "}
                    {report.unitValidation.financialCurrency ?? "unknown"}
                    {` · Quote scale ${report.unitValidation.quoteToFinancialScale ?? "unverified"}`}
                    {` · Market-cap scale ${report.unitValidation.marketCapScale ?? "unverified"}`}
                  </p>
                </div>
                <span className="w-fit rounded-full border border-white/10 bg-black/15 px-3 py-1.5 text-xs font-black uppercase tracking-[0.1em] text-slate-200">
                  {report.unitValidation.rejectedFactorCount} rejected factors
                </span>
              </div>
              <ul className="mt-3 space-y-1 text-xs leading-5 text-slate-400">
                {report.unitValidation.messages.map((validationMessage) => (
                  <li key={validationMessage}>• {validationMessage}</li>
                ))}
              </ul>

              <details className="mt-4 rounded-xl border border-white/10 bg-black/15 p-4" open>
                <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.14em] text-cyan-200">
                  Raw reconciliation diagnostics · development only
                </summary>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  These are the exact parsed provider inputs and both quote-scale
                  calculations. They diagnose unit mismatches and never unlock a
                  factor or score.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["Listing", `${report.unitValidation.diagnostics.exchangeMic ?? "unknown"} · ${report.unitValidation.diagnostics.symbol ?? "unknown"}`],
                    ["Latest adjusted close", formatDiagnosticNumber(report.unitValidation.diagnostics.latestClose)],
                    ["Shares outstanding", formatDiagnosticNumber(report.unitValidation.diagnostics.sharesOutstanding)],
                    ["Reported market cap", formatDiagnosticNumber(report.unitValidation.diagnostics.reportedMarketCap)],
                    ["Reported enterprise value", formatDiagnosticNumber(report.unitValidation.diagnostics.reportedEnterpriseValue)],
                    ["Total debt", formatDiagnosticNumber(report.unitValidation.diagnostics.totalDebt)],
                    ["Total cash", formatDiagnosticNumber(report.unitValidation.diagnostics.totalCash)],
                    ["London listing evidence", report.unitValidation.diagnostics.londonListing ? "Yes" : "No"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-white/[0.07] bg-black/20 px-3 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
                        {label}
                      </p>
                      <p className="mt-1 break-words text-sm font-bold text-slate-200">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  {report.unitValidation.diagnostics.candidates.map((candidate) => (
                    <div
                      key={candidate.scale}
                      className={`rounded-xl border p-4 ${
                        candidate.selected
                          ? "border-cyan-300/30 bg-cyan-300/[0.07]"
                          : candidate.directMatch ||
                              candidate.scaledMatch ||
                              candidate.enterpriseValueMatch
                            ? "border-amber-300/25 bg-amber-300/[0.06]"
                            : "border-white/10 bg-black/20"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-black text-white">
                            Candidate scale {candidate.scale}
                          </p>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
                            {candidate.source.replaceAll("-", " ")}
                          </p>
                        </div>
                        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-slate-300">
                          {candidate.selected
                            ? "Selected uniquely"
                            : candidate.directMatch ||
                                candidate.scaledMatch ||
                                candidate.enterpriseValueMatch
                              ? "Matched but not unique"
                              : "No match"}
                        </span>
                      </div>
                      <dl className="mt-4 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-xs">
                        <dt className="text-slate-500">Close × scale</dt>
                        <dd className="text-right font-bold text-slate-200">
                          {formatDiagnosticNumber(candidate.latestPriceInFinancialCurrency)}
                        </dd>
                        <dt className="text-slate-500">Close × scale × shares</dt>
                        <dd className="text-right font-bold text-slate-200">
                          {formatDiagnosticNumber(candidate.independentlyDerivedMarketCap)}
                        </dd>
                        <dt className="text-slate-500">Reported market cap</dt>
                        <dd className="text-right font-bold text-slate-200">
                          {formatDiagnosticNumber(candidate.reportedMarketCap)}
                        </dd>
                        <dt className="text-slate-500">Reported cap × scale</dt>
                        <dd className="text-right font-bold text-slate-200">
                          {formatDiagnosticNumber(candidate.reportedMarketCapAtScale)}
                        </dd>
                        <dt className="text-slate-500">Direct difference</dt>
                        <dd className="text-right font-bold text-slate-200">
                          {formatDifference(candidate.directRelativeDifference)}
                        </dd>
                        <dt className="text-slate-500">Scaled-cap difference</dt>
                        <dd className="text-right font-bold text-slate-200">
                          {formatDifference(candidate.scaledRelativeDifference)}
                        </dd>
                        <dt className="text-slate-500">
                          Cap × scale + debt − cash
                        </dt>
                        <dd className="text-right font-bold text-slate-200">
                          {formatDiagnosticNumber(
                            candidate.enterpriseValueFromScaledMarketCap,
                          )}
                        </dd>
                        <dt className="text-slate-500">
                          Enterprise-value difference
                        </dt>
                        <dd className="text-right font-bold text-slate-200">
                          {formatDifference(
                            candidate.enterpriseValueRelativeDifference,
                          )}
                        </dd>
                      </dl>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </div>

          {(["quality", "value", "momentum"] as const).map((pillar) => {
            const pillarReport = report.pillars[pillar];

            return (
              <div
                key={pillar}
                className="overflow-hidden rounded-3xl border border-white/10 bg-[#0a1626]"
              >
                <div className="flex flex-col gap-3 border-b border-slate-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                      {pillarLabels[pillar]}
                    </p>
                    <h3 className="mt-1 text-xl font-black text-white">
                      {pillarReport.availableFactorCount} of{" "}
                      {pillarReport.totalFactorCount} raw factors available
                    </h3>
                  </div>
                  <span className="w-fit rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-amber-200">
                    Pillar score locked
                  </span>
                </div>
                <div>
                  {pillarReport.factors.map((factor) => (
                    <FactorRow key={factor.factorId} factor={factor} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
