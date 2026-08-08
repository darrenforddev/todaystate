import StudioHeader from "./StudioHeader";
import Pipeline from "./Pipeline";
import EvidenceCard from "./EvidenceCard";
import ThemeCard from "./ThemeCard";
import ReasoningCard from "./ReasoningCard";

import { buildEvidence, manufacturingSample } from "@/engine/evidence";
import { getThemeIntelligence } from "@/engine/themeEngine";

export default function StudioLayout() {
  const evidence = buildEvidence(
    manufacturingSample.indicatorId,
    manufacturingSample.current,
    manufacturingSample.previous,
  );

  const theme = getThemeIntelligence("industrial-recovery");

  if (!theme) {
    return (
      <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-6 text-red-300">
        Industrial Recovery theme intelligence could not be found.
      </div>
    );
  }

  const relationshipStrength = Math.round(theme.averageRelationshipStrength);

  return (
    <div>
      <StudioHeader version="0.1.0" />

      <Pipeline />

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
          strength={relationshipStrength}
        />
      </div>

      <ReasoningCard
        indicator="Manufacturing PMI"
        status={evidence.status}
        theme={theme.theme.name}
        strength={relationshipStrength}
      />
    </div>
  );
}
