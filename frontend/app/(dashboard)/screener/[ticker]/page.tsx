import { notFound } from "next/navigation";

import TodayScoreCompanyReport from "@/components/todayScore/TodayScoreCompanyReport";
import { screenerCompanyMetadata } from "@/data/screenerCompanies";
import { buildScreenerCompanies } from "@/engine/todayScore/screener";
import {
  buildScreenerCompanyReport,
  findScreenerCompanyByTicker,
} from "@/engine/todayScore/screenerReport";
import { todayScoreTestResults } from "@/engine/todayScore/todayScoreTest";

const companies = buildScreenerCompanies(
  todayScoreTestResults,
  screenerCompanyMetadata,
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
  const company = findScreenerCompanyByTicker(companies, ticker);

  if (!company) {
    notFound();
  }

  return (
    <TodayScoreCompanyReport
      report={buildScreenerCompanyReport(company)}
    />
  );
}
