import Link from "next/link";

type ThemeCardProps = {
  id: string;
  name: string;
  score: number;
  description: string;
};

export default function ThemeCard({
  id,
  name,
  score,
  description,
}: ThemeCardProps) {
  return (
    <Link
      href={`/themes/${id}`}
      className="group block w-full rounded-3xl border border-white/5 bg-[#0a1626] p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-xl hover:shadow-cyan-500/10"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">{name}</h3>

        <div className="rounded-full bg-cyan-400/10 px-4 py-2 font-black text-cyan-300">
          {score}
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-400">{description}</p>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-sm font-semibold text-cyan-300">
          Open Intelligence Report →
        </span>

        <span className="text-emerald-400 opacity-0 transition-opacity group-hover:opacity-100">
          ▲
        </span>
      </div>
    </Link>
  );
}
