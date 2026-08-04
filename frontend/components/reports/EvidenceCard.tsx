"use client";

import { useState } from "react";
import type { Theme } from "../../types/theme";

type EvidenceCardProps = {
  item: Theme["why"][number];
};

export default function EvidenceCard({ item }: EvidenceCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="text-xl text-emerald-400">✓</span>

          <div>
            <p className="font-semibold text-slate-200">{item.reason}</p>

            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-sm font-medium text-cyan-300 hover:text-cyan-200"
            >
              {expanded ? "▼ Hide Evidence" : "▶ Show Evidence"}
            </button>
          </div>
        </div>

        <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-300">
          {item.confidence}% Confidence
        </span>
      </div>

      {expanded && (
        <div className="mt-5 border-t border-white/5 pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Supporting Evidence
          </p>

          <div className="space-y-2">
            {item.evidence.map((evidence) => (
              <div
                key={evidence.title}
                className="flex items-center justify-between rounded-xl bg-black/10 px-4 py-3"
              >
                <span className="text-sm text-slate-300">{evidence.title}</span>

                <span
                  className={
                    evidence.status === "Positive"
                      ? "font-semibold text-emerald-300"
                      : evidence.status === "Negative"
                        ? "font-semibold text-rose-300"
                        : "font-semibold text-amber-300"
                  }
                >
                  {evidence.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
