import type { BalancedPortfolioSelection } from "@/engine/todayScore/portfolio";

import type { PortfolioPositionDataCoverage } from "@/engine/todayScore/portfolioAnalysis";

import type { PortfolioCompanyMarketDataInput } from "@/engine/todayScore/portfolioMarketData";

import {
  runPortfolioAnalysisPipeline,
  type PortfolioPipelineOptions,
  type PortfolioPipelineStatus,
} from "@/engine/todayScore/portfolioPipeline";

interface TodayScorePortfolioAnalysisReadinessProps {
  selection: BalancedPortfolioSelection;
  providerInputs?: PortfolioCompanyMarketDataInput[];
  pipelineOptions?: PortfolioPipelineOptions;
}

const statusStyles: Record<
  PortfolioPipelineStatus,
  {
    label: string;
    border: string;
    background: string;
    text: string;
  }
> = {
  "not-ready": {
    label: "Not assessable",
    border: "border-rose-400/25",
    background: "bg-rose-400/[0.07]",
    text: "text-rose-300",
  },
  limited: {
    label: "Data incomplete",
    border: "border-amber-400/25",
    background: "bg-amber-400/[0.07]",
    text: "text-amber-300",
  },
  "research-ready": {
    label: "Research ready",
    border: "border-emerald-400/25",
    background: "bg-emerald-400/[0.07]",
    text: "text-emerald-300",
  },
};

