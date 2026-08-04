"use client";

import { useEffect, useState } from "react";

export default function AppHeader() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());

    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const time =
    currentTime?.toLocaleTimeString("en-GB", {
      timeZone: "Europe/London",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZoneName: "short",
    }) ?? "--:--:--";

  const date =
    currentTime?.toLocaleDateString("en-GB", {
      timeZone: "Europe/London",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }) ?? "Loading date...";

  return (
    <header className="mb-10 flex flex-col gap-5 border-b border-white/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
          TodayState Intelligence Platform
        </p>

        <p className="mt-2 text-sm text-slate-400">
          Evidence first. Intelligence second. Decisions third.
        </p>
      </div>

      <div className="text-left lg:text-right">
        <div className="flex items-center gap-2 lg:justify-end">
          <span aria-hidden="true">🇬🇧</span>

          <p className="font-semibold text-white">United Kingdom</p>
        </div>

        <p className="mt-1 text-lg font-bold text-cyan-300">Leeds · {time}</p>

        <p className="mt-1 text-sm text-slate-400">{date}</p>
      </div>
    </header>
  );
}
