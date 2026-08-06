export type Direction =
  | "improving"
  | "weakening"
  | "unchanged";

export type Status =
  | "expansion"
  | "contraction"
  | "neutral";

export type Impact =
  | "positive"
  | "negative"
  | "neutral";

export interface Evidence {
  indicatorId: string;

  current: number;

  previous: number;

  change: number;

  direction: Direction;

  status: Status;

  impact: Impact;

  explanation: string;
}