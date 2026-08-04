import { getTheme } from "@/engine/theme";
import ThemeCard from "@/components/marketbrain/ThemeCard";

type ThemePageProps = {
  params: {
    id: string;
  };
};

export default function ThemePage({ params }: ThemePageProps) {
  const theme = getTheme(params.id);

  return (
    <main className="min-h-screen bg-[#050b14] text-white">
      <div className="mx-auto max-w-7xl px-8 py-12">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">
          TodayState Intelligence
        </p>

        <h1 className="mt-4 text-5xl font-black tracking-tight">
          Theme Intelligence
        </h1>

        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-400">
          Evidence, conviction and MBIE reasoning for the selected market theme.
        </p>

        <ThemeCard theme={theme} />
      </div>
    </main>
  );
}
