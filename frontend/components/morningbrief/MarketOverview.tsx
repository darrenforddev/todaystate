import CircularGauge from "@/components/ui/CircularGauge";
import IntelligenceBar from "@/components/ui/IntelligenceBar";
import { getMarketBrain } from "@/engine/marketBrain";

export default function MarketOverview() {
  const market = getMarketBrain();

  return (
    <div className="rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex justify-center">
          <CircularGauge value={market.score} label="Market Brain" />
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">
            Market State
          </p>

          <h3 className="mt-2 text-4xl font-black">{market.phase}</h3>

          <p className="mt-3 text-slate-400">
            MBIE currently identifies an overall {market.phase.toLowerCase()}{" "}
            environment.
          </p>

          <div className="mt-8">
            <IntelligenceBar
              value={market.confidence}
              max={100}
              label="Confidence"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
