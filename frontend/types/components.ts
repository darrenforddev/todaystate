export type BullBearCardProps = {
  probability: number;
  marketState: string;
  confidence: string;
  confidenceScore: number;
  risk: string;
  onExplain: () => void;
};