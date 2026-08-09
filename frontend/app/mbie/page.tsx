"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { themes } from "@/data/themes";
import ConfidenceCard from "@/components/mbie/ConfidenceCard";
import ConfidenceEvidenceCard from "@/components/mbie/ConfidenceEvidenceCard";
import { calculateConfidence } from "@/engine/confidence/confidenceEngine";
import { buildConfidenceFactors } from "@/engine/confidence/confidenceFactorBuilder";
import OutcomeHistory from "@/components/outcomes/OutcomeHistory";
import OutcomeTimeline from "@/components/outcomes/OutcomeTimeline";
import SelectionApprovalPanel from "@/components/outcomes/SelectionApprovalPanel";
import OutcomeReviewPanel from "@/components/outcomes/OutcomeReviewPanel";

import type { SelectionOutcomeRecord } from "@/engine/outcomes/types";

import { calculateThemeHistoricalPerformance } from "@/engine/outcomes/historicalPerformance";

import {
  strongEvidence,
  mixedEvidence,
  weakEvidence,
} from "@/engine/confidence/testData";

import { calculateScore } from "@/engine/scoring/scoringEngine";
import { qualityTestResults } from "@/engine/todayScore/qualityTest";
import { valueTestResults } from "@/engine/todayScore/valueTest";
import { momentumTestResults } from "@/engine/todayScore/momentumTest";
import { todayScoreTestResults } from "@/engine/todayScore/todayScoreTest";

const confidenceThemeOptions = themes.map(({ id, name }) => ({
  id,
  name,
}));

const approvalCompanyNames: Record<string, string> = {
  atlas: "Atlas Industries",
  beacon: "Beacon Group",
  cascade: "Cascade Holdings",
};

