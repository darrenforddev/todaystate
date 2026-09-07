"use client";

import { useMemo, useState } from "react";

import {
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

import {
  economicHistory,
  formatEconomicPeriod,
  type EconomicHistoryPoint,
} from "@/data/economicHistory";

interface EconomicFactorChartProps {
  selectedPeriod: string;
}

type FactorKey =
  | "pmi"
  | "newOrders"
  | "output"
  | "employment"
  | "prices"
  | "backlogs";

interface FactorDefinition {
  label: string;
  title: string;
  description: string;
  manufacturingKey: keyof EconomicHistoryPoint;
  servicesKey: keyof EconomicHistoryPoint;
  manufacturingLabel: string;
  servicesLabel: string;
  boundaryLabel: string;
  footer: string;
}

const factorDefinitions: Record<FactorKey, FactorDefinition> = {
  pmi: {
    label: "PMI",
    title: "Manufacturing vs Services PMI",
    description:
      "Overall monthly economic activity across manufacturing and services.",
    manufacturingKey: "manufacturingPmi",
    servicesKey: "servicesPmi",
    manufacturingLabel: "Manufacturing PMI",
    servicesLabel: "Services PMI",
    boundaryLabel: "Expansion boundary",
    footer:
      "Values above 50 indicate expansion. Values below 50 indicate contraction.",
  },

  newOrders: {
    label: "New Orders",
    title: "New Orders",
    description:
      "Forward-looking demand entering manufacturing and services businesses.",
    manufacturingKey: "manufacturingNewOrders",
    servicesKey: "servicesNewOrders",
    manufacturingLabel: "Manufacturing New Orders",
    servicesLabel: "Services New Orders",
    boundaryLabel: "Growth boundary",
    footer:
      "Values above 50 indicate growing orders. Values below 50 indicate declining orders.",
  },

  output: {
    label: "Output",
    title: "Production vs Business Activity",
    description:
      "Current manufacturing production compared with services business activity.",
    manufacturingKey: "manufacturingOutput",
    servicesKey: "servicesOutput",
    manufacturingLabel: "Manufacturing Production",
    servicesLabel: "Services Business Activity",
    boundaryLabel: "Growth boundary",
    footer:
      "Manufacturing uses Production; Services uses Business Activity. Above 50 indicates growth.",
  },

  employment: {
    label: "Employment",
    title: "Employment Conditions",
    description:
      "Hiring conditions and workforce activity across both economic sectors.",
    manufacturingKey: "manufacturingEmployment",
    servicesKey: "servicesEmployment",
    manufacturingLabel: "Manufacturing Employment",
    servicesLabel: "Services Employment",
    boundaryLabel: "Employment boundary",
    footer:
      "Values above 50 indicate expanding employment. Values below 50 indicate contraction.",
  },

  prices: {
    label: "Prices",
    title: "Prices Paid",
    description:
      "The breadth of input-price increases reported by purchasing managers.",
    manufacturingKey: "manufacturingPrices",
    servicesKey: "servicesPrices",
    manufacturingLabel: "Manufacturing Prices",
    servicesLabel: "Services Prices",
    boundaryLabel: "No-change boundary",
    footer:
      "Values above 50 indicate prices are increasing. Higher readings imply broader inflation pressure.",
  },

  backlogs: {
    label: "Backlogs",
    title: "Backlog of Orders",
    description:
      "Orders received but not yet completed across manufacturing and services.",
    manufacturingKey: "manufacturingBacklogs",
    servicesKey: "servicesBacklogs",
    manufacturingLabel: "Manufacturing Backlogs",
    servicesLabel: "Services Backlogs",
    boundaryLabel: "Growth boundary",
    footer:
      "Values above 50 indicate growing backlogs. Values below 50 indicate shrinking backlogs.",
  },
};

const factorOrder: FactorKey[] = [
  "pmi",
  "newOrders",
  "output",
  "employment",
  "prices",
  "backlogs",
];

export default function EconomicFactorChart({
  selectedPeriod,
}: EconomicFactorChartProps) {
  const [selectedFactor, setSelectedFactor] = useState<FactorKey>("pmi");

  const definition = factorDefinitions[selectedFactor];

  const selectedPoint =
    economicHistory.find((item) => item.period === selectedPeriod) ??
    economicHistory[economicHistory.length - 1];

  const selectedMonth = selectedPoint?.month ?? "August";

  const selectedPeriodLabel = selectedPoint
    ? formatEconomicPeriod(selectedPoint.period)
    : "August 2026";

  const chartData = useMemo(
    () =>
      economicHistory.map((item) => ({
        period: item.period,
        month: item.month,
        manufacturing: Number(item[definition.manufacturingKey]),
        services: Number(item[definition.servicesKey]),
      })),
    [definition],
  );

  const chartDomain = useMemo(() => {
    const values = chartData.flatMap((item) => [
      item.manufacturing,
      item.services,
      50,
    ]);

    const minimum = Math.floor(Math.min(...values) - 3);

    const maximum = Math.ceil(Math.max(...values) + 3);

    return [minimum, maximum] as [number, number];
  }, [chartData]);

  return (
    <section className="mb-8 rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
            Economic Factor Chart
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            {definition.title}
          </h2>

          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            {definition.description}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#091727] px-4 py-3 text-right">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Selected month
          </p>

          <p className="mt-1 font-black text-cyan-300">{selectedPeriodLabel}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {factorOrder.map((factor) => {
          const factorDefinition = factorDefinitions[factor];

          const isSelected = factor === selectedFactor;

          return (
            <button
              key={factor}
              type="button"
              onClick={() => setSelectedFactor(factor)}
              className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wider transition ${
                isSelected
                  ? "border-cyan-300 bg-cyan-300 text-slate-950"
                  : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-cyan-400/30 hover:text-cyan-300"
              }`}
            >
              {factorDefinition.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8 h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 10,
              right: 20,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid
              stroke="#1e293b"
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              stroke="#64748b"
              tick={{
                fill: "#94a3b8",
                fontSize: 11,
              }}
              tickFormatter={(month) => String(month).slice(0, 3)}
              tickLine={false}
              axisLine={{
                stroke: "#334155",
              }}
              interval={0}
            />

            <YAxis
              domain={chartDomain}
              stroke="#64748b"
              tick={{
                fill: "#94a3b8",
                fontSize: 12,
              }}
              tickLine={false}
              axisLine={false}
              width={36}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#071525",
                border: "1px solid rgba(34, 211, 238, 0.25)",
                borderRadius: "12px",
                color: "#ffffff",
              }}
              labelStyle={{
                color: "#67e8f9",
                fontWeight: 800,
                marginBottom: "6px",
              }}
              formatter={(value, name) => [
                `${Number(value).toFixed(1)}%`,
                name === "manufacturing"
                  ? definition.manufacturingLabel
                  : definition.servicesLabel,
              ]}
            />

            <Legend
              formatter={(value) =>
                value === "manufacturing"
                  ? definition.manufacturingLabel
                  : definition.servicesLabel
              }
            />

            <ReferenceLine
              y={50}
              stroke="#f59e0b"
              strokeDasharray="6 6"
              label={{
                value: definition.boundaryLabel,
                position: "insideTopRight",
                fill: "#fbbf24",
                fontSize: 11,
              }}
            />

            <ReferenceLine
              x={selectedMonth}
              stroke="#22d3ee"
              strokeOpacity={0.45}
              strokeWidth={2}
            />

            <Line
              type="monotone"
              dataKey="manufacturing"
              name="manufacturing"
              stroke="#22d3ee"
              strokeWidth={3}
              dot={{
                r: 4,
                fill: "#020817",
                stroke: "#22d3ee",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 7,
                fill: "#22d3ee",
                stroke: "#ecfeff",
                strokeWidth: 2,
              }}
            />

            <Line
              type="monotone"
              dataKey="services"
              name="services"
              stroke="#a78bfa"
              strokeWidth={3}
              dot={{
                r: 4,
                fill: "#020817",
                stroke: "#a78bfa",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 7,
                fill: "#a78bfa",
                stroke: "#f5f3ff",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        {definition.footer}
      </p>
    </section>
  );
}
