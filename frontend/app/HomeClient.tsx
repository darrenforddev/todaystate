"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import BullBearCard from "../components/BullBearCard";
import { calculateMarketState } from "../lib/marketBrain";

import SignalGrid from "../components/SignalGrid";
import WhyPanel from "../components/WhyPanel";
import CountdownCard from "../components/CountdownCard";
import MarketSummaryCard from "../components/MarketSummaryCard";
import StatusBar from "../components/StatusBar";
import ThemeCard from "../components/ThemeCard";
import SectionHeader from "../components/ui/SectionHeader";
import { themes } from "../data/themes";
import { getDrivers } from "../engine/driverEngine";
import { getMarketExplanation } from "../engine/explainEngine";
import MorningEdition from "../components/morning-edition/MorningEdition";
import {
  getManufacturingSummary,
  getServicesSummary,
} from "../repositories/evidenceRepository";
import type { ConfidenceEvidence } from "../engine/confidence/confidenceEvidence";
import { calculateMacroState } from "../engine/macroState";

type DisplayUnit = "index" | "thousands" | "percent" | "millions";

function formatEvidenceValue(value: number | undefined, unit?: DisplayUnit) {
  if (value === undefined) {
    return "—";
  }

  switch (unit) {
    case "index":
      return `${value.toFixed(1)} PMI`;
    case "thousands":
      return `${value.toFixed(0)}k jobs`;
    case "percent":
      return `${value.toFixed(1)}% YoY`;
    case "millions":
      return `${value.toFixed(3)}m permits`;
    default:
      return String(value);
  }
}

function formatEvidenceChange(value: number | undefined, unit?: DisplayUnit) {
  if (value === undefined) {
    return "—";
  }

  const sign = value > 0 ? "+" : "";

  switch (unit) {
    case "index":
      return `${sign}${value.toFixed(1)} pts`;
    case "thousands":
      return `${sign}${value.toFixed(0)}k jobs`;
    case "percent":
      return `${sign}${value.toFixed(1)} pp`;
    case "millions":
      return `${sign}${value.toFixed(3)}m`;
    default:
      return `${sign}${value}`;
  }
}

interface HomeClientProps {
  macroEvidence: ConfidenceEvidence[];
}

