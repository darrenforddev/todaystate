import type { MBIEPulseData } from "@/data/mbiePulse";

type MBIEPulseProps = {
  pulse: MBIEPulseData;
};

export default function MBIEPulse({ pulse }: MBIEPulseProps) {
  return (
    <section className="rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
        MBIE Pulse
      </p>

      <h2 className="mt-3 text-2xl font-black text-white">{pulse.title}</h2>

      <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-300">
        {pulse.summary}
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300">
          {pulse.direction}
        </span>

        <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300">
          Score {pulse.score}
        </span>

        <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300">
          Confidence {pulse.confidence}%
        </span>
      </div>
    </section>
  );
}
