import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getSelectionOutcomeRecords,
  getSelectionOutcomesByTheme,
  saveSelectionOutcomeRecord,
} from "@/engine/outcomes/selectionOutcomeRepository";

import type {
  SelectionOutcomeRecord,
} from "@/engine/outcomes/types";

export async function GET(request: NextRequest) {
  try {
    const themeId =
      request.nextUrl.searchParams.get("themeId");

    const records = themeId
      ? await getSelectionOutcomesByTheme(themeId)
      : await getSelectionOutcomeRecords();

    return NextResponse.json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    console.error(
      "Unable to retrieve selection outcomes:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to retrieve selection outcomes.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const record =
      (await request.json()) as
        SelectionOutcomeRecord;

    if (
      !record?.selection?.selectionId ||
      !record.selection.companyId ||
      !record.selection.ticker ||
      !Array.isArray(record.outcomes)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A valid selection outcome record is required.",
        },
        {
          status: 400,
        },
      );
    }

    const result =
      await saveSelectionOutcomeRecord(record);

    return NextResponse.json(
      {
        success: true,
        result,
      },
      {
        status: result.selectionInserted
          ? 201
          : 200,
      },
    );
  } catch (error) {
    console.error(
      "Unable to save selection outcome:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to save selection outcome.",
      },
      {
        status: 500,
      },
    );
  }
}