export interface MBIEPulseData {
  title: string;
  score: number;
  direction: "Bullish" | "Neutral" | "Bearish";
  confidence: number;
  summary: string;
}

export const mbiePulse: MBIEPulseData = {
  title: "Market Brain Pulse",

  score: 78,

  direction: "Bullish",

  confidence: 94,

  summary:
    "Manufacturing activity, AI infrastructure investment and improving industrial demand continue to support a positive global outlook.",
};