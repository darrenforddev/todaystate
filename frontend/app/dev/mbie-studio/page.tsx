"use client";

import { useState } from "react";

import StudioHeader from "@/components/mbie/StudioHeader";
import Pipeline from "@/components/mbie/Pipeline";
import EvidenceCard from "@/components/mbie/EvidenceCard";
import ThemeCard from "@/components/mbie/ThemeCard";
import ReasoningCard from "@/components/mbie/ReasoningCard";
import TodaysIntelligence from "@/components/mbie/TodaysIntelligence";
import SystemStatus from "@/components/mbie/SystemStatus";
import ConfidenceCard from "@/components/mbie/ConfidenceCard";
import EconomicFactorChart from "@/components/mbie/EconomicFactorChart";
import PeriodIntelligenceSummary from "@/components/mbie/PeriodIntelligenceSummary";

import { getPeriodThemeIntelligence } from "@/engine/periodThemeIntelligence";
import { getAvailableEvidencePeriods } from "@/data/evidenceSnapshots";

import {
  calculateConfidence,
  sampleConfidenceFactors,
} from "@/engine/confidence/index";

import { buildEvidence } from "@/engine/evidence";
import { getThemeIntelligence } from "@/engine/themeEngine";

interface MonthlySnapshot {
  id: string;
  label: string;
  comparedWith: string;
  current: number;
  previous: number;
}

const monthlySnapshots: MonthlySnapshot[] = [
  {
    id: "2026-06",
    label: "June 2026",
    comparedWith: "May 2026",
    current: 53.3,
    previous: 54.0,
  },
  {
    id: "2026-07",
    label: "July 2026",
    comparedWith: "June 2026",
    current: 55.6,
    previous: 53.3,
  },
  {
    id: "2026-08",
    label: "August 2026",
    comparedWith: "July 2026",
    current: 54.6,
    previous: 55.6,
  },
];

export default function MBIEStudioPage() {
  const [selectedSnapshotIndex, setSelectedSnapshotIndex] = useState(
    monthlySnapshots.length - 1,
  );

  const selectedSnapshot =
    monthlySnapshots[selectedSnapshotIndex] ??
    monthlySnapshots[monthlySnapshots.length - 1];

  const evidence = buildEvidence(
    "manufacturing-pmi",
    selectedSnapshot.current,
    selectedSnapshot.previous,
  );

  const theme = getThemeIntelligence("industrial-recovery");

  const availableEvidencePeriods = getAvailableEvidencePeriods();

  const periodThemeResult = availableEvidencePeriods.includes(
    selectedSnapshot.id,
  )
    ? getPeriodThemeIntelligence("industrial-recovery", selectedSnapshot.id)
    : null;

  const confidence =
    periodThemeResult?.confidence ??
    calculateConfidence(sampleConfidenceFactors);

  const isLatestSnapshot =
    selectedSnapshotIndex === monthlySnapshots.length - 1;

  if (!theme) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        Theme intelligence could not be loaded.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8">
      <div className="mx-auto max-w-7xl">
        <StudioHeader version="0.1" />

        <TimeLens
          selectedSnapshotIndex={selectedSnapshotIndex}
          onSnapshotChange={setSelectedSnapshotIndex}
        />

        <EconomicFactorChart selectedPeriod={selectedSnapshot.id} />

        <PeriodIntelligenceSummary
          result={periodThemeResult}
          periodLabel={selectedSnapshot.label}
        />

        <div className="mb-8">
          <Pipeline />
        </div>

        <div className="mb-8">
          <TodaysIntelligence
            theme={theme.theme.name}
            indicator="Manufacturing PMI"
            value={evidence.current}
            status={evidence.status}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
                {selectedSnapshot.label} data
              </span>

              <span className="text-sm text-slate-500">
                Compared with {selectedSnapshot.comparedWith}
              </span>
            </div>

            <EvidenceCard
              indicator="Manufacturing PMI"
              current={evidence.current}
              previous={evidence.previous}
              change={evidence.change}
              direction={evidence.direction}
              status={evidence.status}
              impact={evidence.impact}
              explanation={evidence.explanation}
            />
          </div>

          <ThemeCard
            name={theme.theme.name}
            description={theme.theme.description}
            strength={theme.averageRelationshipStrength}
          />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <ReasoningCard
            indicator="Manufacturing PMI"
            status={evidence.status}
            theme={theme.theme.name}
            strength={theme.averageRelationshipStrength}
          />

          <SystemStatus />

          <div className="mt-8">
            <ConfidenceCard result={confidence} />
          </div>
        </div>

        {!isLatestSnapshot && (
          <div className="mt-8 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">
              Historical view
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              You are viewing the evidence available for{" "}
              {selectedSnapshot.label}. Move the Time Lens to August 2026 to
              return to the latest available report.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function TimeLens({
  selectedSnapshotIndex,
  onSnapshotChange,
}: {
  selectedSnapshotIndex: number;
  onSnapshotChange: (index: number) => void;
}) {
  const selectedSnapshot =
    monthlySnapshots[selectedSnapshotIndex] ??
    monthlySnapshots[monthlySnapshots.length - 1];

  const isLatestSnapshot =
    selectedSnapshotIndex === monthlySnapshots.length - 1;

  return (
    <section className="mb-8 rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-6">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
            TodayState Time Lens
          </p>

          <h2
            className="mt-2 text-2xl font-black text-white"
            aria-live="polite"
          >
            {selectedSnapshot.label}
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Compared with {selectedSnapshot.comparedWith}
          </p>
        </div>

        <span
          className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] ${
            isLatestSnapshot
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
              : "border-amber-400/30 bg-amber-400/10 text-amber-300"
          }`}
        >
          {isLatestSnapshot ? "Latest data" : "Historical"}
        </span>
      </div>

      <div className="mt-7">
        <label htmlFor="mbie-time-lens" className="sr-only">
          Select economic reporting month
        </label>

        <input
          id="mbie-time-lens"
          type="range"
          min={0}
          max={monthlySnapshots.length - 1}
          step={1}
          value={selectedSnapshotIndex}
          onChange={(event) => onSnapshotChange(Number(event.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-cyan-400"
        />

        <div className="mt-4 grid grid-cols-3 text-xs font-bold uppercase tracking-wider text-slate-500">
          {monthlySnapshots.map((snapshot, index) => (
            <button
              key={snapshot.id}
              type="button"
              onClick={() => onSnapshotChange(index)}
              className={`min-h-11 ${
                index === 0
                  ? "text-left"
                  : index === monthlySnapshots.length - 1
                    ? "text-right"
                    : "text-center"
              } ${
                index === selectedSnapshotIndex
                  ? "text-cyan-300"
                  : "transition hover:text-slate-300"
              }`}
            >
              {snapshot.label.replace(" 2026", "")}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-500">
        Move through previous reporting months to see how the evidence changed
        over time.
      </p>
    </section>
  );
}
