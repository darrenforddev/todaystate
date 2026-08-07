import { macroState } from "./engine/macroEvidence";

console.log({
  direction: macroState.direction,
  supportive: macroState.supportive.length,
  contradictory: macroState.contradictory.length,
  neutral: macroState.neutral.length,
  explanation: macroState.explanation,
});