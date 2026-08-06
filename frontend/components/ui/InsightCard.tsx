interface InsightCardProps {
  type: "opportunity" | "risk" | "info";
  title: string;
  description: string;
}

export default function InsightCard({
  type,
  title,
  description,
}: InsightCardProps) {
  const colours = {
    opportunity: {
      border: "border-emerald-400/20",
      text: "text-emerald-300",
      icon: "⭐",
    },
    risk: {
      border: "border-red-400/20",
      text: "text-red-300",
      icon: "⚠",
    },
    info: {
      border: "border-cyan-400/20",
      text: "text-cyan-300",
      icon: "🧠",
    },
  };

  const style = colours[type];

  return (
    <article
      className={`rounded-2xl border ${style.border} bg-[#0a1626] p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40`}
    >
      <p className={`text-xs uppercase tracking-[0.3em] ${style.text}`}>
        {style.icon}
      </p>

      <h3 className="mt-4 text-2xl font-bold text-white">{title}</h3>

      <p className="mt-4 leading-7 text-slate-400">{description}</p>
    </article>
  );
}
