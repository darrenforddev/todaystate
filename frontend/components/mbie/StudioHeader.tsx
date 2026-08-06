interface StudioHeaderProps {
  version: string;
}

export default function StudioHeader({ version }: StudioHeaderProps) {
  return (
    <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
          MBIE Development Console
        </p>

        <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
          MBIE Studio
        </h1>

        <p className="mt-3 text-slate-400">
          Economic Intelligence Mission Control
        </p>
      </div>

      <div className="w-fit rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.08] px-6 py-4">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
          Version
        </p>

        <p className="mt-1 text-2xl font-bold text-white">{version}</p>
      </div>
    </header>
  );
}
