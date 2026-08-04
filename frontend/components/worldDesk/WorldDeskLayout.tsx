type WorldDeskLayoutProps = {
  marketStatus: React.ReactNode;
  mbiePulse: React.ReactNode;
  worldState: React.ReactNode;
  topThemes: React.ReactNode;
  watchToday: React.ReactNode;
  latestIntelligence: React.ReactNode;
};

export default function WorldDeskLayout({
  marketStatus,
  mbiePulse,
  worldState,
  topThemes,
  watchToday,
  latestIntelligence,
}: WorldDeskLayoutProps) {
  return (
    <div className="space-y-8">
      {marketStatus}

      <div className="grid gap-8 xl:grid-cols-2">
        {mbiePulse}
        {worldState}
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        {topThemes}
        {watchToday}
      </div>

      {latestIntelligence}
    </div>
  );
}