export default function MBIEPage() {
  const [outcomeRecords, setOutcomeRecords] = useState<
    SelectionOutcomeRecord[]
  >([]);

  const [outcomesLoading, setOutcomesLoading] = useState(true);

  const [outcomesError, setOutcomesError] = useState<string | null>(null);

  const [approvalCompanyId, setApprovalCompanyId] = useState(
    todayScoreTestResults[0]?.companyId ?? "",
  );

  function handleSelectionRecorded(record: SelectionOutcomeRecord) {
    setOutcomeRecords((currentRecords) => [
      record,
      ...currentRecords.filter(
        (currentRecord) =>
          currentRecord.selection.selectionId !== record.selection.selectionId,
      ),
    ]);

    setOutcomesError(null);
    setOutcomesLoading(false);
  }

  const loadOutcomeRecords = useCallback(async (): Promise<void> => {
    try {
      setOutcomesLoading(true);
      setOutcomesError(null);

      const response = await fetch("/api/selection-outcomes", {
        cache: "no-store",
      });

      const data = (await response.json()) as {
        success: boolean;
        records?: SelectionOutcomeRecord[];
        message?: string;
        error?: string;
      };

      if (!response.ok || !data.success || !Array.isArray(data.records)) {
        throw new Error(
          data.error ?? data.message ?? "The API returned an invalid response.",
        );
      }

      setOutcomeRecords(data.records);
    } catch (error) {
      console.error("Unable to load selection outcomes:", error);

      setOutcomesError(
        error instanceof Error
          ? error.message
          : "Unable to load the persistent outcome history.",
      );
    } finally {
      setOutcomesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOutcomeRecords();
  }, [loadOutcomeRecords]);

  const [selectedThemeId, setSelectedThemeId] = useState("industrial-recovery");

  const historicalPerformanceResults = useMemo(
    () =>
      themes.map((theme) => ({
        theme,
        result: calculateThemeHistoricalPerformance(
          outcomeRecords,
          theme.id,
          "twelve-month",
        ),
      })),
    [outcomeRecords],
  );

  const selectedThemeHistory = useMemo(
    () =>
      calculateThemeHistoricalPerformance(
        outcomeRecords,
        selectedThemeId,
        "twelve-month",
      ),
    [outcomeRecords, selectedThemeId],
  );

  const selectedTheme = confidenceThemeOptions.find(
    (theme) => theme.id === selectedThemeId,
  );

  const confidenceScenarios = [
    {
      title: "Strong Evidence",
      evidence: strongEvidence,
      result: calculateConfidence(
        buildConfidenceFactors(strongEvidence, undefined, selectedThemeHistory),
      ),
    },
    {
      title: "Mixed Evidence",
      evidence: mixedEvidence,
      result: calculateConfidence(buildConfidenceFactors(mixedEvidence)),
    },
    {
      title: "Weak Evidence",
      evidence: weakEvidence,
      result: calculateConfidence(buildConfidenceFactors(weakEvidence)),
    },
  ];

  const scoringScenarios = [
    {
      title: "Strong Theme",
      result: calculateScore({
        macroEnvironment: 92,
        evidenceStrength: 96,
        relationshipStrength: 94,
        momentum: 90,
        riskAdjustment: 82,
      }),
    },
    {
      title: "Mixed Theme",
      result: calculateScore({
        macroEnvironment: 68,
        evidenceStrength: 72,
        relationshipStrength: 66,
        momentum: 61,
        riskAdjustment: 70,
      }),
    },
    {
      title: "Weak Theme",
      result: calculateScore({
        macroEnvironment: 38,
        evidenceStrength: 42,
        relationshipStrength: 35,
        momentum: 31,
        riskAdjustment: 45,
      }),
    },
  ];

  const selectedApprovalResult =
    todayScoreTestResults.find(
      ({ companyId }) => companyId === approvalCompanyId,
    ) ?? todayScoreTestResults[0];

  const approvalCandidate = selectedApprovalResult
    ? {
        companyId: selectedApprovalResult.companyId,
        ticker: selectedApprovalResult.companyId.toUpperCase(),
        companyName:
          approvalCompanyNames[
            selectedApprovalResult.companyId.toLowerCase()
          ] ?? selectedApprovalResult.companyId,

        todayScore: selectedApprovalResult.todayScore.score,
        qualityScore: selectedApprovalResult.todayScore.quality,
        valueScore: selectedApprovalResult.todayScore.value,
        momentumScore: selectedApprovalResult.todayScore.momentum,

        themeId: selectedTheme?.id,
        themeName: selectedTheme?.name,
        themeScore: scoringScenarios[0].result.score,
        themeConfidence: confidenceScenarios[0].result.confidence,
      }
    : null;

  return (
    <main className="min-h-screen bg-[#020817] px-6 py-12 text-white md:px-12">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
        MBIE Laboratory
      </p>

      <h1 className="mt-3 text-5xl font-black">MBIE Engine Laboratory</h1>

      <p className="mt-4 max-w-2xl text-slate-400">
        Internal testing environment for MBIE calculation engines.
      </p>

      <section className="mt-12">
        <h2 className="text-4xl font-black text-white">Confidence Engine</h2>

        <p className="mt-3 text-slate-400">
          Confidence results across strong, mixed and weak evidence.
        </p>

        <div className="mt-6 max-w-xl rounded-2xl border border-cyan-400/20 bg-[#0a1626] p-5">
          <label
            htmlFor="confidence-theme"
            className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300"
          >
            Theme history used by Strong Evidence
          </label>

          <select
            id="confidence-theme"
            value={selectedThemeId}
            onChange={(event) => setSelectedThemeId(event.target.value)}
            className="mt-3 w-full rounded-xl border border-white/10 bg-[#091727] px-4 py-3 font-semibold text-white outline-none focus:border-cyan-400/50"
          >
            {confidenceThemeOptions.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
          </select>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            {selectedTheme?.name ?? selectedThemeId}:{" "}
            {selectedThemeHistory.completedSelections} completed outcome
            {selectedThemeHistory.completedSelections === 1 ? "" : "s"};{" "}
            adjusted historical rate{" "}
            {selectedThemeHistory.adjustedSuccessRate === undefined
              ? "pending"
              : `${selectedThemeHistory.adjustedSuccessRate}%`}
            .
          </p>
        </div>

        <div className="mt-8 space-y-10">
          {confidenceScenarios.map((scenario) => (
            <div key={scenario.title}>
              <h3 className="mb-5 text-2xl font-bold text-white">
                {scenario.title}
              </h3>

              <ConfidenceCard result={scenario.result} />

              <details className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <summary className="cursor-pointer font-bold text-cyan-300">
                  View evidence ({scenario.evidence.length})
                </summary>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {scenario.evidence.map((evidence) => (
                    <ConfidenceEvidenceCard
                      key={evidence.id}
                      evidence={evidence}
                    />
                  ))}
                </div>
              </details>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-4xl font-black text-white">Scoring Engine</h2>

        <p className="mt-3 text-slate-400">
          Explainable theme scoring across strong, mixed and weak conditions.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {scoringScenarios.map((scenario) => (
            <div
              key={scenario.title}
              className="rounded-3xl border border-white/10 bg-[#0a1626] p-7"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                {scenario.title}
              </p>

              <p className="mt-4 text-6xl font-black text-cyan-300">
                {scenario.result.score}
              </p>

              <div className="mt-6 space-y-3 text-sm">
                <BreakdownRow
                  label="Macro Environment"
                  value={scenario.result.breakdown.macroEnvironment}
                />

                <BreakdownRow
                  label="Evidence Strength"
                  value={scenario.result.breakdown.evidenceStrength}
                />

                <BreakdownRow
                  label="Relationship Strength"
                  value={scenario.result.breakdown.relationshipStrength}
                />

                <BreakdownRow
                  label="Momentum"
                  value={scenario.result.breakdown.momentum}
                />

                <BreakdownRow
                  label="Risk Adjustment"
                  value={scenario.result.breakdown.riskAdjustment}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-4xl font-black text-white">
          TodayScore Quality Engine
        </h2>

        <p className="mt-3 max-w-3xl text-slate-400">
          Percentile-ranked Quality results for the fictional Atlas, Beacon and
          Cascade companies.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {qualityTestResults.map(({ companyId, quality }) => (
            <article
              key={companyId}
              className="rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-7"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                {companyId}
              </p>

              <div className="mt-4 flex items-end gap-3">
                <p className="text-6xl font-black text-cyan-300">
                  {quality.score}
                </p>

                <p className="pb-2 text-sm font-bold text-slate-500">/ 100</p>
              </div>

              <p className="mt-2 text-sm text-slate-400">Quality Rank</p>

              <div className="mt-7 space-y-3 text-sm">
                <BreakdownRow
                  label="Profitability"
                  value={quality.profitability}
                />

                <BreakdownRow
                  label="Financial Strength"
                  value={quality.financialStrength}
                />

                <BreakdownRow
                  label="Cash-Flow Quality"
                  value={quality.cashFlowQuality}
                />

                <BreakdownRow
                  label="Earnings Stability"
                  value={quality.earningsStability}
                />
              </div>

              <FactorBreakdown
                factors={quality.factors}
                accentClass="text-cyan-300"
              />
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-4xl font-black text-white">
          TodayScore Value Engine
        </h2>

        <p className="mt-3 max-w-3xl text-slate-400">
          Percentile-ranked Value results for the fictional Atlas, Beacon and
          Cascade companies.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {valueTestResults.map(({ companyId, value }) => (
            <article
              key={companyId}
              className="rounded-3xl border border-emerald-400/20 bg-[#0a1626] p-7"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                {companyId}
              </p>

              <div className="mt-4 flex items-end gap-3">
                <p className="text-6xl font-black text-emerald-300">
                  {value.score}
                </p>

                <p className="pb-2 text-sm font-bold text-slate-500">/ 100</p>
              </div>

              <p className="mt-2 text-sm text-slate-400">Value Rank</p>

              <div className="mt-7 space-y-3 text-sm">
                <BreakdownRow
                  label="Relative Valuation"
                  value={value.relativeValuation}
                />

                <BreakdownRow
                  label="Cash-Flow Valuation"
                  value={value.cashFlowValuation}
                />

                <BreakdownRow
                  label="Historical Valuation"
                  value={value.historicalValuation}
                />
              </div>

              <FactorBreakdown
                factors={value.factors}
                accentClass="text-emerald-300"
              />
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-4xl font-black text-white">
          TodayScore Momentum Engine
        </h2>

        <p className="mt-3 max-w-3xl text-slate-400">
          Percentile-ranked Momentum results for the fictional Atlas, Beacon and
          Cascade companies.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {momentumTestResults.map(({ companyId, momentum }) => (
            <article
              key={companyId}
              className="rounded-3xl border border-violet-400/20 bg-[#0a1626] p-7"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                {companyId}
              </p>

              <div className="mt-4 flex items-end gap-3">
                <p className="text-6xl font-black text-violet-300">
                  {momentum.score}
                </p>

                <p className="pb-2 text-sm font-bold text-slate-500">/ 100</p>
              </div>

              <p className="mt-2 text-sm text-slate-400">Momentum Rank</p>

              <div className="mt-7 space-y-3 text-sm">
                <BreakdownRow
                  label="Price Momentum"
                  value={momentum.priceMomentum}
                />

                <BreakdownRow
                  label="Earnings Momentum"
                  value={momentum.earningsMomentum}
                />

                <BreakdownRow
                  label="Trend Strength"
                  value={momentum.trendStrength}
                />
              </div>

              <FactorBreakdown
                factors={momentum.factors}
                accentClass="text-violet-300"
              />
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-4xl font-black text-white">Overall TodayScore</h2>

        <p className="mt-3 max-w-3xl text-slate-400">
          Combined Quality, Value and Momentum rankings using a 40% / 30% / 30%
          weighting.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {todayScoreTestResults.map(
            ({ companyId, todayScore, classification, explanation }) => (
              <article
                key={companyId}
                className="rounded-3xl border border-amber-400/30 bg-[#0a1626] p-7"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                  {companyId}
                </p>

                <div className="mt-4 flex items-end gap-3">
                  <p className="text-6xl font-black text-amber-300">
                    {todayScore.score}
                  </p>

                  <p className="pb-2 text-sm font-bold text-slate-500">/ 100</p>
                </div>

                <p className="mt-2 text-sm text-slate-400">
                  Overall TodayScore
                </p>

                <div className="mt-5">
                  <span
                    className={`inline-flex rounded-full border px-4 py-2 text-sm font-black ${getBandClasses(
                      classification.band,
                    )}`}
                  >
                    {classification.band}
                  </span>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {classification.description}
                  </p>

                  {classification.safeguardApplied &&
                    classification.safeguardReason && (
                      <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
                          Pillar safeguard applied
                        </p>

                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {classification.safeguardReason}
                        </p>
                      </div>
                    )}
                </div>

                <div className="mt-7 space-y-4">
                  <ScoreComponent
                    label="Quality"
                    score={todayScore.quality}
                    weight={todayScore.weights.quality}
                  />

                  <ScoreComponent
                    label="Value"
                    score={todayScore.value}
                    weight={todayScore.weights.value}
                  />

                  <ScoreComponent
                    label="Momentum"
                    score={todayScore.momentum}
                    weight={todayScore.weights.momentum}
                  />

                  <details className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <summary className="cursor-pointer font-bold text-amber-300">
                      Why this score?
                    </summary>

                    <p className="mt-4 text-sm leading-6 text-slate-300">
                      {explanation.summary}
                    </p>

                    {explanation.strengths.length > 0 && (
                      <div className="mt-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                          Strengths
                        </p>

                        <ul className="mt-3 space-y-2">
                          {explanation.strengths.map((strength) => (
                            <li
                              key={strength}
                              className="text-sm leading-6 text-slate-400"
                            >
                              • {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {explanation.weaknesses.length > 0 && (
                      <div className="mt-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-orange-300">
                          Weaknesses
                        </p>

                        <ul className="mt-3 space-y-2">
                          {explanation.weaknesses.map((weakness) => (
                            <li
                              key={weakness}
                              className="text-sm leading-6 text-slate-400"
                            >
                              • {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {explanation.warnings.length > 0 && (
                      <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
                          Warnings
                        </p>

                        <ul className="mt-3 space-y-2">
                          {explanation.warnings.map((warning) => (
                            <li
                              key={warning}
                              className="text-sm leading-6 text-slate-400"
                            >
                              • {warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </details>
                </div>
              </article>
            ),
          )}
        </div>
      </section>

      <section className="mt-16">
        <div className="mb-6 max-w-xl">
          <label
            htmlFor="approval-company"
            className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300"
          >
            Company awaiting approval
          </label>

          <select
            id="approval-company"
            value={approvalCompanyId}
            onChange={(event) => {
              setApprovalCompanyId(event.target.value);
            }}
            className="mt-3 w-full rounded-xl border border-white/10 bg-[#091727] px-4 py-3 font-semibold text-white outline-none focus:border-cyan-400/50"
          >
            {todayScoreTestResults.map(({ companyId }) => (
              <option key={companyId} value={companyId}>
                {approvalCompanyNames[companyId.toLowerCase()] ?? companyId}
              </option>
            ))}
          </select>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            The approval snapshot uses this company&apos;s current TodayScore
            and the selected Confidence Engine theme shown above.
          </p>
        </div>

        {approvalCandidate && (
          <SelectionApprovalPanel
            key={approvalCandidate.companyId}
            candidate={approvalCandidate}
            onRecorded={handleSelectionRecorded}
          />
        )}
      </section>

      <section className="mt-16">
        {outcomesLoading && (
          <div className="rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-8">
            <p className="text-sm text-slate-400">
              Loading persistent outcome history…
            </p>
          </div>
        )}

        {!outcomesLoading && outcomesError && (
          <div className="rounded-3xl border border-rose-400/20 bg-rose-400/5 p-8">
            <p className="font-bold text-rose-300">
              Outcome history unavailable
            </p>

            <p className="mt-2 text-sm text-slate-400">{outcomesError}</p>
          </div>
        )}

        {!outcomesLoading && !outcomesError && outcomeRecords.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-[#0a1626] p-8">
            <p className="font-bold text-white">No persistent selections yet</p>

            <p className="mt-2 text-sm text-slate-400">
              Selection outcomes will appear here after they are recorded.
            </p>
          </div>
        )}

        {!outcomesLoading && !outcomesError && outcomeRecords.length > 0 && (
          <>
            <div className="space-y-8">
              {outcomeRecords.map((record) => (
                <OutcomeTimeline
                  key={record.selection.selectionId}
                  record={record}
                />
              ))}
            </div>

            <div className="mt-16">
              <OutcomeHistory records={outcomeRecords} />
            </div>
          </>
        )}
      </section>

      {!outcomesLoading && !outcomesError && (
        <OutcomeReviewPanel
          records={outcomeRecords}
          asOfDate={new Date().toISOString().slice(0, 10)}
          onReviewSaved={loadOutcomeRecords}
        />
      )}

      <section className="mt-8 rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
            Historical evidence
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            Theme Historical Performance
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Raw historical results are adjusted towards a neutral 50% rate when
            the completed sample is small. This prevents a handful of outcomes
            from creating false confidence.
          </p>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {historicalPerformanceResults.map(({ theme, result }) => (
            <article
              key={`${result.themeId}-${result.horizon}`}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold capitalize text-white">
                    {theme.name}
                  </h3>

                  <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
                    {result.horizon.replaceAll("-", " ")}
                  </p>
                </div>

                <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                  {result.sampleStrength.replaceAll("-", " ")}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <HistoricalMetric
                  label="Completed"
                  value={String(result.completedSelections)}
                  colourClass="text-white"
                />

                <HistoricalMetric
                  label="Raw rate"
                  value={
                    result.rawSuccessRate === undefined
                      ? "Pending"
                      : `${result.rawSuccessRate}%`
                  }
                  colourClass="text-emerald-300"
                />

                <HistoricalMetric
                  label="Adjusted"
                  value={
                    result.adjustedSuccessRate === undefined
                      ? "Pending"
                      : `${result.adjustedSuccessRate}%`
                  }
                  colourClass="text-cyan-300"
                />

                <HistoricalMetric
                  label="Sample weight"
                  value={`${Math.round(result.sampleWeight * 100)}%`}
                  colourClass="text-amber-300"
                />
              </div>

              <p className="mt-5 text-sm leading-6 text-slate-400">
                {result.explanation}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function HistoricalMetric({
  label,
  value,
  colourClass,
}: {
  label: string;
  value: string;
  colourClass: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#091727] p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className={`mt-2 text-lg font-black ${colourClass}`}>{value}</p>
    </div>
  );
}

interface DisplayFactor {
  id: string;
  name: string;
  score: number;
  rawValue?: number;
  explanation?: string;
}

function FactorBreakdown({
  factors,
  accentClass,
}: {
  factors: DisplayFactor[];
  accentClass: string;
}) {
  return (
    <details className="mt-6 rounded-2xl border border-white/10 bg-black/10 p-4">
      <summary className={`cursor-pointer font-bold ${accentClass}`}>
        View factor breakdown ({factors.length})
      </summary>

      <div className="mt-4 space-y-3">
        {factors.map((factor) => (
          <div
            key={factor.id}
            className="rounded-xl border border-white/5 bg-white/[0.02] p-3"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-slate-200">
                {factor.name}
              </p>

              <p className={`font-black ${accentClass}`}>{factor.score}</p>
            </div>

            {factor.rawValue !== undefined && (
              <p className="mt-1 text-xs text-slate-500">
                Raw value: {factor.rawValue}
              </p>
            )}

            {factor.explanation && (
              <p className="mt-2 text-xs leading-5 text-slate-400">
                {factor.explanation}
              </p>
            )}
          </div>
        ))}
      </div>
    </details>
  );
}

function ScoreComponent({
  label,
  score,
  weight,
}: {
  label: string;
  score: number;
  weight: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between gap-4">
        <span className="font-semibold text-slate-300">{label}</span>

        <span className="font-black text-amber-300">{score}</span>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>Weight: {Math.round(weight * 100)}%</span>
        <span>Contribution: {Math.round(score * weight)}</span>
      </div>
    </div>
  );
}

function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-400">{label}</span>
      <span className="font-bold text-cyan-300">{value}</span>
    </div>
  );
}

function getBandClasses(band: string): string {
  switch (band) {
    case "Elite":
      return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";

    case "Strong":
      return "border-cyan-400/30 bg-cyan-400/10 text-cyan-300";

    case "Neutral":
      return "border-amber-400/30 bg-amber-400/10 text-amber-300";

    case "Weak":
      return "border-orange-400/30 bg-orange-400/10 text-orange-300";

    case "Distressed":
      return "border-red-400/30 bg-red-400/10 text-red-300";

    default:
      return "border-slate-400/30 bg-slate-400/10 text-slate-300";
  }
}
