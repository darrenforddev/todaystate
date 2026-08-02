export default function Navbar() {
  return (
    <header className="border-b border-cyan-400/10 bg-[#07111f]/95">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight">
            TODAY<span className="text-cyan-400">STATE</span>
          </h1>

          <p className="text-xs text-slate-500">Market Intelligence</p>
        </div>

        <nav className="hidden gap-7 text-sm text-slate-400 lg:flex">
          <button className="font-semibold text-cyan-400">
            Market Brain
          </button>
          <button className="transition hover:text-white">Themes</button>
          <button className="transition hover:text-white">Markets</button>
          <button className="transition hover:text-white">Stocks</button>
          <button className="transition hover:text-white">Calendar</button>
          <button className="transition hover:text-white">Learning</button>
        </nav>

        <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
          ● System Online
        </div>
      </div>
    </header>
  );
}