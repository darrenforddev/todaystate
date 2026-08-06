interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: SectionHeaderProps) {
  return (
    <header className="mb-8">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-400">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-4xl font-bold tracking-tight text-white">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-400">
          {subtitle}
        </p>
      )}
    </header>
  );
}
