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
import {
  getISMManufacturingHistory,
  getISMServicesHistory,
} from "../repositories/evidenceRepository";

const drivers = [
  { name: "Manufacturing", score: "+8", width: "82%" },
  { name: "Services", score: "+7", width: "74%" },
  { name: "Employment", score: "+5", width: "61%" },
  { name: "Earnings", score: "+6", width: "68%" },
  { name: "Inflation", score: "-2", width: "34%" },
];

export default function Home() {
  const [showWhy, setShowWhy] = useState(false);
  const marketState = calculateMarketState(currentMarketData);

  const latestManufacturing = getISMManufacturingHistory().at(-1);

  const latestServices = getISMServicesHistory().at(-1);
  const marketSignals = [
    {
      name: "Manufacturing PMI",
      value: latestManufacturing?.manufacturingPMI.toString() ?? "--",
      change: "Expanding",
      positive: true,
    },
    {
      name: "Services PMI",
      value: latestServices?.servicesPMI.toString() ?? "--",
      change: "Expanding",
      positive: true,
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
                          driver.score.startsWith("+")
                            ? "font-bold text-emerald-300"
                            : "font-bold text-red-300"
                        }
                      >
                        {driver.score}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div
                        className={
                          driver.score.startsWith("+")
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
          />
        )}

        <footer className="mt-8 flex flex-col justify-between gap-3 border-t border-white/5 py-6 text-xs text-slate-600 sm:flex-row">
          <p>TodayState Version 0.2 — Command Centre Prototype</p>
          <p>Research and education only — not financial advice</p>
        </footer>
      </div>
    </main>
  );
}
