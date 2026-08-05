import Link from "next/link";

import ProgressBar from "@/components/ui/ProgressBar";
import type { Theme } from "@/types/theme";

type TopThemesProps = {
  themes: Theme[];
};

function getColour(score: number) {
  if (score >= 90) {
    return "emerald" as const;
  }

  if (score >= 80) {
    return "cyan" as const;
  }

  if (score >= 70) {
    return "amber" as const;
  }

  return "red" as const;
}

export default function TopThemes({ themes }: TopThemesProps) {
  const topThemes = [...themes].sort((a, b) => b.score - a.score).slice(0, 4);

  return (
    <section className="h-full rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
        Strongest Themes
      </p>

      <h2 className="mt-3 text-3xl font-black text-white">Leading Themes</h2>

      <div className="mt-8 space-y-7">
        {topThemes.map((theme) => (
          <Link
            key={theme.id}
            href={`/themes/${theme.id}`}
            className="block rounded-2xl p-2 transition hover:bg-white/[0.03]"
          >
            <div className="mb-2 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-white">{theme.name}</p>

                <p className="mt-1 text-xs text-slate-500">
                  {theme.momentum} · {theme.lifecycle}
                </p>
              </div>

              <span className="text-xl font-bold text-cyan-300">
                {theme.score}
              </span>
            </div>

            <ProgressBar value={theme.score} colour={getColour(theme.score)} />
          </Link>
        ))}
      </div>
    </section>
  );
}
