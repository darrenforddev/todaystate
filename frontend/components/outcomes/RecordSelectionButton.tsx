"use client";

import { useState } from "react";

import type { ApprovedSelectionInput } from "@/engine/outcomes/selectionOutcomeBuilder";

import type { SelectionOutcomeRecord } from "@/engine/outcomes/types";

interface ApprovalApiResponse {
  success: boolean;
  message?: string;
  record?: SelectionOutcomeRecord;
}

interface RecordSelectionButtonProps {
  selection: ApprovedSelectionInput;
  onRecorded?: (record: SelectionOutcomeRecord) => void;
  disabled?: boolean;
}

type SubmissionStatus = "idle" | "saving" | "success" | "error";

export default function RecordSelectionButton({
  selection,
  onRecorded,
  disabled = false,
}: RecordSelectionButtonProps) {
  const [status, setStatus] = useState<SubmissionStatus>("idle");

  const [message, setMessage] = useState<string | null>(null);

  async function recordSelection() {
    if (status === "saving" || status === "success" || disabled) {
      return;
    }

    try {
      setStatus("saving");
      setMessage(null);

      const response = await fetch("/api/selection-outcomes/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selection),
      });

      const data = (await response.json()) as ApprovalApiResponse;

      if (!response.ok || !data.success || !data.record) {
        throw new Error(data.message ?? "The selection could not be recorded.");
      }

      setStatus("success");
      setMessage("Selection recorded with four future review dates.");

      onRecorded?.(data.record);
    } catch (error) {
      console.error("Unable to record selection:", error);

      setStatus("error");

      setMessage(
        error instanceof Error
          ? error.message
          : "The selection could not be recorded.",
      );
    }
  }

  const buttonDisabled =
    disabled || status === "saving" || status === "success";

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          void recordSelection();
        }}
        disabled={buttonDisabled}
        className={[
          "rounded-xl px-5 py-3 text-sm font-bold",
          "transition-colors",
          buttonDisabled
            ? "cursor-not-allowed bg-slate-700 text-slate-400"
            : "bg-cyan-300 text-slate-950 hover:bg-cyan-200",
        ].join(" ")}
      >
        {status === "saving" && "Recording…"}
        {status === "success" && "Selection Recorded"}
        {status !== "saving" && status !== "success" && "Record Selection"}
      </button>

      {message && (
        <p
          className={[
            "mt-3 text-sm",
            status === "success" ? "text-emerald-300" : "text-rose-300",
          ].join(" ")}
          role={status === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      )}
    </div>
  );
}
