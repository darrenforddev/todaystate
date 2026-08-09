import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  buildSelectionOutcomeRecord,
} from "@/engine/outcomes/selectionOutcomeBuilder";

import type {
  ApprovedSelectionInput,
} from "@/engine/outcomes/selectionOutcomeBuilder";

import {
  saveSelectionOutcomeRecord,
} from "@/engine/outcomes/selectionOutcomeRepository";

export async function POST(request: NextRequest) {
  let input: ApprovedSelectionInput;

  try {
    input =
      (await request.json()) as ApprovedSelectionInput;
  } catch (error) {
    console.error(
      "Unable to read approved selection:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "The request body must contain valid JSON.",
      },
      {
        status: 400,
      },
    );
  }

  let record;

  try {
    record = buildSelectionOutcomeRecord(input);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The approved selection is invalid.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status: 400,
      },
    );
  }

  try {
    const result =
      await saveSelectionOutcomeRecord(record);

    return NextResponse.json(
      {
        success: true,
        message:
          "The approved selection was recorded successfully.",
        result,
        record,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Unable to record approved selection:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "The approved selection could not be saved.",
      },
      {
        status: 500,
      },
    );
  }
}