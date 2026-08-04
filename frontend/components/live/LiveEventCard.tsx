import ThemeLinkSection from "@/components/reports/ThemeLinkSection";
import CompanySection from "@/components/reports/CompanySection";
import ETFSection from "@/components/reports/ETFSection";
export default function LiveEventCard() {
  return (
    <section className="mt-10 rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-7">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
            03 August 2026 · 15:00
          </p>

          <h2 className="mt-3 text-3xl font-black">
            July ISM Manufacturing PMI
          </h2>

          <p className="mt-3 text-slate-400">
            U.S. manufacturing expanded at its fastest rate since May 2022.
          </p>
        </div>

        <div className="rounded-2xl bg-emerald-400/10 px-5 py-4 text-right">
          <p className="text-xs uppercase tracking-widest text-emerald-300">
            Market Brain Impact
          </p>

          <p className="mt-2 text-xl font-black text-emerald-300">
            Strong Positive
          </p>

          <p className="mt-1 text-sm text-slate-400">Confidence +3</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            PMI
          </p>
          <p className="mt-2 text-2xl font-black text-cyan-300">55.6</p>
        </div>

        <div className="rounded-2xl bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Production
          </p>
          <p className="mt-2 text-2xl font-black text-emerald-300">58.5</p>
        </div>

        <div className="rounded-2xl bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Employment
          </p>
          <p className="mt-2 text-2xl font-black text-emerald-300">52.8</p>
        </div>

        <div className="rounded-2xl bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-widest text-slate-500">
            Prices
          </p>
          <p className="mt-2 text-2xl font-black text-amber-300">71.1</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
          Market Brain View
        </p>

        <p className="mt-4 text-lg leading-8 text-slate-300">
          July&apos;s report shows a broad-based acceleration in U.S.
          manufacturing. Production surged, employment returned to expansion,
          order backlogs strengthened and export orders improved. Pricing
          pressure remains elevated, but the overall signal is strongly positive
          for industrial recovery and supportive of AI infrastructure and power
          investment.
        </p>
      </div>
      <ThemeLinkSection
        themes={[
          {
            id: "industrial-recovery",
            name: "Industrial Recovery",
          },
          {
            id: "ai-infrastructure",
            name: "AI Infrastructure",
          },
          {
            id: "power-grid",
            name: "Power Grid",
          },
        ]}
      />
      <CompanySection
        companies={[
          { id: "nvidia", name: "NVIDIA" },
          { id: "broadcom", name: "Broadcom" },
          { id: "vertiv", name: "Vertiv" },
          { id: "caterpillar", name: "Caterpillar" },
          { id: "eaton", name: "Eaton" },
        ]}
      />
      <ETFSection etfs={["SMH", "XLI", "VIS"]} />
    </section>
  );
}
