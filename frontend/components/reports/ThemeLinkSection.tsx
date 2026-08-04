import Link from "next/link";

type ThemeLinkSectionProps = {
  themes: {
    id: string;
    name: string;
  }[];
};

export default function ThemeLinkSection({ themes }: ThemeLinkSectionProps) {
  return (
    <section className="mt-10 rounded-3xl border border-white/5 bg-[#0a1626] p-7">
      <h2 className="text-2xl font-bold">Related Themes</h2>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {themes.map((theme) => (
          <Link
            key={theme.id}
            href={`/themes/${theme.id}`}
            className="group flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3 text-slate-300 transition hover:bg-cyan-400/[0.06] hover:text-cyan-200"
          >
            <span>{theme.name}</span>

            <span className="text-cyan-300 opacity-0 transition group-hover:opacity-100">
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
