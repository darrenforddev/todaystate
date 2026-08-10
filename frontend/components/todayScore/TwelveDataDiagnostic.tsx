"use client";

import { useState } from "react";

import type { CompanyUniverseMember } from "@/engine/todayScore/companyUniverse";
import { todayScoreDataRequirements } from "@/engine/todayScore/providers/requirements";
import type {
  ProviderCoverageProbe,
  ProviderCoverageStatus,
  TodayScoreDataset,
} from "@/engine/todayScore/providers/types";

interface TwelveDataDiagnosticProps {
  companies: readonly CompanyUniverseMember[];
  keyConfigured: boolean;
}

const statusStyles: Record<ProviderCoverageStatus, string> = {
  available: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
  "plan-restricted": "border-amber-300/20 bg-amber-300/10 text-amber-200",
  "authentication-error": "border-rose-300/20 bg-rose-300/10 text-rose-200",
  "rate-limited": "border-orange-300/20 bg-orange-300/10 text-orange-200",
  unavailable: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  "provider-error": "border-rose-300/20 bg-rose-300/10 text-rose-200",
};

function formatStatus(status: ProviderCoverageStatus): string {
  return status.replaceAll("-", " ");
}

export default function TwelveDataDiagnostic({
  companies,
  keyConfigured,
}: TwelveDataDiagnosticProps) {
  const [target, setTarget] = useState("trial");
  const [dataset, setDataset] = useState<TodayScoreDataset>("price-history");
  const [result, setResult] = useState<ProviderCoverageProbe | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function runDiagnostic() {
    setLoading(true);
    setMessage(null);
    setResult(null);

    try {
      const response = await fetch("/api/dev/twelve-data/coverage", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ target, dataset }),
      });
      const payload = (await response.json()) as {
        success: boolean;
        message?: string;
        result?: ProviderCoverageProbe;
      };

      if (!response.ok || !payload.success || !payload.result) {
        setMessage(payload.message ?? "The diagnostic could not be completed.");
        return;
      }

      setResult(payload.result);
    } catch {
      setMessage("The local diagnostic endpoint could not be reached.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-7">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
            Secure server connection
          </p>
          <h2 className="mt-3 text-2xl font-black text-white">
            Twelve Data coverage probe
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Run one controlled request at a time. The API key stays on the
            server, raw provider responses are not sent to the browser, and no
            TodayScore is unlocked by this diagnostic alone.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
              Company
              <select
                value={target}
                onChange={(event) => setTarget(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-[#07111f] px-4 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-cyan-400"
              >
                <option value="trial">BT Group · BT.A · trial symbol</option>
                {companies.map((company) => (
                  <option key={company.companyId} value={company.companyId}>
                    {company.companyName} · {company.ticker}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
              Dataset
              <select
                value={dataset}
                onChange={(event) =>
                  setDataset(event.target.value as TodayScoreDataset)
                }
                className="mt-2 w-full rounded-xl border border-slate-700 bg-[#07111f] px-4 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-cyan-400"
              >
                {todayScoreDataRequirements.map((requirement) => (
                  <option key={requirement.id} value={requirement.id}>
                    {requirement.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={runDiagnostic}
            disabled={!keyConfigured || loading}
            className="mt-5 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {loading ? "Checking coverage…" : "Run one coverage check"}
          </button>
        </div>

        <div className="rounded-3xl border border-amber-300/20 bg-amber-300/[0.06] p-7">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-200">
            Development-plan boundary
          </p>
          <h2 className="mt-3 text-xl font-black text-white">
            Basic validates the connection—not the pilot
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Twelve Data identifies BT.A as its London trial symbol. General LSE
            access is currently listed for Grow and above, so restricted pilot
            results must remain locked rather than being treated as missing
            financial data.
          </p>
          <a
            href="https://twelvedata.com/exchanges/xlon"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex text-sm font-bold text-amber-200 underline decoration-amber-300/30 underline-offset-4 hover:text-amber-100"
          >
            View official LSE coverage
          </a>
          <div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-black/15 px-4 py-3">
            <span className="text-sm text-slate-300">Server key</span>
            <span
              className={
                keyConfigured
                  ? "font-bold text-emerald-300"
                  : "font-bold text-rose-300"
              }
            >
              {keyConfigured ? "Configured" : "Missing"}
            </span>
          </div>
        </div>
      </section>

      {(result || message) && (
        <section className="rounded-3xl border border-white/10 bg-[#0a1626] p-7">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            Latest result
          </p>
          {result ? (
            <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-black text-white">
                  {result.companyName} · {result.symbol}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {result.endpoint} · {result.message}
                  {typeof result.sampleSize === "number"
                    ? ` · ${result.sampleSize} sample records`
                    : ""}
                </p>
              </div>
              <span
                className={`w-fit rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] ${statusStyles[result.status]}`}
              >
                {formatStatus(result.status)}
              </span>
            </div>
          ) : (
            <p className="mt-4 text-sm text-rose-200">{message}</p>
          )}
        </section>
      )}

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#0a1626]">
        <div className="border-b border-slate-800 px-7 py-6">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
            Provider-neutral contract
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            Data TodayScore must validate
          </h2>
        </div>
        <div className="divide-y divide-slate-800">
          {todayScoreDataRequirements.map((requirement) => (
            <div
              key={requirement.id}
              className="grid gap-2 px-7 py-5 md:grid-cols-[0.8fr_0.55fr_1.65fr] md:items-center"
            >
              <p className="font-bold text-white">{requirement.label}</p>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-cyan-300">
                {requirement.pillars.join(" · ")}
              </p>
              <p className="text-sm leading-6 text-slate-400">
                {requirement.purpose}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
