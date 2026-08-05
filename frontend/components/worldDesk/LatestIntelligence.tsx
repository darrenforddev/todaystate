const intelligence = [
  {
    direction: "up",
    title: "Manufacturing activity strengthened",
    summary:
      "Production and new orders continued to improve across major industrial sectors.",
    confidence: 96,
  },
  {
    direction: "up",
    title: "AI infrastructure investment accelerated",
    summary:
      "Capital expenditure on AI data centres and supporting infrastructure remained strong.",
    confidence: 94,
  },
  {
    direction: "up",
    title: "Power grid investment remained robust",
    summary:
      "Electricity demand and grid modernisation continue to support long-term investment.",
    confidence: 91,
  },
  {
    direction: "down",
    title: "Commercial property weakened",
    summary:
      "Higher financing costs continue to pressure commercial real estate.",
    confidence: 74,
  },
];

export default function LatestIntelligence() {
  return (
    <section className="rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-7">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Latest Intelligence
          </p>

          <h2 className="mt-3 text-3xl font-black">What Changed</h2>
        </div>

        <span className="rounded-full bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
          Updated Now
        </span>
      </div>

      <div className="mt-8 space-y-5">
        {intelligence.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-white/5 bg-white/[0.03] p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">
                  {item.direction === "up" ? "▲" : "▼"}
                </span>

                <h3 className="text-lg font-bold">{item.title}</h3>
              </div>

              <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">
                {item.confidence}%
              </span>
            </div>

            <p className="mt-4 leading-7 text-slate-400">{item.summary}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
