import { NextResponse } from "next/server";

import {
  createTwelveDataProvider,
  twelveDataLseTrialCompany,
} from "@/engine/todayScore/providers/twelveData";
import { fetchTwelveDataRawReport } from "@/engine/todayScore/providers/twelveDataRawReport";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 });
  }

  const provider = createTwelveDataProvider();

  if (!provider) {
    return NextResponse.json(
      {
        success: false,
        message: "TWELVE_DATA_API_KEY is not configured on the server.",
      },
      { status: 503 },
    );
  }

  try {
    const report = await fetchTwelveDataRawReport(
      provider,
      twelveDataLseTrialCompany,
    );

    return NextResponse.json(
      { success: true, report },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Unable to build the Twelve Data raw-factor report:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to build the BT Group raw-factor report.",
      },
      { status: 500 },
    );
  }
}
