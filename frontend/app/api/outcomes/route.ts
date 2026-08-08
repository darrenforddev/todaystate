import { NextResponse } from "next/server";

import { sql } from "@/lib/db";

export async function GET() {
  try {
    const outcomes = await sql`
      SELECT
        id,
        indicator_id,
        indicator_name,
        forecast_date::text AS forecast_date,
evaluation_date::text AS evaluation_date,
        horizon_months,
        predicted_direction,
        starting_value,
        actual_direction,
        ending_value,
        status,
        actual_change,
        forecast_reason,
        outcome_explanation,
        failure_reasons,
        evaluated,
        created_at,
        updated_at
      FROM historical_outcomes
      ORDER BY forecast_date DESC;
    `;

    return NextResponse.json({
      success: true,
      count: outcomes.length,
      outcomes,
    });
  } catch (error) {
    console.error("Unable to read historical outcomes:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to read historical outcomes.",
      },
      {
        status: 500,
      },
    );
  }
}