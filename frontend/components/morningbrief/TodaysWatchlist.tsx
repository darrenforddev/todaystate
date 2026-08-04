import { getTodaysWatchlist } from "@/engine/watchlist";
import StatusBadge from "@/components/ui/StatusBadge";

export default function TodaysWatchlist() {
  const events = getTodaysWatchlist();

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div
          key={event.id}
          className="rounded-2xl border border-white/5 bg-[#0a1626] p-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">{event.title}</h3>

            <span className="text-cyan-300 font-semibold">{event.time}</span>
          </div>

          <p className="mt-4 text-slate-400">{event.description}</p>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Expected Impact
              </p>

              <p className="mt-2 text-2xl">{"⭐".repeat(event.impact)}</p>
            </div>

            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                Status
              </p>

              <StatusBadge text={event.status} variant="upcoming" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
