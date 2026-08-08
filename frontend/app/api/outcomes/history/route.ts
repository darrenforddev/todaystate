import { NextResponse } from "next/server";

import {
  getHistoricalOutcomes,
} from "@/engine/outcomes/outcomeRepository";

export async function GET() {
  try {
    const outcomes = await getHistoricalOutcomes();

    return NextResponse.json({
      success: true,
      count: outcomes.length,
      outcomes,
    });
  } catch (error) {
    console.error(
      "Unable to load typed historical outcomes:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load typed historical outcomes.",
      },
      {
        status: 500,
      },
    );
  }
}