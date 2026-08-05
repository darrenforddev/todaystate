export interface WorldStateData {
  state: string;
  confidence: number;
  risk: "Low" | "Moderate" | "High";
  assessment: string;
}

export const worldState: WorldStateData = {
  state: "Expansion",

  confidence: 94,

  risk: "Moderate",

  assessment:
    "Global economic conditions continue to support expansion, driven by resilient manufacturing activity, improving industrial demand and continued AI infrastructure investment.",
};