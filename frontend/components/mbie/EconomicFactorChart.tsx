"use client";

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

const pmiHistory = [
  {
    period: "2026-06",
    month: "June",
    manufacturing: 53.3,
    services: 54.0,
  },
  {
    period: "2026-07",
    month: "July",
    manufacturing: 55.6,
    services: 54.1,
  },
  {
    period: "2026-08",
    month: "August",
    manufacturing: 54.6,
    services: 55.4,
  },
];

export default function EconomicFactorChart({
  selectedPeriod,
}: EconomicFactorChartProps) {
  const selectedMonth =
    pmiHistory.find((item) => item.period === selectedPeriod)?.month ??
    "August";

  return (
    <section className="mb-8 rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-300">
            Economic Factor Chart
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            Manufacturing vs Services PMI
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Monthly economic activity compared with the 50-point expansion
            boundary.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#091727] px-4 py-3 text-right">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Selected month
          </p>

          <p className="mt-1 font-black text-cyan-300">{selectedMonth} 2026</p>
        </div>
      </div>

      <div className="mt-8 h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={pmiHistory}
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
              domain={[45, 65]}
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
                name === "manufacturing" ? "Manufacturing PMI" : "Services PMI",
              ]}
            />

            <Legend
              formatter={(value) =>
                value === "manufacturing" ? "Manufacturing PMI" : "Services PMI"
              }
            />

            <ReferenceLine
              y={50}
              stroke="#f59e0b"
              strokeDasharray="6 6"
              label={{
                value: "Expansion boundary",
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
        Values above 50 indicate expansion. Values below 50 indicate
        contraction.
      </p>
    </section>
  );
}
