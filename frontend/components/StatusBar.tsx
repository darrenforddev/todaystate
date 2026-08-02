"use client";

import { useEffect, useState } from "react";

export default function StatusBar() {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    function updateTime() {
      setCurrentTime(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    }

    updateTime();

    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="border-b border-emerald-400/10 bg-emerald-400/[0.03]">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-6 py-2 text-xs">
        <div className="flex items-center gap-2 font-bold text-emerald-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          LIVE
        </div>

        <div className="flex flex-wrap gap-5 text-slate-500">
          <span>
            Last updated:
            <strong className="ml-2 text-slate-300">{currentTime}</strong>
          </span>

          <span>
            Market Brain:
            <strong className="ml-2 text-emerald-300">Online</strong>
          </span>

          <span>
            Economic Data:
            <strong className="ml-2 text-amber-300">Prototype</strong>
          </span>

          <span>
            AI:
            <strong className="ml-2 text-cyan-300">Ready</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
