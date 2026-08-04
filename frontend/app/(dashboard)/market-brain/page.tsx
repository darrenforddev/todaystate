import MarketScoreCard from "@/components/marketbrain/MarketScoreCard";
import DriverSection from "@/components/marketbrain/DriverSection";
import { getTheme } from "@/engine/theme";
import ThemeCard from "@/components/marketbrain/ThemeCard";
import { getCompany } from "@/engine/company";
import CompanyCard from "@/components/company/CompanyCard";

export default function MarketBrainPage() {
  const industrialRecovery = getTheme("industrial-recovery");
  const nvidia = getCompany("nvidia");

  console.log(industrialRecovery);

  return (
    <main className="min-h-screen bg-[#050b14] p-10 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
          TodayState Intelligence
        </p>

        <h1 className="mt-4 text-5xl font-black tracking-tight">
          Market Brain
        </h1>

        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
          The central view of market conditions, economic evidence and
          TodayState&apos;s highest-conviction investment themes.
        </p>

        <MarketScoreCard />

        <DriverSection />
        <ThemeCard theme={industrialRecovery} />
        <CompanyCard company={nvidia} />
      </div>
    </main>
  );
}
