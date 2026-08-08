import { NextResponse } from "next/server";

import { buildMacroEvidence } from
  "@/engine/macroEvidence";
import { createMissingForecasts } from
  "@/engine/outcomes/forecastGenerator";
import {
  getHistoricalOutcomes,
  savePendingForecasts,
} from "@/engine/outcomes/outcomeRepository";

export async function POST() {
  try {
    const forecastDate = "2026-08-07";
    const horizonMonths = 6;

    const existingOutcomes =
      await getHistoricalOutcomes();

    const macroEvidence =
      buildMacroEvidence(existingOutcomes);

    const forecasts = createMissingForecasts(
      macroEvidence,
      existingOutcomes,
      forecastDate,
      horizonMonths,
    );

    const result =
      await savePendingForecasts(forecasts);

    return NextResponse.json({
      success: true,
      existingCount: existingOutcomes.length,
      generatedCount: forecasts.length,
      insertedCount: result.insertedCount,
      insertedIds: result.insertedIds,
    });
  } catch (error) {
    console.error(
      "Unable to generate macro forecasts:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to generate macro forecasts.",
      },
      {
        status: 500,
      },
    );
  }
}