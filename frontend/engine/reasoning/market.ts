export function describeMarket(signal: string): string {
  switch (signal) {
    case "Strong Positive":
      return "very constructive";

    case "Positive":
      return "constructive";

    case "Neutral":
      return "balanced";

    case "Negative":
      return "challenging";

    case "Strong Negative":
      return "highly challenging";

    default:
      return signal.toLowerCase();
  }
}