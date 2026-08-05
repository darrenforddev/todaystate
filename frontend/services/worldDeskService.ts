import { themes } from "@/data/themes";
import { marketEvents } from "@/data/events";
import {
  mbiePulse,
  type MBIEPulseData,
} from "@/data/mbiePulse";

export interface WorldDeskData {
  marketStatus: unknown;
  worldState: unknown;
  mbiePulse: MBIEPulseData;
  topThemes: typeof themes;
  watchToday: typeof marketEvents;
  latestIntelligence: unknown;
}

export function getWorldDeskData(): WorldDeskData {
  return {
    marketStatus: null,
    worldState: null,
    mbiePulse,
    topThemes: themes,
    watchToday: marketEvents,
    latestIntelligence: null,
  };
}