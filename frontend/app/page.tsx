export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 text-sm font-semibold tracking-[0.35em] text-cyan-400">
          MARKET INTELLIGENCE
        </p>

        <h1 className="text-6xl font-bold tracking-tight sm:text-8xl">
          TODAY<span className="text-cyan-400">STATE</span>
        </h1>

        <h2 className="mt-8 max-w-4xl text-2xl font-medium text-slate-200 sm:text-4xl">
          Don&apos;t just follow the markets.
          <span className="block text-cyan-400">
            Understand what is driving them.
          </span>
        </h2>

        <div className="mt-14 rounded-3xl border border-cyan-400/20 bg-slate-900/70 p-8">
          <p className="text-sm uppercase tracking-widest text-slate-400">
            Current Market State
          </p>

          <div className="mt-5 text-4xl font-bold text-emerald-400">
            Bull Probability
          </div>

          <div className="mt-4 text-7xl font-bold">Loading...</div>

          <button
            type="button"
            className="mt-8 rounded-full bg-cyan-400 px-8 py-3 font-bold text-slate-950"
          >
            WHY?
          </button>
        </div>

        <p className="mt-10 text-sm text-slate-500">
          TodayState Version 0.1
        </p>
      </div>
    </main>
  );
}