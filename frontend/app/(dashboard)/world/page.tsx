import MarketStatus from "@/components/worldDesk/MarketStatus";
import MBIEPulse from "@/components/worldDesk/MBIEPulse";
import WorldDeskLayout from "@/components/worldDesk/WorldDeskLayout";
import WorldState from "@/components/worldDesk/WorldState";
import TopThemes from "@/components/worldDesk/TopThemes";
import WatchToday from "@/components/worldDesk/WatchToday";

export default function WorldDeskPage() {
  return (
    <main className="min-h-screen bg-[#050b14] text-white">
      <div className="mx-auto max-w-7xl p-10">
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
            TodayState
          </p>

          <h1 className="mt-3 text-5xl font-black">World Desk</h1>

          <p className="mt-4 max-w-3xl text-lg text-slate-400">
            Understand the world through explainable investment intelligence.
          </p>
        </header>

        <WorldDeskLayout
          marketStatus={<MarketStatus />}
          mbiePulse={<MBIEPulse />}
          worldState={<WorldState />}
          topThemes={<TopThemes />}
          watchToday={<WatchToday />}
          latestIntelligence={
            <PlaceholderCard
              eyebrow="Latest Intelligence"
              title="What Changed"
              description="The most important evidence and market developments detected today."
            />
          }
        />
      </div>
    </main>
  );
}

function PlaceholderCard({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="h-full rounded-3xl border border-white/5 bg-[#0a1626] p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
        {eyebrow}
      </p>

      <h2 className="mt-3 text-3xl font-black text-white">{title}</h2>

      <p className="mt-4 max-w-2xl leading-7 text-slate-400">{description}</p>

      <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-slate-500">
        Component coming next
      </div>
    </section>
  );
}
