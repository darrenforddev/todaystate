import MorningSection from "@/components/morningbrief/MorningSection";
import MarketOverview from "@/components/morningbrief/MarketOverview";
import TopThemes from "@/components/morningbrief/TopThemes";
import TopCompanies from "@/components/morningbrief/TopCompanies";
import LatestEvidence from "@/components/morningbrief/LatestEvidence";
import MBIEInsight from "@/components/morningbrief/MBIEInsight";
import ReasonChain from "@/components/morningbrief/ReasonChain";
import TodaysWatchlist from "@/components/morningbrief/TodaysWatchlist";

export default function MorningBriefPage() {
  return (
    <main className="min-h-screen bg-[#050b14] text-white">
      <div className="mx-auto max-w-7xl px-8 py-12">
        {/* Header */}

        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">
          TodayState
        </p>

        <h1 className="mt-3 text-6xl font-black">Morning Brief</h1>

        <p className="mt-3 text-xl text-slate-400">
          Evidence-driven market intelligence.
        </p>

        {/* Welcome */}

        <div className="mt-10 rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-8">
          <p className="text-lg text-slate-300">Good morning Darren 👋</p>

          <h2 className="mt-3 text-3xl font-bold">
            Here's what MBIE discovered overnight.
          </h2>

          <p className="mt-4 max-w-3xl leading-8 text-slate-400">
            Your Morning Brief summarises the most important market
            developments, highlights the strongest investment themes and
            explains the evidence driving today's market conditions.
          </p>
        </div>

        {/* Market Brain */}

        <MorningSection
          icon="🌍"
          title="Market Brain"
          subtitle="Current market conditions"
        >
          <MarketOverview />
        </MorningSection>

        <MorningSection
          icon="🧠"
          title="Top Themes"
          subtitle="Today's strongest market themes"
        >
          <TopThemes />
        </MorningSection>

        <MorningSection
          icon="🏢"
          title="Top Companies"
          subtitle="Companies benefiting from current market conditions"
        >
          <TopCompanies />
        </MorningSection>

        <MorningSection
          icon="📊"
          title="Latest Evidence"
          subtitle="The latest economic releases influencing today's outlook"
        >
          <LatestEvidence />
        </MorningSection>

        <MorningSection
          icon="💬"
          title="MBIE Insight"
          subtitle="Explainable market intelligence"
        >
          <MBIEInsight />
        </MorningSection>

        <MorningSection
          icon="🧩"
          title="Reason Chain"
          subtitle="How MBIE reached today's assessment"
        >
          <ReasonChain />
        </MorningSection>

        <MorningSection
          icon="👀"
          title="Today's Watchlist"
          subtitle="Key events to monitor"
        >
          <TodaysWatchlist />
        </MorningSection>
      </div>
    </main>
  );
}
