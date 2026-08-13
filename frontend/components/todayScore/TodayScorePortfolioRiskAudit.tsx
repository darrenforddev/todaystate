import type { BalancedPortfolioSelection } from "@/engine/todayScore/portfolio";
import TodayScorePortfolioExposure from "./TodayScorePortfolioExposure";
import {
  auditPortfolioSelection,
  type PortfolioExposure,
  type PortfolioReadinessStatus,
} from "@/engine/todayScore/portfolioRisk";

interface TodayScorePortfolioRiskAuditProps {
  selection: BalancedPortfolioSelection;
}

const statusStyles: Record<
  PortfolioReadinessStatus,
  {
    label: string;
    border: string;
    background: string;
    text: string;
  }
> = {
  "not-ready": {
    label: "Not ready",
    border: "border-rose-400/25",
    background: "bg-rose-400/[0.07]",
    text: "text-rose-300",
  },
  limited: {
    label: "Limited",
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

function ExposureList({
  title,
  exposures,
}: {
  title: string;
  exposures: PortfolioExposure[];
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-black text-white">{title}</h4>

        <span className="text-[10px] uppercase tracking-wider text-slate-600">
          Long / Short
        </span>
      </div>

      <div className="mt-4 space-y-4">
        {exposures.map((exposure) => (
          <div key={exposure.name}>
            <div className="flex items-center justify-between gap-4 text-xs">
              <span className="truncate font-semibold text-slate-300">
                {exposure.name}
              </span>

              <span className="shrink-0 tabular-nums text-slate-500">
                <span className="text-emerald-300">{exposure.longCount}</span>
                {" / "}
                <span className="text-rose-300">{exposure.shortCount}</span>
              </span>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-cyan-400"
                style={{
                  width: `${exposure.shareOfPositions}%`,
                }}
              />
            </div>

            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-600">
              <span>{exposure.shareOfPositions}% of positions</span>

              <span>
                Net{" "}
                {exposure.netCount > 0
                  ? `Long ${exposure.netCount}`
                  : exposure.netCount < 0
                    ? `Short ${Math.abs(exposure.netCount)}`
                    : "neutral"}
              </span>
            </div>
          </div>
        ))}

        {exposures.length === 0 && (
          <p className="text-xs text-slate-600">
            No selected positions are available.
          </p>
        )}
      </div>
    </div>
  );
}

export default function TodayScorePortfolioRiskAudit({
  selection,
}: TodayScorePortfolioRiskAuditProps) {
  const audit = auditPortfolioSelection(selection);
  const styles = statusStyles[audit.status];

  return (
    <section
      className={`mt-8 rounded-2xl border p-5 ${styles.border} ${styles.background}`}
    >
      <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">
            Portfolio readiness audit
          </p>

          <h3 className="mt-2 text-xl font-black text-white">
            Exposure and diversification checks
          </h3>
        </div>

        <span
          className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-wider ${styles.border} ${styles.background} ${styles.text}`}
        >
          {styles.label}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-600">
            Balanced pairs
          </p>
          <p className="mt-2 text-2xl font-black text-white">
            {audit.pairCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-600">
            Selected positions
          </p>
          <p className="mt-2 text-2xl font-black text-white">
            {audit.positionCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-600">
            Audit warnings
          </p>
          <p className={`mt-2 text-2xl font-black ${styles.text}`}>
            {audit.warnings.length}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ExposureList
          title="Sector exposure"
          exposures={audit.sectorExposure}
        />

        <ExposureList title="Theme exposure" exposures={audit.themeExposure} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] p-4">
          <p className="text-xs font-black uppercase tracking-wider text-emerald-300">
            Checks passed
          </p>

          <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-400">
            {audit.strengths.map((strength) => (
              <li key={strength}>• {strength}</li>
            ))}

            {audit.strengths.length === 0 && (
              <li>No readiness checks have passed yet.</li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.04] p-4">
          <p className="text-xs font-black uppercase tracking-wider text-amber-300">
            Risks requiring review
          </p>

          <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-400">
            {audit.warnings.map((warning) => (
              <li key={warning}>• {warning}</li>
            ))}

            {audit.warnings.length === 0 && (
              <li>No configured readiness warnings were triggered.</li>
            )}
          </ul>
        </div>
      </div>

      <TodayScorePortfolioExposure selection={selection} />

      <p className="mt-5 border-t border-slate-800/80 pt-4 text-[11px] leading-5 text-slate-600">
        {audit.methodology}
      </p>
    </section>
  );
}
