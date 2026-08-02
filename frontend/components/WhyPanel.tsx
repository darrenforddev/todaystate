type WhyPanelProps = {
  probability: number;
  positiveDrivers: string[];
  negativeDrivers: string[];
};

export default function WhyPanel({
  probability,
  positiveDrivers,
  negativeDrivers,
}: WhyPanelProps) {
  return (
    <section className="rounded-3xl border border-cyan-400/15 bg-[#0a1626] p-6">
      <h2 className="text-2xl font-bold">🧠 Explain Score</h2>

      <p className="mt-2 text-slate-400">
        Today's Bull Probability is
        <span className="ml-2 font-bold text-emerald-400">{probability}%</span>
      </p>

      <div className="mt-8">
        <h3 className="font-bold text-emerald-300">Positive Drivers</h3>

        <ul className="mt-3 space-y-2">
          {positiveDrivers.map((driver) => (
            <li key={driver}>✅ {driver}</li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="font-bold text-red-300">Negative Drivers</h3>

        <ul className="mt-3 space-y-2">
          {negativeDrivers.map((driver) => (
            <li key={driver}>⚠️ {driver}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
