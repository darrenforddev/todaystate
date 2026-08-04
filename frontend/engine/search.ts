import { themes } from "@/data/themes";
import { companies } from "@/data/companies";
import { evidence } from "@/data/evidence";

export interface SearchResult {
  id: string;
  title: string;
  type: "theme" | "company" | "evidence";
  href: string;
}

export function search(query: string): SearchResult[] {
  const q = query.toLowerCase();

  const themeResults = themes
    .filter((item) => item.name.toLowerCase().includes(q))
    .map((item) => ({
      id: item.id,
      title: item.name,
      type: "theme" as const,
      href: `/themes/${item.id}`,
    }));

  const companyResults = companies
    .filter((item) => item.name.toLowerCase().includes(q))
    .map((item) => ({
      id: item.id,
      title: item.name,
      type: "company" as const,
      href: `/companies/${item.id}`,
    }));

  const evidenceResults = evidence
    .filter((item) => item.title.toLowerCase().includes(q))
    .map((item) => ({
      id: item.id,
      title: item.title,
      type: "evidence" as const,
      href: `/evidence/${item.id}`,
    }));

  return [
    ...themeResults,
    ...companyResults,
    ...evidenceResults,
  ];
}