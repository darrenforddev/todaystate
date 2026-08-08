import { themes } from "@/data/themes";
import { evidence as allEvidence } from "@/data/evidence";
import { evidenceMetadata } from "@/data/evidenceMetadata";

import { calculateThemeScore } from "./scoring";
import { getThemeEvidence } from "./query";
import { getThemeReasoning } from "./reasoning";

import {
  relationships,
  type RelationshipDirection,
} from "./relationships";

import {
  calculateConfidence,
  convertToConfidenceEvidence,
  type ConfidenceEvidence,
} from "./confidence";

import { buildConfidenceFactors } from "./confidence/confidenceFactorBuilder";

export interface ThemeEvidence {
  id: string;
  title: string;
  weight: number;
  direction: RelationshipDirection;
}

export interface ThemeIntelligence {
  id: string;
  name: string;
  conviction: number;
  confidence: number;
  signal: string;
  narrative: string;
  evidence: ThemeEvidence[];
  reasoning: string[];
}

function getThemeConfidenceEvidence(
  themeId: string,
): ConfidenceEvidence[] {
  const themeRelationships = relationships.filter(
    (relationship) =>
      relationship.targetType === "theme" &&
      relationship.targetId === themeId,
  );

  return themeRelationships.flatMap(
    (relationship) => {
      const evidenceItem = allEvidence.find(
        (item) =>
          item.indicatorId ===
          relationship.evidenceId,
      );

      const metadata =
        evidenceMetadata[relationship.evidenceId];

      if (!evidenceItem || !metadata) {
        return [];
      }

      return [
        convertToConfidenceEvidence(
          evidenceItem,
          metadata,
        ),
      ];
    },
  );
}

function getThemeSignal(
  conviction: number,
): string {
  if (conviction >= 90) {
    return "Strong Positive";
  }

  if (conviction >= 75) {
    return "Positive";
  }

  if (conviction >= 60) {
    return "Cautiously Positive";
  }

  if (conviction >= 40) {
    return "Neutral";
  }

  if (conviction >= 25) {
    return "Cautiously Negative";
  }

  if (conviction >= 10) {
    return "Negative";
  }

  return "Strong Negative";
}

export function getTheme(
  themeId: string,
): ThemeIntelligence {
  const themeDefinition = themes.find(
    (theme) => theme.id === themeId,
  );

  if (!themeDefinition) {
    throw new Error(
      `Theme not found: ${themeId}`,
    );
  }

  const conviction =
    calculateThemeScore(themeId);

  const themeEvidence =
    getThemeEvidence(themeId);

  const confidenceEvidence =
    getThemeConfidenceEvidence(themeId);

  const confidence = calculateConfidence(
    buildConfidenceFactors(confidenceEvidence),
  ).confidence;

  const reasoning =
    getThemeReasoning(themeId);

  return {
    id: themeId,
    name: themeDefinition.name,
    conviction,
    confidence,
    signal: getThemeSignal(conviction),
    narrative: themeDefinition.opinion,
    evidence: themeEvidence,
    reasoning,
  };
}