import CircularGauge from "@/components/ui/CircularGauge";

export default function ThemeHero() {
  return (
    <div className="rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
            Theme Intelligence
          </p>

          <h1 className="mt-3 text-5xl font-black">Industrial Recovery</h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
            Improving manufacturing activity continues to reinforce industrial
            expansion. MBIE believes this remains one of today's
            highest-conviction investment themes.
          </p>
        </div>

        <CircularGauge value={95} label="Conviction" suffix="" size={190} />
      </div>
    </div>
  );
}
