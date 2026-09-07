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

interface EconomicHistoryPoint {
  period: string;
  month: string;

  manufacturingPmi: number;
  servicesPmi: number;

  manufacturingNewOrders: number;
  servicesNewOrders: number;

  manufacturingOutput: number;
  servicesOutput: number;

  manufacturingEmployment: number;
  servicesEmployment: number;

  manufacturingPrices: number;
  servicesPrices: number;

  manufacturingBacklogs: number;
  servicesBacklogs: number;
}

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

const economicHistory: EconomicHistoryPoint[] = [
  {
    period: "2026-04",
    month: "April",

    manufacturingPmi: 52.7,
    servicesPmi: 53.6,

    manufacturingNewOrders: 54.1,
    servicesNewOrders: 53.5,

    manufacturingOutput: 53.4,
    servicesOutput: 55.9,

    manufacturingEmployment: 46.4,
    servicesEmployment: 48.0,

    manufacturingPrices: 84.6,
    servicesPrices: 70.7,

    manufacturingBacklogs: 51.4,
    servicesBacklogs: 53.0,
  },
  {
    period: "2026-05",
    month: "May",

    manufacturingPmi: 54.0,
    servicesPmi: 54.5,

    manufacturingNewOrders: 56.8,
    servicesNewOrders: 57.3,

    manufacturingOutput: 54.3,
    servicesOutput: 57.7,

    manufacturingEmployment: 48.6,
    servicesEmployment: 47.9,

    manufacturingPrices: 82.1,
    servicesPrices: 71.3,

    manufacturingBacklogs: 52.2,
    servicesBacklogs: 51.3,
  },

  {
    period: "2026-06",
    month: "June",

    manufacturingPmi: 53.3,
    servicesPmi: 54.0,

    manufacturingNewOrders: 56.0,
    servicesNewOrders: 55.1,

    manufacturingOutput: 52.2,
    servicesOutput: 55.4,

    manufacturingEmployment: 49.7,
    servicesEmployment: 51.2,

    manufacturingPrices: 73.0,
    servicesPrices: 67.7,

    manufacturingBacklogs: 50.5,
    servicesBacklogs: 54.9,
  },
  {
    period: "2026-07",
    month: "July",

    manufacturingPmi: 55.6,
    servicesPmi: 54.1,

    manufacturingNewOrders: 56.7,
    servicesNewOrders: 57.2,

    manufacturingOutput: 58.5,
    servicesOutput: 59.1,

    manufacturingEmployment: 52.8,
    servicesEmployment: 47.4,

    manufacturingPrices: 71.1,
    servicesPrices: 70.3,

    manufacturingBacklogs: 55.0,
    servicesBacklogs: 50.9,
  },
  {
    period: "2026-08",
    month: "August",

    manufacturingPmi: 54.6,
    servicesPmi: 55.4,

    manufacturingNewOrders: 53.7,
    servicesNewOrders: 60.9,

    manufacturingOutput: 58.3,
    servicesOutput: 61.7,

    manufacturingEmployment: 51.2,
    servicesEmployment: 47.8,

    manufacturingPrices: 71.1,
    servicesPrices: 72.6,

    manufacturingBacklogs: 51.8,
    servicesBacklogs: 55.6,
  },
];

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

  const selectedMonth =
    economicHistory.find((item) => item.period === selectedPeriod)?.month ??
    "August";

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

          <p className="mt-1 font-black text-cyan-300">{selectedMonth} 2026</p>
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
                fontSize: 12,
              }}
              tickLine={false}
              axisLine={{
                stroke: "#334155",
              }}
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
                r: 5,
                fill: "#020817",
                stroke: "#22d3ee",
                strokeWidth: 3,
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
                r: 5,
                fill: "#020817",
                stroke: "#a78bfa",
                strokeWidth: 3,
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
