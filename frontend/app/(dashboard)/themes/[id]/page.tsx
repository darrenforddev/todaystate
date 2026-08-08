import { notFound } from "next/navigation";

import { getTheme } from "@/engine/theme";

interface ThemePageProps {
  params: Promise<{
    id: string;
  }>;
}

type EvidenceDirection = "supportive" | "contradictory" | "neutral";

function getDirectionBadgeStyles(direction: EvidenceDirection): string {
  if (direction === "supportive") {
    return [
      "border-emerald-400/30",
      "bg-emerald-400/10",
      "text-emerald-300",
    ].join(" ");
  }

  if (direction === "contradictory") {
    return ["border-rose-400/30", "bg-rose-400/10", "text-rose-300"].join(" ");
  }

  return ["border-slate-400/30", "bg-slate-400/10", "text-slate-300"].join(" ");
}

function formatDirection(direction: EvidenceDirection): string {
  return direction.charAt(0).toUpperCase() + direction.slice(1);
}

function getSignalStyles(signal: string): string {
  if (signal === "Strong Positive" || signal === "Positive") {
    return "text-emerald-400";
  }

  if (signal === "Cautiously Positive") {
    return "text-amber-300";
  }

  if (
    signal === "Cautiously Negative" ||
    signal === "Negative" ||
    signal === "Strong Negative"
  ) {
    return "text-rose-400";
  }

  return "text-slate-300";
}

export default async function ThemePage({ params }: ThemePageProps) {
  const { id } = await params;

  let theme;

  try {
    theme = getTheme(id);
  } catch {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#050b14] px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">
          TodayState Intelligence
        </p>

        <h1 className="mt-4 text-5xl font-black tracking-tight">
          {theme.name}
        </h1>

        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
          {theme.narrative}
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <section className="rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-6">
            <p className="text-sm uppercase tracking-wider text-slate-400">
              Conviction
            </p>

            <p className="mt-3 text-5xl font-black text-white">
              {theme.conviction}%
            </p>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              How strongly the balance of supportive and contradictory evidence
              supports this theme.
            </p>
          </section>

          <section className="rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-6">
            <p className="text-sm uppercase tracking-wider text-slate-400">
              Confidence
            </p>

            <p className="mt-3 text-5xl font-black text-cyan-300">
              {theme.confidence}%
            </p>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              How reliable the conclusion is, based on source quality,
              agreement, freshness, coverage, and historical accuracy.
            </p>
          </section>

          <section className="rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-6">
            <p className="text-sm uppercase tracking-wider text-slate-400">
              Signal
            </p>

            <p
              className={`mt-3 text-2xl font-bold ${getSignalStyles(
                theme.signal,
              )}`}
            >
              {theme.signal}
            </p>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              The plain-language interpretation of the current conviction score.
            </p>
          </section>
        </div>

        <section className="mt-8 rounded-3xl border border-white/10 bg-[#0a1626] p-8">
          <h2 className="text-2xl font-bold">Understanding the Scores</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#07111f] p-5">
              <p className="font-bold text-white">Conviction asks:</p>

              <p className="mt-2 leading-7 text-slate-300">
                How strongly does the available evidence support the investment
                theme?
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-400/20 bg-[#07111f] p-5">
              <p className="font-bold text-cyan-300">Confidence asks:</p>

              <p className="mt-2 leading-7 text-slate-300">
                How much should we trust that conclusion given the quality and
                consistency of the evidence?
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-400">
            A theme can have high conviction but lower confidence when the
            directional signal is strong but the evidence is limited, old,
            conflicting, or historically less reliable.
          </p>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-[#0a1626] p-8">
          <h2 className="text-2xl font-bold">Evidence Assessment</h2>

          <p className="mt-2 text-slate-400">
            Evidence is classified by whether it supports or contradicts the
            current theme.
          </p>

          <div className="mt-6 space-y-4">
            {theme.evidence.length > 0 ? (
              theme.evidence.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-[#07111f] p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>

                      <span
                        className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${getDirectionBadgeStyles(
                          item.direction,
                        )}`}
                      >
                        {formatDirection(item.direction)}
                      </span>
                    </div>

                    <span className="text-sm font-bold text-cyan-300">
                      {item.weight}% relevance
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400">
                No evidence assessment available.
              </p>
            )}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-[#0a1626] p-8">
          <h2 className="text-2xl font-bold">TodayState Reasoning</h2>

          <div className="mt-6 space-y-4">
            {theme.reasoning.map((reason, index) => (
              <div
                key={`${reason}-${index}`}
                className="rounded-2xl border border-white/10 bg-[#07111f] p-5 text-slate-300"
              >
                {reason}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
