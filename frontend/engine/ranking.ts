import { themes } from "@/data/themes";
import { companies } from "@/data/companies";

import { getTheme } from "./theme";
import { getCompany } from "./company";

export function getTopThemes(limit: number) {
  return themes
    .map((theme) => getTheme(theme.id))
    .sort((a, b) => b.conviction - a.conviction)
    .slice(0, limit);
}

export function getTopCompanies(limit: number) {
  return companies
    .map((company) => getCompany(company.id))
    .sort((a, b) => b.conviction - a.conviction)
    .slice(0, limit);
}