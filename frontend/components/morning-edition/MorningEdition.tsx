import { getMarketExplanation } from "@/engine/explainEngine";
import MorningSummary from "./MorningSummary";
import MorningOpportunity from "./MorningOpportunity";
import MorningRisk from "./MorningRisk";

export default function MorningEdition() {
  const now = new Date();
  const explanation = getMarketExplanation();

  const hour = now.getHours();

  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const date = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-[#06101c] px-10 py-14">
      <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
        MORNING EDITION
      </p>

      <p className="mt-5 text-sm uppercase tracking-[0.25em] text-slate-500">
        {date}
      </p>

      <h1 className="mt-2 text-5xl font-black tracking-tight">{greeting}</h1>

      <MorningSummary />
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <MorningOpportunity />
        <MorningRisk />
      </div>
    </section>
  );
}
