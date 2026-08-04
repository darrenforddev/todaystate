import { getTopThemes } from "@/engine/ranking";

export default function TopThemes() {
  const themes = getTopThemes(3);

  return (
    <div className="space-y-4">
      {themes.map((theme, index) => (
        <div
          key={theme.id}
          className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#0a1626] p-5"
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl">
              {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
            </span>

            <div>
              <h3 className="text-lg font-bold">{theme.name}</h3>

              <p className="text-sm text-slate-400">{theme.signal}</p>
            </div>
          </div>

          <span className="text-3xl font-black text-cyan-300">
            {theme.conviction}
          </span>
        </div>
      ))}
    </div>
  );
}
