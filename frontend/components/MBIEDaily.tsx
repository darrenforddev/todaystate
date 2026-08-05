import { getMarketExplanation } from "@/engine/explainEngine";
import { getManufacturingSummary } from "@/repositories/evidenceRepository";
import { getServicesSummary } from "@/repositories/evidenceRepository";

export default function MBIEDaily() {
  const explanation = getMarketExplanation();

  const manufacturing = getManufacturingSummary();
  const services = getServicesSummary();

  return (
    <section className="rounded-3xl border border-cyan-400/20 bg-[#08121f] p-8">
      <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">
        🌅 MBIE Daily
      </p>

      <h2 className="mt-3 text-3xl font-black">Good Evening</h2>

      <p className="mt-6 text-slate-300 leading-8">{explanation.conclusion}</p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl bg-white/[0.03] p-5">
          <p className="text-sm text-slate-500">Manufacturing</p>

          <p className="mt-2 text-4xl font-black">{manufacturing?.value}</p>

          <p className="text-emerald-300 mt-2">
            ▲ {manufacturing?.change.toFixed(1)}
          </p>
        </div>

        <div className="rounded-2xl bg-white/[0.03] p-5">
          <p className="text-sm text-slate-500">Services</p>

          <p className="mt-2 text-4xl font-black">{services?.value}</p>

          <p className="text-emerald-300 mt-2">
            ▲ {services?.change.toFixed(1)}
          </p>
        </div>
      </div>
    </section>
  );
}
