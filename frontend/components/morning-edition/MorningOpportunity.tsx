import type { ConfidenceEvidence } from "@/engine/confidence/confidenceEvidence";
import { getMorningBrief } from "@/engine/morningBriefEngine";

import InsightCard from "../ui/InsightCard";

interface MorningOpportunityProps {
  macroEvidence: ConfidenceEvidence[];
}

export default function MorningOpportunity({
  macroEvidence,
}: MorningOpportunityProps) {
  const brief = getMorningBrief(macroEvidence);

  return (
    <InsightCard
      type="opportunity"
      title={brief.opportunity}
      description={brief.opportunityText}
    />
  );
}
