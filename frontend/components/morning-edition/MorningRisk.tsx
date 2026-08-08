import type { ConfidenceEvidence } from "@/engine/confidence/confidenceEvidence";
import { getMorningBrief } from "@/engine/morningBriefEngine";

import InsightCard from "../ui/InsightCard";

interface MorningRiskProps {
  macroEvidence: ConfidenceEvidence[];
}

export default function MorningRisk({ macroEvidence }: MorningRiskProps) {
  const brief = getMorningBrief(macroEvidence);

  return (
    <InsightCard type="risk" title={brief.risk} description={brief.riskText} />
  );
}
