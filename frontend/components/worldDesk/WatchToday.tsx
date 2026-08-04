const events = [
  {
    title: "US ISM Services PMI",
    time: "15:00 BST",
    priority: 5,
    impact: "High",
  },
  {
    title: "Bank of England Speech",
    time: "12:30 BST",
    priority: 4,
    impact: "Medium",
  },
  {
    title: "US Oil Inventories",
    time: "15:30 BST",
    priority: 4,
    impact: "Medium",
  },
  {
    title: "Fed Governor Speech",
    time: "18:00 BST",
    priority: 3,
    impact: "Low",
  },
];

function stars(priority: number) {
  return "★".repeat(priority) + "☆".repeat(5 - priority);
}

export default function WatchToday() {
  return (
    <section className="rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
        Watch Today
      </p>

      <h2 className="mt-3 text-3xl font-black text-white">Key Events</h2>

      <div className="mt-8 space-y-5">
        {events.map((event) => (
          <div
            key={event.title}
            className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition hover:border-cyan-400/20 hover:bg-white/[0.05]"
          >
            <div className="flex items-center justify-between">
              <span className="text-amber-300 font-semibold">
                {stars(event.priority)}
              </span>

              <span className="text-sm text-cyan-300">{event.time}</span>
            </div>

            <h3 className="mt-3 text-lg font-bold">{event.title}</h3>

            <p className="mt-2 text-sm text-slate-400">
              Expected Impact: {event.impact}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
