import { themes } from "@/data/themes";
import { calculateRelationshipScore } from "@/engine/scoring";

export function getThemes() {
  return themes;
}

export function getThemeById(id: string) {
  return themes.find((theme) => theme.id === id);
}

export function getThemeScore(id: string) {
  return calculateRelationshipScore("theme", id);
}