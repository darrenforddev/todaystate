const stages = [
  { name: "Repository", status: "complete" },
  { name: "Knowledge", status: "complete" },
  { name: "Evidence", status: "complete" },
  { name: "Reasoning", status: "complete" },
  { name: "Theme", status: "complete" },
  { name: "Confidence", status: "coming" },
  { name: "Narrative", status: "coming" },
];

export default function Pipeline() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
            MBIE
          </p>

          <h2 className="text-2xl font-bold text-white">
            Intelligence Pipeline
          </h2>
        </div>

        <div className="rounded-full bg-green-500/20 px-4 py-2 text-sm font-semibold text-green-400">
          Operational
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {stages.map((stage, index) => (
          <div key={stage.name} className="flex items-center">
            <div className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3">
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${
                    stage.status === "complete"
                      ? "bg-green-400"
                      : "bg-amber-400"
                  }`}
                />

                <span className="font-semibold text-white">{stage.name}</span>
              </div>

              <p className="mt-2 text-xs text-slate-400">
                {stage.status === "complete" ? "Ready" : "Coming Soon"}
              </p>
            </div>

            {index < stages.length - 1 && (
              <div className="mx-2 text-cyan-400 text-xl font-bold">→</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
