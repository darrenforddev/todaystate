type MorningSectionProps = {
  icon: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function MorningSection({
  icon,
  title,
  subtitle,
  children,
}: MorningSectionProps) {
  return (
    <section className="mt-10 border-t border-cyan-400/20 pt-8">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>

        <div>
          <h2 className="text-3xl font-black">{title}</h2>

          {subtitle && <p className="mt-1 text-slate-400">{subtitle}</p>}
        </div>
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
}
