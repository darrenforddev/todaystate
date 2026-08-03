import { themes } from "../../../data/themes";
import IntelligenceHeader from "../../../components/reports/IntelligenceHeader";
import WhySection from "../../../components/reports/WhySection";
import RiskSection from "../../../components/reports/RiskSection";
import ETFSection from "../../../components/reports/ETFSection";
import CompanySection from "../../../components/reports/CompanySection";
import OpinionSection from "../../../components/reports/OpinionSection";

export default async function ThemePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const theme = themes.find((t) => t.id === id);
  if (!theme) {
    return (
      <main className="min-h-screen bg-[#050b14] p-10 text-white">
        <h1 className="text-4xl font-bold">Theme not found</h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050b14] p-10 text-white">
      <div className="mx-auto max-w-5xl">
        <IntelligenceHeader
          title={theme.name}
          score={theme.score}
          confidence={theme.confidence}
          momentum={theme.momentum}
          lifecycle={theme.lifecycle}
        />
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
          {theme.description}
        </p>
        <OpinionSection opinion={theme.opinion} confidence={theme.confidence} />
        <WhySection reasons={theme.why} />
        <RiskSection risks={theme.risks} />
        <ETFSection etfs={theme.etfs} />
        <CompanySection companies={theme.companies} />
      </div>
    </main>
  );
}
