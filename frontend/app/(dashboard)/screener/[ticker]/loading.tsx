export default function TodayScoreCompanyLoading() {
  return (
    <main
      aria-live="polite"
      className="min-h-screen bg-[#020817] px-5 py-10 text-white md:px-10 xl:px-12"
    >
      <div className="mx-auto max-w-[1500px] animate-pulse">
        <div className="h-5 w-52 rounded bg-cyan-300/20" />

        <div className="mt-8 border-b border-slate-800 pb-8">
          <div className="h-4 w-20 rounded bg-cyan-300/20" />
          <div className="mt-4 h-12 w-80 max-w-full rounded bg-slate-700/50" />
          <div className="mt-4 h-4 w-72 max-w-full rounded bg-slate-800" />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-52 rounded-3xl border border-slate-800 bg-[#07111f]"
            />
          ))}
        </div>

        <p className="mt-8 text-sm font-semibold text-cyan-200">
          Loading TodayScore company report…
        </p>
      </div>
    </main>
  );
}
