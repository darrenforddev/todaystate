export type EventImpact = "High" | "Medium" | "Low";

export interface MarketEvent {
  id: string;
  title: string;
  time: string;
  priority: number;
  impact: EventImpact;
}

export const marketEvents: MarketEvent[] = [
  {
    id: "us-ism-services-pmi",
    title: "US ISM Services PMI",
    time: "15:00 BST",
    priority: 5,
    impact: "High",
  },
  {
    id: "bank-of-england-speech",
    title: "Bank of England Speech",
    time: "12:30 BST",
    priority: 4,
    impact: "Medium",
  },
  {
    id: "us-oil-inventories",
    title: "US Oil Inventories",
    time: "15:30 BST",
    priority: 4,
    impact: "Medium",
  },
  {
    id: "fed-governor-speech",
    title: "Fed Governor Speech",
    time: "18:00 BST",
    priority: 3,
    impact: "Low",
  },
];