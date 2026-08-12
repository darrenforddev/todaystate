import { notFound } from "next/navigation";

import TodayScoreCompanyReport from "@/components/todayScore/TodayScoreCompanyReport";
import { realCompanyDemoMetadata } from "@/data/realCompanyDemoMetadata";
import { buildScreenerCompanies } from "@/engine/todayScore/screener";
import {
  buildScreenerCompanyReport,
  findScreenerCompanyByTicker,
} from "@/engine/todayScore/screenerReport";
import { realCompanyDemoResults } from "@/engine/todayScore/realCompanyDemoScores";

const companies = buildScreenerCompanies(
  realCompanyDemoResults,
  realCompanyDemoMetadata,
);

export const dynamicParams = false;

export function generateStaticParams() {
  return companies.map((company) => ({
    ticker: company.ticker.toLowerCase(),
  }));
}

interface TodayScoreCompanyPageProps {
  params: Promise<{
    ticker: string;
  }>;
}

export default async function TodayScoreCompanyPage({
  params,
}: TodayScoreCompanyPageProps) {
  const { ticker } = await params;

  const company = findScreenerCompanyByTicker(
    companies,
    decodeURIComponent(ticker),
  );

  if (!company) {
    notFound();
  }

  return (
    <TodayScoreCompanyReport report={buildScreenerCompanyReport(company)} />
  );
}
