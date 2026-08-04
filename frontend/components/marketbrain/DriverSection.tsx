import { calculateThemeScore } from "@/engine/scoring";

export default function DriverSection() {
  const industrialRecovery = calculateThemeScore("industrial-recovery");

  return (
    <section className="mt-10 rounded-3xl border border-white/5 bg-[#0a1626] p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
        Economic Drivers
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-white/[0.03] p-5">
          <p className="text-sm text-slate-400">Industrial Recovery</p>

          <p className="mt-2 text-3xl font-black text-emerald-300">
            {industrialRecovery}
          </p>
        </div>

        <div className="rounded-2xl bg-white/[0.03] p-5">
          <p className="text-sm text-slate-400">Employment</p>
          <p className="mt-2 text-3xl font-black text-emerald-300">84</p>
        </div>

        <div className="rounded-2xl bg-white/[0.03] p-5">
          <p className="text-sm text-slate-400">Inflation</p>
          <p className="mt-2 text-3xl font-black text-amber-300">63</p>
        </div>
      </div>
    </section>
  );
}
