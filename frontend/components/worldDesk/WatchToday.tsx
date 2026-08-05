import type { MarketEvent } from "@/data/events";

type WatchTodayProps = {
  events: MarketEvent[];
};

function stars(priority: number) {
  const safePriority = Math.max(0, Math.min(priority, 5));

  return "★".repeat(safePriority) + "☆".repeat(5 - safePriority);
}

export default function WatchToday({ events }: WatchTodayProps) {
  return (
    <section className="h-full rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
        Watch Today
      </p>

      <h2 className="mt-3 text-3xl font-black text-white">Key Events</h2>

      <div className="mt-8 space-y-5">
        {events.map((event) => (
          <article
            key={event.id}
            className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition hover:border-cyan-400/20 hover:bg-white/[0.05]"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-amber-300">
                {stars(event.priority)}
              </span>

              <span className="text-sm text-cyan-300">{event.time}</span>
            </div>

            <h3 className="mt-3 text-lg font-bold text-white">{event.title}</h3>

            <p className="mt-2 text-sm text-slate-400">
              Expected impact: {event.impact}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
