import type { ThemeIntelligence } from "@/engine/theme";
import CircularGauge from "@/components/ui/CircularGauge";
import IntelligenceBar from "@/components/ui/IntelligenceBar";

type ThemeCardProps = {
  theme: ThemeIntelligence;
};

export default function ThemeCard({ theme }: ThemeCardProps) {
  return (
    <section className="mt-10 rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
        Theme Intelligence
      </p>

      <div className="mt-6 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-black">{theme.name}</h2>

          <p className="mt-2 text-slate-400">{theme.signal}</p>
        </div>

        <CircularGauge value={theme.conviction} label="Conviction" />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="flex items-center justify-center rounded-2xl bg-white/[0.03] p-5">
          <CircularGauge
            value={theme.confidence}
            label="Evidence Confidence"
            suffix="%"
            size={130}
          />
        </div>

        <div className="rounded-2xl bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
            Narrative
          </p>

          <p className="mt-3 leading-7 text-slate-300">{theme.narrative}</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-white/[0.03] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
          Why MBIE Believes This
        </p>

        <ul className="mt-4 space-y-3">
          {theme.reasoning.map((reason, index) => (
            <li key={index} className="flex items-start gap-3 text-slate-300">
              <span className="mt-1 text-emerald-400">●</span>

              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
          Supporting Evidence
        </p>

        <div className="mt-4 space-y-3">
          {theme.evidence.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl bg-white/[0.03] p-4"
            >
              <span>{item.title}</span>

              <div className="mt-4">
                <IntelligenceBar
                  value={item.weight}
                  max={10}
                  label="Importance"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
