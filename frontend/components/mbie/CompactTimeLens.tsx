"use client";

import { useId } from "react";

interface CompactTimeLensProps {
  monthLabels: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

export default function CompactTimeLens({
  monthLabels,
  selectedIndex,
  onChange,
}: CompactTimeLensProps) {
  const inputId = useId();

  const selectedLabel =
    monthLabels[selectedIndex] ??
    monthLabels[monthLabels.length - 1] ??
    "No period";

  const canMoveBack = selectedIndex > 0;
  const canMoveForward = selectedIndex < monthLabels.length - 1;

  return (
    <div className="mb-4 rounded-2xl border border-cyan-400/20 bg-[#081525] px-4 py-3">
      <div className="flex items-center gap-4">
        <button
          type="button"
          disabled={!canMoveBack}
          onClick={() => onChange(selectedIndex - 1)}
          className="min-h-11 rounded-xl border border-white/10 px-4 text-sm font-black text-cyan-300 transition hover:border-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="View previous reporting month"
        >
          ←
        </button>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between gap-4">
            <label
              htmlFor={inputId}
              className="text-xs font-black uppercase tracking-[0.18em] text-slate-500"
            >
              Reporting month
            </label>

            <span
              className="text-sm font-black text-cyan-300"
              aria-live="polite"
            >
              {selectedLabel}
            </span>
          </div>

          <input
            id={inputId}
            type="range"
            min={0}
            max={Math.max(0, monthLabels.length - 1)}
            step={1}
            value={selectedIndex}
            onChange={(event) => onChange(Number(event.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-cyan-400"
          />
        </div>

        <button
          type="button"
          disabled={!canMoveForward}
          onClick={() => onChange(selectedIndex + 1)}
          className="min-h-11 rounded-xl border border-white/10 px-4 text-sm font-black text-cyan-300 transition hover:border-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="View next reporting month"
        >
          →
        </button>
      </div>
    </div>
  );
}
