import InsightCard from "../ui/InsightCard";
import { getMorningBrief } from "@/engine/morningBriefEngine";

export default function MorningRisk() {
  const brief = getMorningBrief();

  return (
    <InsightCard type="risk" title={brief.risk} description={brief.riskText} />
  );
}
