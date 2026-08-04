import { companies } from "@/data/companies";
import { calculateCompanyScore } from "./scoring";

export interface CompanyIntelligence {
  id: string;
  name: string;
  conviction: number;
  confidence: number;
  narrative: string;
}

export function getCompany(companyId: string): CompanyIntelligence {
  const company = companies.find(
    (company) => company.id === companyId
  );

  if (!company) {
    throw new Error(`Company not found: ${companyId}`);
  }

  const conviction = calculateCompanyScore(companyId);

  return {
    id: company.id,
    name: company.name,
    conviction,
    confidence: company.confidence,
    narrative: company.opinion,
  };
}