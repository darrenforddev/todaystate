import { themes } from "../../../data/themes";
import IntelligenceHeader from "../../../components/IntelligenceHeader";

export default async function ThemePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const theme = themes.find((t) => t.id === id);
  if (!theme) {
    return (
      <main className="min-h-screen bg-[#050b14] p-10 text-white">
        <h1 className="text-4xl font-bold">Theme not found</h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050b14] p-10 text-white">
      <div className="mx-auto max-w-5xl">
        <IntelligenceHeader
          title={theme.name}
          score={theme.score}
          confidence={theme.confidence}
          momentum={theme.momentum}
          lifecycle={theme.lifecycle}
        />
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
          {theme.description}
        </p>
        <section className="mt-10 rounded-3xl border border-white/5 bg-[#0a1626] p-7">
          <h2 className="text-2xl font-bold">
            Why TodayState Likes This Theme
          </h2>

          <div className="mt-6 space-y-4">
            {theme.why.map((reason) => (
              <div
                key={reason}
                className="flex items-start gap-3 rounded-2xl bg-white/[0.03] p-4"
              >
                <span className="text-xl text-emerald-400">✓</span>

                <p className="text-slate-300">{reason}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="mt-10 rounded-3xl border border-white/5 bg-[#0a1626] p-7">
          <h2 className="text-2xl font-bold">Primary Risks</h2>

          <div className="mt-6 space-y-4">
            {theme.risks.map((risk) => (
              <div
                key={risk}
                className="flex items-start gap-3 rounded-2xl bg-white/[0.03] p-4"
              >
                <span className="text-xl text-amber-400">⚠</span>

                <p className="text-slate-300">{risk}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="mt-10 rounded-3xl border border-white/5 bg-[#0a1626] p-7">
          <h2 className="text-2xl font-bold">Related ETFs</h2>

          <div className="mt-6 flex flex-wrap gap-3">
            {theme.etfs.map((etf) => (
              <span
                key={etf}
                className="rounded-full bg-cyan-400/10 px-4 py-2 font-semibold text-cyan-300"
              >
                {etf}
              </span>
            ))}
          </div>
        </section>
        <section className="mt-10 rounded-3xl border border-white/5 bg-[#0a1626] p-7">
          <h2 className="text-2xl font-bold">Companies benefiting</h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {theme.companies.map((company) => (
              <div
                key={company}
                className="rounded-2xl bg-white/[0.03] px-4 py-3 text-slate-300"
              >
                {company}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
