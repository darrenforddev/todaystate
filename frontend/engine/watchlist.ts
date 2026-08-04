export interface WatchlistEvent {
  id: string;
  time: string;
  title: string;
  impact: number;
  status: string;
  description: string;
}

export function getTodaysWatchlist(): WatchlistEvent[] {
  return [
    {
      id: "us-cpi",
      time: "13:30 BST",
      title: "US CPI Inflation",
      impact: 5,
      status: "Upcoming",
      description:
        "Expected to influence inflation expectations and interest-rate outlook.",
    },
  ];
}