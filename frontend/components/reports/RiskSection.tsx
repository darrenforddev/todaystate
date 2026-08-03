type RiskSectionProps = {
  risks: string[];
};

export default function RiskSection({ risks }: RiskSectionProps) {
  return (
    <section className="mt-10 rounded-3xl border border-white/5 bg-[#0a1626] p-7">
      <h2 className="text-2xl font-bold">Primary Risks</h2>

      <div className="mt-6 space-y-4">
        {risks.map((risk) => (
          <div
            key={risk}
            className="flex items-start gap-3 rounded-2xl bg-white/[0.03] p-4"
          >
            <span className="text-xl text-amber-400">⚠</span>

            <p className="text-slate-300">{risk}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
