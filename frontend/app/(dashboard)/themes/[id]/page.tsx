import { notFound } from "next/navigation";

import ThemeScoreCards from "@/components/theme/ThemeScoreCards";
import ScoreExplanation from "@/components/theme/ScoreExplanation";
import ConvictionBreakdown from "@/components/theme/ConvictionBreakdown";
import ConfidenceBreakdown from "@/components/theme/ConfidenceBreakdown";
import EvidenceAssessment from "@/components/theme/EvidenceAssessment";
import ThemeReasoning from "@/components/theme/ThemeReasoning";
import { getTheme } from "@/engine/theme";

interface ThemePageProps {
  params: Promise<{
    id: string;
  }>;
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

        <ThemeScoreCards theme={theme} />

        <ScoreExplanation />

        <ConvictionBreakdown theme={theme} />

        <ConfidenceBreakdown theme={theme} />

        <EvidenceAssessment theme={theme} />

        <ThemeReasoning theme={theme} />
      </div>
    </main>
  );
}
