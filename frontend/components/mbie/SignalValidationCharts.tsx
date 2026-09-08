"use client";

import { useMemo } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ThemeValidationPreview } from "@/engine/outcomes/themeValidation";

import type { OutcomeHorizon } from "@/engine/outcomes/types";

interface SignalValidationChartsProps {
  previews: ThemeValidationPreview[];

  selectedInstrumentId: string;
}

interface HorizonChartDefinition {
  horizon: OutcomeHorizon;
  dataKey: "oneMonth" | "threeMonth" | "sixMonth";
  label: string;
  colour: string;
}

const HORIZONS: HorizonChartDefinition[] = [
  {
    horizon: "one-month",
    dataKey: "oneMonth",
    label: "1 Month",
    colour: "#22d3ee",
  },
  {
    horizon: "three-month",
    dataKey: "threeMonth",
    label: "3 Months",
    colour: "#a78bfa",
  },
  {
    horizon: "six-month",
    dataKey: "sixMonth",
    label: "6 Months",
    colour: "#34d399",
  },
];

function roundValue(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatReportPeriod(reportPeriod: string): string {
  const date = new Date(`${reportPeriod}-01T00:00:00Z`);

  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

function calculateSuccessRate(
  previews: ThemeValidationPreview[],
  horizon: OutcomeHorizon,
): number | null {
  const outcomes = previews
    .flatMap((preview) => preview.record.outcomes)
    .filter(
      (outcome) =>
        outcome.horizon === horizon &&
        (outcome.status === "successful" || outcome.status === "unsuccessful"),
    );

  if (outcomes.length === 0) {
    return null;
  }

  const successful = outcomes.filter(
    (outcome) => outcome.status === "successful",
  ).length;

  return roundValue((successful / outcomes.length) * 100);
}

function getSignalAlignedReturn(
  preview: ThemeValidationPreview,
  horizon: OutcomeHorizon,
): number | null {
  const outcome = preview.record.outcomes.find(
    (candidate) => candidate.horizon === horizon,
  );

  if (
    !outcome ||
    outcome.relativeReturn === undefined ||
    outcome.status === "pending" ||
    preview.record.signal.direction === "neutral"
  ) {
    return null;
  }

  /**
   * Positive values always mean the market result
   * moved in the direction predicted by MBIE.
   *
   * A positive signal expects outperformance.
   * A negative signal expects underperformance,
   * so its relative return is inverted.
   */
  const alignedReturn =
    preview.record.signal.direction === "negative"
      ? -outcome.relativeReturn
      : outcome.relativeReturn;

  return roundValue(alignedReturn);
}

function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  return roundValue(
    values.reduce((total, value) => total + value, 0) / values.length,
  );
}

export default function SignalValidationCharts({
  previews,
  selectedInstrumentId,
}: SignalValidationChartsProps) {
  const instrumentAccuracyData = useMemo(() => {
    const instruments = Array.from(
      new Map(
        previews.map((preview) => [
          preview.record.signal.instrumentId,

          {
            id: preview.record.signal.instrumentId,

            ticker: preview.record.signal.instrumentTicker,

            name: preview.record.signal.instrumentName,
          },
        ]),
      ).values(),
    );

    return instruments.map((instrument) => {
      const instrumentPreviews = previews.filter(
        (preview) => preview.record.signal.instrumentId === instrument.id,
      );

      return {
        instrumentId: instrument.id,

        ticker: instrument.ticker,

        name: instrument.name,

        oneMonth: calculateSuccessRate(instrumentPreviews, "one-month"),

        threeMonth: calculateSuccessRate(instrumentPreviews, "three-month"),

        sixMonth: calculateSuccessRate(instrumentPreviews, "six-month"),
      };
    });
  }, [previews]);

  const activePreviews = useMemo(
    () =>
      selectedInstrumentId === "all"
        ? previews
        : previews.filter(
            (preview) =>
              preview.record.signal.instrumentId === selectedInstrumentId,
          ),
    [previews, selectedInstrumentId],
  );

  const relativePerformanceData = useMemo(() => {
    const reportPeriods = Array.from(
      new Set(
        activePreviews.map((preview) => preview.record.signal.reportPeriod),
      ),
    ).sort();

    return reportPeriods.map((reportPeriod) => {
      const periodPreviews = activePreviews.filter(
        (preview) => preview.record.signal.reportPeriod === reportPeriod,
      );

      const point = {
        reportPeriod,

        label: formatReportPeriod(reportPeriod),

        oneMonth: null as number | null,

        threeMonth: null as number | null,

        sixMonth: null as number | null,
      };

      for (const horizon of HORIZONS) {
        const values = periodPreviews
          .map((preview) => getSignalAlignedReturn(preview, horizon.horizon))
          .filter((value): value is number => value !== null);

        point[horizon.dataKey] = average(values);
      }

      return point;
    });
  }, [activePreviews]);

  const selectedInstrument = previews.find(
    (preview) => preview.record.signal.instrumentId === selectedInstrumentId,
  )?.record.signal;

  const relativeChartLabel =
    selectedInstrumentId === "all"
      ? "Combined instrument average"
      : selectedInstrument
        ? `${selectedInstrument.instrumentName} (${selectedInstrument.instrumentTicker})`
        : "Selected instrument";

  if (previews.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 rounded-3xl border border-cyan-400/20 bg-[#071321] p-6 sm:p-8">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
          Graphical Validation
        </p>

        <h3 className="mt-2 text-xl font-black text-white">
          Signal Accuracy and Market Response
        </h3>

        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
          Compare accuracy across instruments, then follow how strongly market
          performance moved with or against each historical MBIE signal.
        </p>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
          <div className="mb-5">
            <h4 className="font-black text-white">Accuracy by Instrument</h4>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Percentage of decisive outcomes classified as successful.
            </p>
          </div>

          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={instrumentAccuracyData}
                margin={{
                  top: 10,
                  right: 10,
                  bottom: 10,
                  left: 0,
                }}
              >
                <CartesianGrid stroke="#1e293b" vertical={false} />

                <XAxis
                  dataKey="ticker"
                  stroke="#64748b"
                  tick={{
                    fill: "#cbd5e1",
                    fontSize: 12,
                  }}
                />

                <YAxis
                  domain={[0, 100]}
                  unit="%"
                  stroke="#64748b"
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 11,
                  }}
                />

                <Tooltip
                  cursor={{
                    fill: "rgba(30, 41, 59, 0.35)",
                  }}
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    color: "#e2e8f0",
                  }}
                />

                <Legend />

                {HORIZONS.map((horizon) => (
                  <Bar
                    key={horizon.horizon}
                    dataKey={horizon.dataKey}
                    name={horizon.label}
                    fill={horizon.colour}
                    unit="%"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-5">
          <div className="mb-5">
            <h4 className="font-black text-white">
              Signal-Aligned Relative Performance
            </h4>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {relativeChartLabel}. Values above zero support the original
              signal; values below zero contradict it.
            </p>
          </div>

          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={relativePerformanceData}
                margin={{
                  top: 10,
                  right: 16,
                  bottom: 10,
                  left: 0,
                }}
              >
                <CartesianGrid stroke="#1e293b" vertical={false} />

                <XAxis
                  dataKey="label"
                  stroke="#64748b"
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 10,
                  }}
                  interval="preserveStartEnd"
                />

                <YAxis
                  unit="%"
                  stroke="#64748b"
                  tick={{
                    fill: "#94a3b8",
                    fontSize: 11,
                  }}
                />

                <ReferenceLine
                  y={0}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  label={{
                    value: "Signal boundary",
                    fill: "#fbbf24",
                    fontSize: 10,
                    position: "insideTopRight",
                  }}
                />

                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "12px",
                    color: "#e2e8f0",
                  }}
                />

                <Legend />

                {HORIZONS.map((horizon) => (
                  <Line
                    key={horizon.horizon}
                    type="monotone"
                    dataKey={horizon.dataKey}
                    name={horizon.label}
                    stroke={horizon.colour}
                    strokeWidth={2}
                    dot={{
                      r: 3,
                      fill: horizon.colour,
                    }}
                    activeDot={{
                      r: 5,
                    }}
                    connectNulls={false}
                    unit="%"
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <p className="mt-5 text-xs leading-5 text-slate-500">
        Twelve-month outcomes are intentionally omitted until enough
        observations have matured. Inconclusive outcomes remain visible in the
        performance graph but are excluded from decisive accuracy percentages.
      </p>
    </section>
  );
}
