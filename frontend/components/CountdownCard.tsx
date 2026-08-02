"use client";

import { useEffect, useState } from "react";

type CountdownCardProps = {
  title: string;
  event: string;
  targetDate: string;
};

export default function CountdownCard({
  title,
  event,
  targetDate,
}: CountdownCardProps) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function updateCountdown() {
      const difference = new Date(targetDate).getTime() - new Date().getTime();

      if (difference <= 0) {
        setTimeLeft("Event released");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }

    updateCountdown();

    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);
  return (
    <section className="rounded-3xl border border-cyan-400/15 bg-[#0a1626] p-6">
      <h2 className="text-xl font-bold">{title}</h2>

      <p className="mt-4 text-slate-400">{event}</p>

      <p className="mt-6 text-2xl font-bold text-cyan-400">{timeLeft}</p>
    </section>
  );
}
