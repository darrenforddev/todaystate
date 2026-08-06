"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import BullBearCard from "../components/BullBearCard";
import { calculateMarketState } from "../lib/marketBrain";
import { currentMarketData } from "../data/currentMarketData";
import SignalGrid from "../components/SignalGrid";
import WhyPanel from "../components/WhyPanel";
import CountdownCard from "../components/CountdownCard";
import MarketSummaryCard from "../components/MarketSummaryCard";
import StatusBar from "../components/StatusBar";
import ThemeCard from "../components/ThemeCard";
import { themes } from "../data/themes";
import { getDrivers } from "../engine/driverEngine";
import { getMarketExplanation } from "../engine/explainEngine";
import MorningEdition from "../components/morning-edition/MorningEdition";
import {
  getManufacturingSummary,
  getServicesSummary,
} from "../repositories/evidenceRepository";

export default function Home() {
  const [showWhy, setShowWhy] = useState(false);
  const marketState = calculateMarketState(currentMarketData);
  const explanation = getMarketExplanation();

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
      value: "Improving",
      change: "Positive",
      positive: true,
    },
    {
      name: "Inflation Pressure",
      value: "Elevated",
      change: "Watch",
      positive: false,
    },
  ];

  return (
    <main className="min-h-screen bg-[#050b14] text-white">
      <Navbar />
      <StatusBar />

      <div className="mx-auto max-w-[1600px] px-6 py-8">
        <MorningEdition />

        <div className="mt-8">
          <section className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
                Global Market Overview
              </p>

              <h2 className="max-w-4xl text-3xl font-bold tracking-tight sm:text-5xl">
                Don&apos;t just follow the markets.
                <span className="block text-slate-400">
                  Understand what is driving them.
                </span>
              </h2>
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
            <CountdownCard
              title="Next Major Event"
              event="US Manufacturing PMI"
              targetDate="2026-08-03T15:00:00+01:00"
            />

            <aside className="space-y-6">
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
