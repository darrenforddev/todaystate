import type { ThemeIntelligence } from "@/engine/theme";

interface ThemeReasoningProps {
  theme: ThemeIntelligence;
}

export default function ThemeReasoning({ theme }: ThemeReasoningProps) {
  return (
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
  );
}
