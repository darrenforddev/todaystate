type MarketSummaryCardProps = {
  headline: string;
  summary: string;
};

export default function MarketSummaryCard({
  headline,
  summary,
}: MarketSummaryCardProps) {
  return (
    <section className="mb-8 rounded-3xl border border-cyan-400/15 bg-[#0a1626] p-8 shadow-xl shadow-cyan-950/20">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
        TODAY'S MARKET OUTLOOK
      </p>

      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white">
        {headline}
      </h1>

      <p className="mt-4 max-w-3xl leading-7 text-slate-300">{summary}</p>
    </section>
  );
}
