import SignalCard from "./SignalCard";

type MarketSignal = {
  name: string;
  value: string;
  change: string;
  positive: boolean;
};

type SignalGridProps = {
  signals: MarketSignal[];
};

export default function SignalGrid({ signals }: SignalGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {signals.map((signal) => (
        <SignalCard
          key={signal.name}
          name={signal.name}
          value={signal.value}
          change={signal.change}
          positive={signal.positive}
        />
      ))}
    </div>
  );
}
