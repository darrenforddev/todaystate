import type { ThemeIntelligence } from "@/engine/theme";

interface ThemeScoreCardsProps {
  theme: ThemeIntelligence;
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

export default function ThemeScoreCards({ theme }: ThemeScoreCardsProps) {
  return (
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
          How reliable the conclusion is, based on source quality, agreement,
          freshness, coverage, and historical accuracy.
        </p>
      </section>

      <section className="rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-6">
        <p className="text-sm uppercase tracking-wider text-slate-400">
          Signal
        </p>

        <p
          className={`mt-3 text-2xl font-bold ${getSignalStyles(theme.signal)}`}
        >
          {theme.signal}
        </p>

        <p className="mt-4 text-sm leading-6 text-slate-400">
          The plain-language interpretation of the current conviction score.
        </p>
      </section>
    </div>
  );
}
