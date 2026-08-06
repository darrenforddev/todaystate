const systems = [
  { name: "Repository", status: "Healthy", colour: "bg-green-500" },
  { name: "Knowledge", status: "Healthy", colour: "bg-green-500" },
  { name: "Evidence", status: "Healthy", colour: "bg-green-500" },
  { name: "Reasoning", status: "Healthy", colour: "bg-green-500" },
  { name: "Theme", status: "Healthy", colour: "bg-green-500" },
  { name: "Confidence", status: "Pending", colour: "bg-yellow-500" },
  { name: "Narrative", status: "Waiting", colour: "bg-slate-500" },
];

export default function SystemStatus() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-400">
          System Status
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">MBIE Health</h2>
      </div>

      <div className="space-y-3">
        {systems.map((system) => (
          <div
            key={system.name}
            className="flex items-center justify-between rounded-lg bg-slate-800 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${system.colour}`} />

              <span className="text-white">{system.name}</span>
            </div>

            <span className="text-sm font-semibold text-slate-300">
              {system.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
