"use client";

import { useEffect, useState } from "react";

import type { MarketSession } from "@/data/markets";

type MarketStatusProps = {
  markets: MarketSession[];
};

type MarketClock = {
  time: string;
  status: "Open" | "Closed";
};

function getMarketClock(date: Date, market: MarketSession): MarketClock {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: market.timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);

  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "";

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);

  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? 0,
  );

  const currentMinutes = hour * 60 + minute;

  const openingMinutes = market.openHour * 60 + market.openMinute;

  const closingMinutes = market.closeHour * 60 + market.closeMinute;

  const isWeekday = !["Sat", "Sun"].includes(weekday);

  const isOpen =
    isWeekday &&
    currentMinutes >= openingMinutes &&
    currentMinutes < closingMinutes;

  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: market.timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  }).format(date);

  return {
    time,
    status: isOpen ? "Open" : "Closed",
  };
}

function formatSessionTime(hour: number, minute: number) {
  return `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;
}

export default function MarketStatus({ markets }: MarketStatusProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());

    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 30_000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return (
    <section className="rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Global Sessions
          </p>

          <h2 className="mt-2 text-3xl font-black text-white">Market Status</h2>

          <p className="mt-2 text-sm text-slate-400">
            Current local times and standard weekday trading sessions.
          </p>
        </div>

        <p className="text-xs text-slate-500">
          Exchange holidays are not included yet.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {markets.map((market) => {
          const clock = currentTime
            ? getMarketClock(currentTime, market)
            : null;

          const isOpen = clock?.status === "Open";

          return (
            <article
              key={market.id}
              className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 transition hover:border-cyan-400/20 hover:bg-white/[0.05]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    {market.flag}
                  </span>

                  <div>
                    <h3 className="font-bold text-white">{market.city}</h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {market.country}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                    isOpen
                      ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                      : "border-slate-400/20 bg-slate-500/10 text-slate-400"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isOpen ? "bg-emerald-300" : "bg-slate-500"
                    }`}
                  />

                  {clock?.status ?? "Loading"}
                </span>
              </div>

              <p className="mt-6 text-2xl font-black text-cyan-300">
                {clock?.time ?? "--:--"}
              </p>

              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                Standard session{" "}
                {formatSessionTime(market.openHour, market.openMinute)}–{" "}
                {formatSessionTime(market.closeHour, market.closeMinute)}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
