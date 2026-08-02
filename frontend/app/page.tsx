"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import BullBearCard from "../components/BullBearCard";

const marketSignals = [
  {
    name: "Manufacturing PMI",
    value: "53.3",
    change: "Expanding",
    positive: true,
  },
  {
    name: "Services PMI",
    value: "54.0",
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

const drivers = [
  { name: "Manufacturing", score: "+8", width: "82%" },
  { name: "Services", score: "+7", width: "74%" },
  { name: "Employment", score: "+5", width: "61%" },
  { name: "Earnings", score: "+6", width: "68%" },
  { name: "Inflation", score: "-2", width: "34%" },
];

export default function Home() {
  const [showWhy, setShowWhy] = useState(false);

  return (
    <main className="min-h-screen bg-[#050b14] text-white">
      <Navbar />

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

        <section className="grid gap-6 xl:grid-cols-[1.25fr_2fr_1fr]">
          <BullBearCard
  probability={78}
  marketState="Bull Market"
  confidence="High"
  risk="Moderate"
/>
          <section className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {marketSignals.map((signal) => (
                <article
                  key={signal.name}
                  className="rounded-2xl border border-white/5 bg-[#0a1626] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500">{signal.name}</p>
                      <p className="mt-3 text-3xl font-black">{signal.value}</p>
                    </div>

                    <span
                      className={
                        signal.positive
                          ? "rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300"
                          : "rounded-full bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300"
                      }
                    >
                      {signal.change}
                    </span>
                  </div>
                </article>
              ))}
            </div>

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

                <span className="text-sm text-cyan-400">Live model preview</span>
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

          <aside className="space-y-6">
            <article className="rounded-3xl border border-violet-400/15 bg-[#0a1626] p-6">
              <p className="text-sm uppercase tracking-widest text-violet-300">
                Next Major Event
              </p>

              <h3 className="mt-3 text-xl font-bold">
                US Manufacturing PMI
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                High-impact macro release
              </p>

              <div className="my-6 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-white/[0.04] p-3">
                  <p className="text-2xl font-black">01</p>
                  <p className="text-[10px] uppercase text-slate-500">Days</p>
                </div>

                <div className="rounded-xl bg-white/[0.04] p-3">
                  <p className="text-2xl font-black">08</p>
                  <p className="text-[10px] uppercase text-slate-500">Hours</p>
                </div>

                <div className="rounded-xl bg-white/[0.04] p-3">
                  <p className="text-2xl font-black">42</p>
                  <p className="text-[10px] uppercase text-slate-500">
                    Minutes
                  </p>
                </div>
              </div>

              <button className="w-full rounded-xl border border-violet-400/25 py-3 text-sm font-bold text-violet-300 transition hover:bg-violet-400/10">
                OPEN CALENDAR
              </button>
            </article>

            <article className="rounded-3xl border border-white/5 bg-[#0a1626] p-6">
              <p className="text-sm uppercase tracking-widest text-slate-500">
                Hot Themes
              </p>

              <div className="mt-5 space-y-3">
                {[
                  ["AI Infrastructure", "94"],
                  ["Industrial Recovery", "88"],
                  ["Power Grid", "85"],
                  ["Copper", "82"],
                ].map(([name, score]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-3"
                  >
                    <span className="text-sm text-slate-300">{name}</span>
                    <span className="font-bold text-cyan-300">{score}</span>
                  </div>
                ))}
              </div>
            </article>
          </aside>
        </section>

        {showWhy && (
          <section className="mt-6 rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-950/30 to-[#0a1626] p-7">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  TodayState Explanation
                </p>

                <h3 className="mt-3 text-3xl font-bold">
                  Why is TodayState currently bullish?
                </h3>

                <p className="mt-5 max-w-3xl leading-7 text-slate-300">
                  Manufacturing and services activity are both expanding.
                  Employment conditions are improving, while company earnings
                  remain supportive. Inflation is still a risk, so the market
                  view is bullish rather than extremely bullish.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  {[
                    "PMI expansion",
                    "Services growth",
                    "Employment improving",
                    "Earnings supportive",
                  ].map((reason) => (
                    <span
                      key={reason}
                      className="rounded-full bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300"
                    >
                      ✓ {reason}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-black/20 p-5">
                <h4 className="font-bold text-amber-300">
                  What would change this view?
                </h4>

                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  <li>• Manufacturing PMI falling below 50</li>
                  <li>• Inflation accelerating unexpectedly</li>
                  <li>• Earnings forecasts turning negative</li>
                  <li>• Credit conditions deteriorating sharply</li>
                </ul>
              </div>
            </div>
          </section>
        )}

        <footer className="mt-8 flex flex-col justify-between gap-3 border-t border-white/5 py-6 text-xs text-slate-600 sm:flex-row">
          <p>TodayState Version 0.2 — Command Centre Prototype</p>
          <p>Research and education only — not financial advice</p>
        </footer>
      </div>
    </main>
  );
}