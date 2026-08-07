import StudioHeader from "@/components/mbie/StudioHeader";
import Pipeline from "@/components/mbie/Pipeline";
import EvidenceCard from "@/components/mbie/EvidenceCard";
import ThemeCard from "@/components/mbie/ThemeCard";
import ReasoningCard from "@/components/mbie/ReasoningCard";
import TodaysIntelligence from "@/components/mbie/TodaysIntelligence";
import SystemStatus from "@/components/mbie/SystemStatus";
import ConfidenceCard from "@/components/mbie/ConfidenceCard";

import {
  calculateConfidence,
  sampleConfidenceFactors,
} from "@/engine/confidence/index";

import { buildEvidence, manufacturingSample } from "@/engine/evidence";
import { getThemeIntelligence } from "@/engine/themeEngine";

export default function MBIEStudioPage() {
  const evidence = buildEvidence(
    manufacturingSample.indicatorId,
    manufacturingSample.current,
    manufacturingSample.previous,
  );

  const theme = getThemeIntelligence("industrial-recovery");
  const confidence = calculateConfidence(sampleConfidenceFactors);

  if (!theme) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        Theme intelligence could not be loaded.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8">
      <div className="mx-auto max-w-7xl">
        <StudioHeader version="0.1" />

        <div className="mb-8">
          <Pipeline />
        </div>

        <div className="mb-8">
          <TodaysIntelligence
            theme={theme.theme.name}
            indicator="Manufacturing PMI"
            value={evidence.current}
            status={evidence.status}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <EvidenceCard
            indicator="Manufacturing PMI"
            current={evidence.current}
            previous={evidence.previous}
            change={evidence.change}
            direction={evidence.direction}
            status={evidence.status}
            impact={evidence.impact}
            explanation={evidence.explanation}
          />

          <ThemeCard
            name={theme.theme.name}
            description={theme.theme.description}
            strength={theme.averageRelationshipStrength}
          />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <ReasoningCard
            indicator="Manufacturing PMI"
            status={evidence.status}
            theme={theme.theme.name}
            strength={theme.averageRelationshipStrength}
          />

          <SystemStatus />
          <div className="mt-8">
            <ConfidenceCard result={confidence} />
          </div>
        </div>
      </div>
    </main>
  );
}
