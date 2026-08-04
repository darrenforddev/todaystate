import { etfs } from "@/data/etfs";
import IntelligenceHeader from "@/components/reports/IntelligenceHeader";
import IntelligenceScorecard from "@/components/reports/IntelligenceScorecard";
import OpinionSection from "@/components/reports/OpinionSection";
import WhySection from "@/components/reports/WhySection";
import RiskSection from "@/components/reports/RiskSection";
import ThemeLinkSection from "@/components/reports/ThemeLinkSection";
import CompanySection from "@/components/reports/CompanySection";

export default async function ETFPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const etf = etfs.find((item) => item.id === id);

  if (!etf) {
    return (
      <main className="min-h-screen bg-[#050b14] p-10 text-white">
        <h1 className="text-4xl font-bold">ETF not found</h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050b14] p-10 text-white">
      <div className="mx-auto max-w-5xl">
        <IntelligenceHeader
          title={etf.name}
          score={etf.score}
          confidence={etf.confidence}
          momentum={etf.momentum}
          lifecycle={etf.lifecycle}
        />

        <p className="mt-4 text-lg text-slate-400">
          {etf.ticker} · {etf.provider}
        </p>

        <IntelligenceScorecard
          score={etf.score}
          confidence={etf.confidence}
          momentum={etf.momentum}
          lifecycle={etf.lifecycle}
          risk={etf.risk}
        />

        <OpinionSection opinion={etf.opinion} confidence={etf.confidence} />

        <WhySection reasons={etf.why} />

        <RiskSection risks={etf.risks} />

        <ThemeLinkSection themes={etf.relatedThemes} />

        <CompanySection companies={etf.topHoldings} />
      </div>
    </main>
  );
}
