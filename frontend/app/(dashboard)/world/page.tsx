import MarketStatus from "@/components/worldDesk/MarketStatus";
import MBIEPulse from "@/components/worldDesk/MBIEPulse";
import WorldDeskLayout from "@/components/worldDesk/WorldDeskLayout";
import WorldState from "@/components/worldDesk/WorldState";
import TopThemes from "@/components/worldDesk/TopThemes";
import WatchToday from "@/components/worldDesk/WatchToday";
import LatestIntelligence from "@/components/worldDesk/LatestIntelligence";

import { getWorldDeskData } from "@/services/worldDeskService";

export default function WorldDeskPage() {
  const dashboard = getWorldDeskData();

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
          mbiePulse={<MBIEPulse pulse={dashboard.mbiePulse} />}
          worldState={<WorldState />}
          topThemes={<TopThemes themes={dashboard.topThemes} />}
          watchToday={<WatchToday events={dashboard.watchToday} />}
          latestIntelligence={<LatestIntelligence />}
        />
      </div>
    </main>
  );
}
