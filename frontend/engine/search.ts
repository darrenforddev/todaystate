import { themes } from "@/data/themes";
import { companies } from "@/data/companies";
import { evidence } from "@/data/evidence";

export interface SearchResult {
  id: string;
  title: string;
  type: "theme" | "company" | "evidence";
  href: string;
}

function formatIndicatorTitle(
  indicatorId: string,
): string {
  return indicatorId
    .replace(/-\w+-\d{4}$/, "")
    .split("-")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

export function search(
  query: string,
): SearchResult[] {
  const q = query.trim().toLowerCase();

  const themeResults = themes
    .filter((item) =>
      item.name.toLowerCase().includes(q),
    )
    .map((item) => ({
      id: item.id,
      title: item.name,
      type: "theme" as const,
      href: `/themes/${item.id}`,
    }));

  const companyResults = companies
    .filter((item) =>
      item.name.toLowerCase().includes(q),
    )
    .map((item) => ({
      id: item.id,
      title: item.name,
      type: "company" as const,
      href: `/companies/${item.id}`,
    }));

  const evidenceResults = evidence
    .map((item) => ({
      item,
      title: formatIndicatorTitle(
        item.indicatorId,
      ),
    }))
    .filter(
      ({ item, title }) =>
        title.toLowerCase().includes(q) ||
        item.explanation.toLowerCase().includes(q),
    )
    .map(({ item, title }) => ({
      id: item.indicatorId,
      title,
      type: "evidence" as const,
      href: `/evidence/${item.indicatorId}`,
    }));

  return [
    ...themeResults,
    ...companyResults,
    ...evidenceResults,
  ];
}