function CoverageMetric({
  label,
  covered,
  total,
  percentage,
}: {
  label: string;
  covered: number;
  total: number;
  percentage: number;
}) {
  const complete = total > 0 && covered === total;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
            {label}
          </p>

          <p className="mt-2 text-xl font-black tabular-nums text-white">
            {covered}/{total}
          </p>
        </div>

        <span
          className={
            complete
              ? "text-sm font-black text-emerald-300"
              : "text-sm font-black text-amber-300"
          }
        >
          {percentage}%
        </span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full ${
            complete ? "bg-emerald-400" : "bg-amber-400"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function AvailabilityState({
  label,
  available,
  notRequired = false,
}: {
  label: string;
  available: boolean;
  notRequired?: boolean;
}) {
  const text = notRequired
    ? "Not required"
    : available
      ? "Available"
      : "Awaiting data";

  const colour = notRequired
    ? "text-slate-500"
    : available
      ? "text-emerald-300"
      : "text-amber-300";

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/35 px-3 py-2.5">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className={`mt-1 text-[11px] font-bold ${colour}`}>{text}</p>
    </div>
  );
}

function PositionCoverage({
  position,
}: {
  position: PortfolioPositionDataCoverage;
}) {
  const betaLabel =
    position.betaSource === "supplied"
      ? "Supplied"
      : position.betaSource === "calculated"
        ? "Calculated"
        : "Awaiting data";

  const betaColour =
    position.betaSource === "unavailable"
      ? "text-amber-300"
      : "text-emerald-300";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-black text-white">{position.ticker}</p>

          <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-600">
            Position data coverage
          </p>
        </div>

        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase ${
            position.side === "long"
              ? "border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-300"
              : "border-rose-400/25 bg-rose-400/[0.07] text-rose-300"
          }`}
        >
          {position.side}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <div className="rounded-xl border border-slate-800 bg-slate-950/35 px-3 py-2.5">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600">
            Beta
          </p>

          <p className={`mt-1 text-[11px] font-bold ${betaColour}`}>
            {betaLabel}
          </p>
        </div>

        <AvailabilityState
          label="Prices"
          available={position.hasPriceHistory}
        />

        <AvailabilityState
          label="Liquidity"
          available={position.hasLiquidityData}
        />

        <AvailabilityState
          label="Costs"
          available={position.hasTransactionCostData}
        />

        <AvailabilityState
          label="Short borrow"
          available={position.hasBorrowData}
          notRequired={position.side === "long"}
        />
      </div>
    </div>
  );
}

export default function TodayScorePortfolioAnalysisReadiness({
  selection,
  providerInputs = [],
  pipelineOptions,
}: TodayScorePortfolioAnalysisReadinessProps) {
  const pipeline = runPortfolioAnalysisPipeline(
    selection,
    providerInputs,
    pipelineOptions,
  );

  const analysis = pipeline.analysis;
  const coverage = analysis.coverage;
  const styles = statusStyles[pipeline.status];

  return (
    <section
      className={`mt-8 rounded-2xl border p-5 ${styles.border} ${styles.background}`}
    >
      <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">
            Portfolio data readiness
          </p>

          <h3 className="mt-2 text-xl font-black text-white">
            Combined risk-analysis coverage
          </h3>

          <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500">
            The portfolio risk engines are working. Their output remains limited
            until verified price history, beta, liquidity, transaction cost and
            Short-borrow inputs are supplied.
          </p>
        </div>

        <span
          className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-wider ${styles.border} ${styles.background} ${styles.text}`}
        >
          {styles.label}
        </span>
      </div>

      <div className="mt-5 grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/35 p-4 sm:grid-cols-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
            Provider records accepted
          </p>

          <p className="mt-2 text-lg font-black tabular-nums text-white">
            {pipeline.coverage.acceptedCompanyCount}/
            {pipeline.coverage.suppliedCompanyCount}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
            Selected positions matched
          </p>

          <p className="mt-2 text-lg font-black tabular-nums text-white">
            {pipeline.coverage.matchedPositionCount}/
            {pipeline.coverage.selectedPositionCount}
          </p>

          <p className="mt-1 text-[10px] text-slate-600">
            {pipeline.coverage.matchedPositionPercentage}% provider coverage
          </p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
            Adapter status
          </p>

          <p
            className={`mt-2 text-sm font-black ${
              pipeline.marketData.status === "ready"
                ? "text-emerald-300"
                : pipeline.marketData.status === "invalid"
                  ? "text-rose-300"
                  : "text-amber-300"
            }`}
          >
            {pipeline.marketData.status === "ready"
              ? "Ready"
              : pipeline.marketData.status === "invalid"
                ? "Invalid records blocked"
                : "Awaiting complete data"}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CoverageMetric
          label="Beta coverage"
          covered={coverage.betaCoveredPositions}
          total={coverage.positionCount}
          percentage={coverage.betaCoveragePercentage}
        />

        <CoverageMetric
          label="Price history"
          covered={coverage.priceCoveredPositions}
          total={coverage.positionCount}
          percentage={coverage.priceCoveragePercentage}
        />

        <CoverageMetric
          label="Liquidity"
          covered={coverage.liquidityCoveredPositions}
          total={coverage.positionCount}
          percentage={coverage.liquidityCoveragePercentage}
        />

        <CoverageMetric
          label="Implementation costs"
          covered={coverage.implementationCostCoveredPositions}
          total={coverage.positionCount}
          percentage={coverage.implementationCostCoveragePercentage}
        />
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/35 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
            Volatility and correlation analysis
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {coverage.statisticsAvailable
              ? "Historical portfolio statistics are available."
              : "Awaiting complete price history for every selected position."}
          </p>
        </div>

        <span
          className={`w-fit rounded-full border px-3 py-1 text-[10px] font-black uppercase ${
            coverage.statisticsAvailable
              ? "border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-300"
              : "border-amber-400/25 bg-amber-400/[0.07] text-amber-300"
          }`}
        >
          {coverage.statisticsAvailable ? "Available" : "Awaiting data"}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-xs font-black uppercase tracking-wider text-slate-500">
          Selected-position coverage
        </p>

        <div className="mt-3 grid gap-3">
          {analysis.positionCoverage.map((position) => (
            <PositionCoverage
              key={`${position.side}-${position.companyId}`}
              position={position}
            />
          ))}

          {analysis.positionCoverage.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-5 text-xs text-slate-500">
              No selected positions are available for data-readiness analysis.
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] p-4">
          <p className="text-xs font-black uppercase tracking-wider text-emerald-300">
            Analysis strengths
          </p>

          <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-400">
            {analysis.strengths.map((strength) => (
              <li key={strength}>• {strength}</li>
            ))}

            {analysis.strengths.length === 0 && (
              <li>No combined analysis checks have passed yet.</li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-4">
          <p className="text-xs font-black uppercase tracking-wider text-amber-300">
            Data and risk warnings
          </p>

          <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-400">
            {analysis.warnings.map((warning) => (
              <li key={warning}>• {warning}</li>
            ))}

            {analysis.warnings.length === 0 && (
              <li>No combined portfolio warnings were triggered.</li>
            )}
          </ul>
        </div>
      </div>

      <p className="mt-5 border-t border-slate-800/80 pt-4 text-[11px] leading-5 text-slate-600">
        {analysis.methodology}
      </p>
    </section>
  );
}
