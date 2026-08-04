import LiveEventCard from "@/components/live/LiveEventCard";

export default function LivePage() {
  return (
    <main className="min-h-screen bg-[#050b14] p-10 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
          Live Intelligence
        </p>

        <h1 className="mt-4 text-5xl font-black tracking-tight">
          Market Brain Live
        </h1>

        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
          Real-time economic releases, market impact and connected investment
          intelligence.
        </p>

        <LiveEventCard />
      </div>
    </main>
  );
}
