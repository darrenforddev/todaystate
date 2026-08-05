import { themes } from "@/data/themes";
import { marketEvents } from "@/data/events";
import {
  mbiePulse,
  type MBIEPulseData,
} from "@/data/mbiePulse";
import {
  worldState,
  type WorldStateData,
} from "@/data/worldState";
import {
  latestIntelligence,
  type IntelligenceItem,
} from "@/data/intelligence";
import {
  markets,
  type MarketSession,
} from "@/data/markets";

export interface WorldDeskData {
  marketStatus: MarketSession[];
  worldState: WorldStateData;
  mbiePulse: MBIEPulseData;
  topThemes: typeof themes;
  watchToday: typeof marketEvents;
  latestIntelligence: IntelligenceItem[];
}

export function getWorldDeskData(): WorldDeskData {
  return {
    marketStatus: markets,
    worldState,
    mbiePulse,
    topThemes: themes,
    watchToday: marketEvents,
    latestIntelligence,
  };
}