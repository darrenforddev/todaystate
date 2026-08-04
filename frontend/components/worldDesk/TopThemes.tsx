import ProgressBar from "@/components/ui/ProgressBar";

const themes = [
  {
    name: "AI Infrastructure",
    score: 94,
    colour: "emerald" as const,
  },
  {
    name: "Power Grid",
    score: 91,
    colour: "emerald" as const,
  },
  {
    name: "Industrial Recovery",
    score: 88,
    colour: "cyan" as const,
  },
  {
    name: "Automation",
    score: 84,
    colour: "cyan" as const,
  },
];

export default function TopThemes() {
  return (
    <section className="rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
        Strongest Themes
      </p>

      <h2 className="mt-3 text-3xl font-black">Today's Leaders</h2>

      <div className="mt-8 space-y-7">
        {themes.map((theme) => (
          <div key={theme.name}>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium">{theme.name}</span>

              <span className="font-bold text-cyan-300">{theme.score}</span>
            </div>

            <ProgressBar value={theme.score} colour={theme.colour} />
          </div>
        ))}
      </div>
    </section>
  );
}
