import type { CompanyIntelligence } from "@/engine/company";
import CircularGauge from "@/components/ui/CircularGauge";

type CompanyCardProps = {
  company: CompanyIntelligence;
};

export default function CompanyCard({ company }: CompanyCardProps) {
  return (
    <section className="mt-10 rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
        Company Intelligence
      </p>

      <div className="mt-6 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-black">{company.name}</h2>

          <p className="mt-2 text-slate-400">MBIE Company Assessment</p>
        </div>

        <CircularGauge value={company.conviction} label="Conviction" />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="flex items-center justify-center rounded-2xl bg-white/[0.03] p-5">
          <CircularGauge
            value={company.confidence}
            label="Evidence Confidence"
            suffix="%"
            size={130}
          />
        </div>

        <div className="rounded-2xl bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
            Narrative
          </p>

          <p className="mt-3 leading-7 text-slate-300">{company.narrative}</p>
        </div>
      </div>
    </section>
  );
}
