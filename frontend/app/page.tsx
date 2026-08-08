import HomeClient from "./HomeClient";

import { buildMacroEvidence } from "@/engine/macroEvidence";
import { getHistoricalOutcomes } from "@/engine/outcomes/outcomeRepository";

export default async function Home() {
  const historicalOutcomes = await getHistoricalOutcomes();

  const macroEvidence = buildMacroEvidence(historicalOutcomes);

  return <HomeClient macroEvidence={macroEvidence} />;
}
