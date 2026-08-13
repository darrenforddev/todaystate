import type { BalancedPortfolioSelection } from "@/engine/todayScore/portfolio";
import { calculatePortfolioExposure } from "@/engine/todayScore/portfolioExposure";

interface TodayScorePortfolioExposureProps {
  selection: BalancedPortfolioSelection;
}

const currencyFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

function ExposureMetric({
  label,
  value,
  detail,
  valueClassName = "text-white",
}: {
  label: string;
  value: string;
  detail: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className={`mt-2 text-xl font-black tabular-nums ${valueClassName}`}>
        {value}
      </p>

      <p className="mt-1 text-[10px] leading-4 text-slate-600">{detail}</p>
    </div>
  );
}

export default function TodayScorePortfolioExposure({
  selection,
}: TodayScorePortfolioExposureProps) {
  const report = calculatePortfolioExposure(selection);

  const assumedPositionSize = report.positions[0]?.notional ?? 0;

  const netDirection =
    report.capital.netNotional > 0
      ? "Long"
      : report.capital.netNotional < 0
        ? "Short"
        : "Neutral";

  const hasCompleteBetaCoverage =
    report.beta.totalPositions > 0 &&
    report.beta.coveredPositions === report.beta.totalPositions;

  return (
    <section className="mt-5 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.035] p-5">
      <div className="flex flex-col gap-3 border-b border-slate-800/80 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">
            Capital and beta exposure
          </p>

          <h4 className="mt-2 text-lg font-black text-white">
            Research notional analysis
          </h4>

          <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
            Equal position counts do not necessarily create equal market risk.
            This panel tests capital balance now and is ready to accept company
            beta data later.
          </p>
        </div>

        <span
          className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${
            report.capital.isCapitalNeutral
              ? "border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-300"
              : "border-amber-400/25 bg-amber-400/[0.07] text-amber-300"
          }`}
        >
          {report.capital.isCapitalNeutral
            ? "Capital neutral"
            : "Capital imbalance"}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <ExposureMetric
          label="Assumed position"
          value={formatCurrency(assumedPositionSize)}
          detail="Research notional per selected company"
          valueClassName="text-cyan-300"
        />

        <ExposureMetric
          label="Long notional"
          value={formatCurrency(report.capital.longNotional)}
          detail={`${selection.longCandidates.length} selected Long position${
            selection.longCandidates.length === 1 ? "" : "s"
          }`}
          valueClassName="text-emerald-300"
        />

        <ExposureMetric
          label="Short notional"
          value={formatCurrency(report.capital.shortNotional)}
          detail={`${selection.shortCandidates.length} selected Short position${
            selection.shortCandidates.length === 1 ? "" : "s"
          }`}
          valueClassName="text-rose-300"
        />

        <ExposureMetric
          label="Gross exposure"
          value={formatCurrency(report.capital.grossNotional)}
          detail="Long plus Short research notional"
        />

        <ExposureMetric
          label="Net exposure"
          value={formatCurrency(report.capital.netNotional)}
          detail={`${netDirection} · ${Math.abs(
            report.capital.netExposurePercentage,
          )}% of gross`}
          valueClassName={
            report.capital.isCapitalNeutral
              ? "text-emerald-300"
              : "text-amber-300"
          }
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-emerald-300">
                Capital balance
              </p>

              <p className="mt-2 text-sm font-bold text-white">
                {report.capital.isCapitalNeutral
                  ? "Long and Short notionals are equal"
                  : "Long and Short notionals differ"}
              </p>
            </div>

            <p className="text-2xl font-black tabular-nums text-emerald-300">
              {report.capital.longShortRatio ?? "—"}
            </p>
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Long-to-Short notional ratio. A ratio of 1 represents dollar
            neutrality before costs, dividends and financing.
          </p>
        </div>

        <div
          className={`rounded-2xl border p-4 ${
            hasCompleteBetaCoverage
              ? "border-emerald-400/15 bg-emerald-400/[0.04]"
              : "border-amber-400/15 bg-amber-400/[0.04]"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p
                className={`text-xs font-black uppercase tracking-wider ${
                  hasCompleteBetaCoverage
                    ? "text-emerald-300"
                    : "text-amber-300"
                }`}
              >
                Beta coverage
              </p>

              <p className="mt-2 text-sm font-bold text-white">
                {hasCompleteBetaCoverage
                  ? report.beta.isBetaNeutral
                    ? "Within beta-neutral tolerance"
                    : "Beta imbalance requires review"
                  : "Awaiting company beta data"}
              </p>
            </div>

            <p
              className={`text-2xl font-black tabular-nums ${
                hasCompleteBetaCoverage ? "text-emerald-300" : "text-amber-300"
              }`}
            >
              {report.beta.coveragePercentage}%
            </p>
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            {report.beta.coveredPositions} of {report.beta.totalPositions}{" "}
            selected positions currently have usable beta data. Capital
            neutrality does not guarantee beta neutrality.
          </p>
        </div>
      </div>

      <p className="mt-4 border-t border-slate-800/80 pt-4 text-[11px] leading-5 text-slate-600">
        {report.methodology}
      </p>
    </section>
  );
}
