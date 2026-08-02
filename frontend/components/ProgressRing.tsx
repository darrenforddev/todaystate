"use client";

import { useEffect, useState } from "react";

type ProgressRingProps = {
  value: number;
  label: string;
};

export default function ProgressRing({ value, label }: ProgressRingProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let currentValue = 0;

    const timer = setInterval(() => {
      currentValue += 1;

      if (currentValue >= value) {
        setDisplayValue(value);
        clearInterval(timer);
        return;
      }

      setDisplayValue(currentValue);
    }, 15);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="relative flex h-56 w-56 items-center justify-center rounded-full bg-[#07111f] shadow-[0_0_60px_rgba(74,222,128,0.15)]">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(
            from -90deg,
            rgb(52 211 153) ${displayValue * 3.6}deg,
            rgba(52, 211, 153, 0.12) 0deg
          )`,
        }}
      />

      <div className="absolute inset-[14px] rounded-full bg-[#07111f]" />

      <div className="relative text-center">
        <p className="text-7xl font-black tracking-tight text-emerald-400 drop-shadow-[0_0_18px_rgba(74,222,128,0.35)]">
          {displayValue}%
        </p>

        <p className="mt-3 text-sm font-medium uppercase tracking-widest text-slate-500">
          {label}
        </p>
      </div>
    </div>
  );
}