export default function HomeClient({ macroEvidence }: HomeClientProps) {
  const [showWhy, setShowWhy] = useState(false);
  const macroState = calculateMacroState(macroEvidence);
  const employmentEvidence = macroEvidence.find(
    (evidence) => evidence.id === "nonfarm-payrolls",
  );

  const inflationEvidence = macroEvidence.find(
    (evidence) => evidence.id === "cpi-inflation",
  );

  const marketState = calculateMarketState(macroEvidence);

  const explanation = getMarketExplanation(macroEvidence);

  const manufacturing = getManufacturingSummary();
  const services = getServicesSummary();
  const drivers = getDrivers();

  const marketSignals = [
    {
      name: "Manufacturing PMI",
      value: manufacturing ? manufacturing.value.toFixed(1) : "--",
      change: manufacturing
        ? `${manufacturing.change >= 0 ? "▲" : "▼"} ${manufacturing.change.toFixed(1)}`
        : "--",
      positive: manufacturing ? manufacturing.change >= 0 : true,
    },
    {
      name: "Services PMI",
      value: services ? services.value.toFixed(1) : "--",
      change: services
        ? `${services.change >= 0 ? "▲" : "▼"} ${services.change.toFixed(1)}`
        : "--",
      positive: services ? services.change >= 0 : true,
    },
    {
      name: "Employment",
      value:
        employmentEvidence?.direction === "improving"
          ? "Improving"
          : employmentEvidence?.direction === "weakening"
            ? "Weakening"
            : "Stable",
      change:
        employmentEvidence?.change !== undefined
          ? `${employmentEvidence.change > 0 ? "▲" : "▼"} ${Math.abs(
              employmentEvidence.change,
            ).toFixed(0)}k`
          : "--",
      positive: employmentEvidence?.signal === "supportive",
    },
    {
      name: "Inflation Pressure",
      value:
        (inflationEvidence?.current ?? 0) > 2 ? "Above target" : "At target",
      change:
        inflationEvidence?.direction === "improving"
          ? "▼ Easing"
          : inflationEvidence?.direction === "weakening"
            ? "▲ Rising"
            : "Stable",
      positive: inflationEvidence?.direction === "improving",
    },
  ];

  return (
    <main className="min-h-screen bg-[#050b14] text-white">
      <Navbar />
      <StatusBar />

      <div className="mx-auto max-w-[1600px] px-6 py-8">
        <MorningEdition macroEvidence={macroEvidence} />

        <section className="mt-8 rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
                Where are we today?
              </p>

              <h2 className="mt-3 text-4xl font-black text-white">
                {macroState.direction}
              </h2>

              <p className="mt-3 text-slate-400">{macroState.explanation}</p>
            </div>

            <div className="flex gap-4">
              <div className="rounded-2xl bg-emerald-400/10 px-6 py-4 text-center">
                <p className="text-3xl font-black text-emerald-300">
                  {macroState.supportive.length}
                </p>

                <p className="mt-1 text-xs uppercase tracking-wider text-emerald-400">
                  Supportive
                </p>
              </div>

              <div className="rounded-2xl bg-red-400/10 px-6 py-4 text-center">
                <p className="text-3xl font-black text-red-300">
                  {macroState.contradictory.length}
                </p>

                <p className="mt-1 text-xs uppercase tracking-wider text-red-400">
                  Headwinds
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {macroEvidence.map((indicator) => {
              const directionSymbol =
                indicator.direction === "improving"
                  ? "↑"
                  : indicator.direction === "weakening"
                    ? "↓"
                    : "→";

              const directionColour =
                indicator.direction === "improving"
                  ? "text-emerald-300"
                  : indicator.direction === "weakening"
                    ? "text-red-300"
                    : "text-slate-300";

              const formattedDate = indicator.observedAt
                ? new Date(
                    `${indicator.observedAt}T00:00:00`,
                  ).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Date unavailable";

              return (
                <div
                  key={indicator.id}
                  className="rounded-2xl border border-white/5 bg-white/[0.025] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">
                        {indicator.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {indicator.source}
                      </p>
                    </div>

                    <span
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                        indicator.signal === "supportive"
                          ? "bg-emerald-400"
                          : indicator.signal === "contradictory"
                            ? "bg-red-400"
                            : "bg-slate-400"
                      }`}
                    />
                  </div>

                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        Current
                      </p>

                      <p className="mt-1 text-2xl font-black text-white">
                        {formatEvidenceValue(indicator.current, indicator.unit)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        Previous
                      </p>

                      <p className="mt-1 font-semibold text-slate-300">
                        {formatEvidenceValue(
                          indicator.previous,
                          indicator.unit,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                    <p className={`text-sm font-bold ${directionColour}`}>
                      {directionSymbol}{" "}
                      {indicator.direction
                        ? indicator.direction.charAt(0).toUpperCase() +
                          indicator.direction.slice(1)
                        : "Unchanged"}
                    </p>

                    <p className="text-sm font-semibold text-slate-300">
                      {formatEvidenceChange(indicator.change, indicator.unit)}
                    </p>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-400">
                    {indicator.explanation ?? "No explanation available."}
                  </p>

                  <div className="mt-4 flex items-end justify-between gap-3">
                    <p className="text-xs text-slate-500">
                      Released {formattedDate}
                    </p>

                    <p
                      className={`text-xs font-bold uppercase tracking-wider ${
                        indicator.signal === "supportive"
                          ? "text-emerald-300"
                          : indicator.signal === "contradictory"
                            ? "text-red-300"
                            : "text-slate-400"
                      }`}
                    >
                      {indicator.signal === "contradictory"
                        ? "Headwind"
                        : indicator.signal}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-8">
          <section className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <SectionHeader
                eyebrow="Global Market Overview"
                title="Don't just follow the markets."
                subtitle="Understand what is driving them."
              />
            </div>

            <div className="text-left lg:text-right">
              <p className="text-sm text-slate-500">Last updated</p>
              <p className="font-semibold text-slate-300">Live prototype</p>
            </div>
          </section>

          <MarketSummaryCard
            headline={marketState.headline}
            summary={marketState.summary}
          />

          <section className="grid gap-6 xl:grid-cols-[1.25fr_2fr_1fr]">
            <BullBearCard
              probability={marketState.probability}
              marketState={marketState.marketState}
              confidence={marketState.confidence}
              confidenceScore={marketState.confidenceScore}
              onExplain={() => setShowWhy(!showWhy)}
              risk={marketState.risk}
            />

            <section className="space-y-6">
              <SignalGrid signals={marketSignals} />

              <article className="rounded-3xl border border-white/5 bg-[#0a1626] p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-widest text-slate-500">
                      Market Drivers
                    </p>

                    <h3 className="mt-2 text-2xl font-bold">
                      What is moving the score?
                    </h3>
                  </div>

                  <span className="text-sm text-cyan-400">
                    Live model preview
                  </span>
                </div>

                <div className="space-y-5">
                  {drivers.map((driver) => (
                    <div key={driver.name}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-slate-300">{driver.name}</span>

                        <span
                          className={
                            driver.positive
                              ? "font-bold text-emerald-300"
                              : "font-bold text-red-300"
                          }
                        >
                          {driver.positive ? "+" : "-"}
                          {driver.score}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/5">
                        <div
                          className={
                            driver.positive
                              ? "h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                              : "h-full rounded-full bg-gradient-to-r from-amber-400 to-red-400"
                          }
                          style={{ width: driver.width }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <aside className="space-y-6">
              <CountdownCard
                title="Next Major Event"
                event="US Manufacturing PMI"
                targetDate="2026-08-03T15:00:00+01:00"
              />

              <article className="rounded-3xl border border-white/5 bg-[#0a1626] p-6">
                <p className="text-sm uppercase tracking-widest text-slate-500">
                  Hot Themes
                </p>

                <div className="mt-5 space-y-4">
                  {themes.map((theme) => (
                    <ThemeCard
                      key={theme.id}
                      id={theme.id}
                      name={theme.name}
                      score={theme.score}
                      description={theme.description}
                    />
                  ))}
                </div>
              </article>
            </aside>
          </section>

          {showWhy && (
            <WhyPanel
              probability={marketState.probability}
              positiveDrivers={marketState.positiveDrivers}
              negativeDrivers={marketState.negativeDrivers}
              explanation={explanation}
            />
          )}

          <footer className="mt-8 flex flex-col justify-between gap-3 border-t border-white/5 py-6 text-xs text-slate-600 sm:flex-row">
            <p>TodayState Version 0.2 — Command Centre Prototype</p>
            <p>Research and education only — not financial advice</p>
          </footer>
        </div>
      </div>
    </main>
  );
}
