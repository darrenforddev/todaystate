"use client";

import { useState } from "react";

import type { OutcomeHorizon, OutcomeStatus } from "@/engine/outcomes/types";

import type { OutcomeReplayPoint } from "@/engine/outcomes/outcomeReplay";

interface OutcomeReplayChartProps {
  selectionId: string;
  horizon: OutcomeHorizon;
  status: OutcomeStatus;
}

interface ReplayInstrument {
  name: string;
  ticker: string;
  quoteCurrency: string;
  entryPrice: number;
}

interface ReplayData {
  startDate: string;
  endDate: string;
  company: ReplayInstrument;
  benchmark: ReplayInstrument;
  companySeries: OutcomeReplayPoint[];
  benchmarkSeries: OutcomeReplayPoint[];
  providerName: string;
  fetchedAt: string;
}

interface ReplayApiResponse {
  success: boolean;
  replay?: ReplayData;
  error?: string;
}

const WIDTH = 900;
const HEIGHT = 360;
const LEFT = 66;
const RIGHT = 24;
const TOP = 24;
const BOTTOM = 48;

function formatReturn(value: number): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function getFinalReturn(
  series: readonly OutcomeReplayPoint[],
): number | undefined {
  return series[series.length - 1]?.returnFromEntry;
}

function createLinePath(
  series: readonly OutcomeReplayPoint[],
  minimumTimestamp: number,
  maximumTimestamp: number,
  minimumReturn: number,
  maximumReturn: number,
): string {
  const chartWidth = WIDTH - LEFT - RIGHT;
  const chartHeight = HEIGHT - TOP - BOTTOM;
  const timestampRange = Math.max(1, maximumTimestamp - minimumTimestamp);
  const returnRange = Math.max(1, maximumReturn - minimumReturn);

  return series
    .map((point, index) => {
      const x =
        LEFT +
        ((point.timestamp - minimumTimestamp) / timestampRange) * chartWidth;

      const y =
        TOP +
        ((maximumReturn - point.returnFromEntry) / returnRange) * chartHeight;

      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export default function OutcomeReplayChart({
  selectionId,
  horizon,
  status,
}: OutcomeReplayChartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [replay, setReplay] = useState<ReplayData | null>(null);

  async function loadReplay(): Promise<void> {
    if (replay) {
      setIsOpen(true);
      return;
    }

    setIsOpen(true);
    setIsLoading(true);
    setErrorMessage("");

    try {
      const parameters = new URLSearchParams({
        selectionId,
        horizon,
      });

      const response = await fetch(
        `/api/selection-outcomes/replay?${parameters.toString()}`,
        {
          cache: "no-store",
        },
      );

      const result = (await response.json()) as ReplayApiResponse;

      if (!response.ok || !result.success || !result.replay) {
        throw new Error(
          result.error ?? "The complete price chart could not be loaded.",
        );
      }

      setReplay(result.replay);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The complete price chart could not be loaded.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (status === "pending") {
    return null;
  }

  const allPoints = replay
    ? [...replay.companySeries, ...replay.benchmarkSeries]
    : [];

  const timestamps = allPoints.map((point) => point.timestamp);

  const returns = allPoints.map((point) => point.returnFromEntry);

  const minimumTimestamp = timestamps.length > 0 ? Math.min(...timestamps) : 0;

  const maximumTimestamp = timestamps.length > 0 ? Math.max(...timestamps) : 1;

  const rawMinimumReturn = returns.length > 0 ? Math.min(...returns, 0) : 0;

  const rawMaximumReturn = returns.length > 0 ? Math.max(...returns, 0) : 0;
  const verticalPadding = Math.max(
    2,
    (rawMaximumReturn - rawMinimumReturn) * 0.12,
  );
  const minimumReturn = rawMinimumReturn - verticalPadding;
  const maximumReturn = rawMaximumReturn + verticalPadding;

  const zeroY =
    TOP +
    ((maximumReturn - 0) / Math.max(1, maximumReturn - minimumReturn)) *
      (HEIGHT - TOP - BOTTOM);

  const companyReturn = replay
    ? getFinalReturn(replay.companySeries)
    : undefined;

  const benchmarkReturn = replay
    ? getFinalReturn(replay.benchmarkSeries)
    : undefined;

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
          } else {
            void loadReplay();
          }
        }}
        className="rounded-xl border border-cyan-400/30 bg-cyan-400/[0.07] px-4 py-2 text-sm font-bold text-cyan-200 transition hover:border-cyan-300/60 hover:bg-cyan-400/[0.12]"
      >
        {isOpen ? "Hide price chart" : "View complete price chart"}
      </button>

      {isOpen && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 p-4 md:p-6">
          {isLoading && (
            <p className="text-sm text-slate-400">
              Loading adjusted daily prices…
            </p>
          )}

          {!isLoading && errorMessage && (
            <div className="rounded-xl border border-rose-400/25 bg-rose-400/[0.07] p-4">
              <p className="font-bold text-rose-300">
                Price replay unavailable
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {errorMessage}
              </p>
            </div>
          )}

          {!isLoading && replay && allPoints.length > 0 && (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                    Trade outcome replay
                  </p>
                  <h4 className="mt-2 text-lg font-black text-white">
                    {replay.company.name} against {replay.benchmark.name}
                  </h4>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(replay.startDate)} to{" "}
                    {formatDate(replay.endDate)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-2 text-cyan-200">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                    {replay.company.ticker}
                  </span>
                  <span className="flex items-center gap-2 text-amber-200">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                    {replay.benchmark.ticker}
                  </span>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <svg
                  viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                  role="img"
                  aria-label={`${replay.company.name} and ${replay.benchmark.name} percentage returns from entry`}
                  className="h-auto min-w-[700px] w-full"
                >
                  <line
                    x1={LEFT}
                    x2={WIDTH - RIGHT}
                    y1={zeroY}
                    y2={zeroY}
                    stroke="rgb(71 85 105)"
                    strokeDasharray="6 6"
                  />

                  <text
                    x={LEFT - 10}
                    y={zeroY + 4}
                    textAnchor="end"
                    fill="rgb(148 163 184)"
                    fontSize="12"
                  >
                    0%
                  </text>

                  <text
                    x={LEFT - 10}
                    y={TOP + 5}
                    textAnchor="end"
                    fill="rgb(148 163 184)"
                    fontSize="12"
                  >
                    {formatReturn(rawMaximumReturn)}
                  </text>

                  <text
                    x={LEFT - 10}
                    y={HEIGHT - BOTTOM}
                    textAnchor="end"
                    fill="rgb(148 163 184)"
                    fontSize="12"
                  >
                    {formatReturn(rawMinimumReturn)}
                  </text>

                  <path
                    d={createLinePath(
                      replay.companySeries,
                      minimumTimestamp,
                      maximumTimestamp,
                      minimumReturn,
                      maximumReturn,
                    )}
                    fill="none"
                    stroke="rgb(34 211 238)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d={createLinePath(
                      replay.benchmarkSeries,
                      minimumTimestamp,
                      maximumTimestamp,
                      minimumReturn,
                      maximumReturn,
                    )}
                    fill="none"
                    stroke="rgb(252 211 77)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <text
                    x={LEFT}
                    y={HEIGHT - 14}
                    fill="rgb(100 116 139)"
                    fontSize="12"
                  >
                    {formatDate(replay.startDate)}
                  </text>

                  <text
                    x={WIDTH - RIGHT}
                    y={HEIGHT - 14}
                    textAnchor="end"
                    fill="rgb(100 116 139)"
                    fontSize="12"
                  >
                    {formatDate(replay.endDate)}
                  </text>
                </svg>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.05] p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    {replay.company.ticker} chart-period return
                  </p>
                  <p className="mt-2 text-xl font-black text-cyan-300">
                    {companyReturn === undefined
                      ? "Unavailable"
                      : formatReturn(companyReturn)}
                  </p>
                </div>

                <div className="rounded-xl border border-amber-300/20 bg-amber-300/[0.05] p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    {replay.benchmark.ticker} chart-period return
                  </p>
                  <p className="mt-2 text-xl font-black text-amber-200">
                    {benchmarkReturn === undefined
                      ? "Unavailable"
                      : formatReturn(benchmarkReturn)}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-[11px] leading-5 text-slate-600">
                Adjusted daily closing prices supplied by {replay.providerName}.
                Chart lines are rebased to the first available trading close so
                both instruments begin at 0%.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
