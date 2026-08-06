import InsightCard from "../ui/InsightCard";
import { getMorningBrief } from "@/engine/morningBriefEngine";

export default function MorningOpportunity() {
  const brief = getMorningBrief();

  return (
    <InsightCard
      type="opportunity"
      title={brief.opportunity}
      description={brief.opportunityText}
    />
  );
}
